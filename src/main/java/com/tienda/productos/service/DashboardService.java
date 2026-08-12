package com.tienda.productos.service;

import com.tienda.productos.dto.CategoriaConteoResponse;
import com.tienda.productos.dto.DashboardResumenResponse;
import com.tienda.productos.dto.ProductoStockResponse;
import com.tienda.productos.repository.CategoriaRepository;
import com.tienda.productos.repository.ProductoRepository;
import com.tienda.productos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
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
}