package com.tienda.productos.service;

import com.tienda.productos.dto.CategoriaConteoResponse;
import com.tienda.productos.dto.DashboardResumenResponse;
import com.tienda.productos.dto.ProductoStockResponse;
import com.tienda.productos.entity.Producto;
import com.tienda.productos.repository.CategoriaRepository;
import com.tienda.productos.repository.ProductoRepository;
import com.tienda.productos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private static final int UMBRAL_STOCK_BAJO = 20;

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;
    private final BrevoService brevoService;

    @Value("${brevo.destinatario.alertas}")
    private String destinatarioAlertas;

    public DashboardResumenResponse obtenerResumen() {
        long totalProductos = productoRepository.countByActivoTrue();
        long totalCategorias = categoriaRepository.countByActivoTrue();
        long totalTrabajadores = usuarioRepository.countByActivoTrue();
        long productosStockBajo = productoRepository.countByActivoTrueAndStockLessThan(UMBRAL_STOCK_BAJO);

        List<CategoriaConteoResponse> productosPorCategoria = productoRepository.contarProductosPorCategoria()
                .stream()
                .map(fila -> new CategoriaConteoResponse((String) fila[0], (Long) fila[1]))
                .toList();

        List<ProductoStockResponse> topProductosStock = productoRepository.findTop5ByActivoTrueOrderByStockDesc()
                .stream()
                .map(ProductoStockResponse::new)
                .toList();

        return new DashboardResumenResponse(
                totalProductos, totalCategorias, totalTrabajadores, productosStockBajo,
                productosPorCategoria, topProductosStock
        );
    }

    public int enviarAlertaStockBajo() {
        List<Producto> productosStockBajo = productoRepository.findByActivoTrueAndStockLessThanOrderByStockAsc(UMBRAL_STOCK_BAJO);

        if (productosStockBajo.isEmpty()) {
            return 0;
        }

        StringBuilder html = new StringBuilder();
        html.append("<h2>Alerta de stock bajo</h2>");
        html.append("<p>Los siguientes productos tienen menos de ").append(UMBRAL_STOCK_BAJO).append(" unidades:</p>");
        html.append("<ul>");
        for (Producto p : productosStockBajo) {
            html.append("<li><b>").append(p.getNombre()).append("</b> — ")
                    .append(p.getStock()).append(" unidades (categoria: ")
                    .append(p.getCategoria().getNombre()).append(")</li>");
        }
        html.append("</ul>");

        brevoService.enviarCorreo(
                destinatarioAlertas,
                "Administrador",
                "Alerta: " + productosStockBajo.size() + " productos con stock bajo",
                html.toString()
        );

        return productosStockBajo.size();
    }
}