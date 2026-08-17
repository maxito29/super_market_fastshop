package com.tienda.productos.service;

import com.tienda.productos.dto.ProductoRequest;
import com.tienda.productos.dto.ProductoResponse;
import com.tienda.productos.entity.Categoria;
import com.tienda.productos.entity.Producto;
import com.tienda.productos.exception.RecursoDuplicadoException;
import com.tienda.productos.exception.RecursoNoEncontradoException;
import com.tienda.productos.repository.CategoriaRepository;
import com.tienda.productos.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final ExcelReporteService excelReporteService;

    public List<ProductoResponse> listarActivos() {
        return productoRepository.findByActivoTrue().stream().map(ProductoResponse::new).toList();
    }

    public List<ProductoResponse> listarPorCategoria(Long categoriaId) {
        return productoRepository.findByCategoriaId(categoriaId).stream().map(ProductoResponse::new).toList();
    }

    public List<ProductoResponse> listarTodos() {
        return productoRepository.findAll().stream().map(ProductoResponse::new).toList();
    }

    public ProductoResponse obtenerPorId(Long id) {
        return new ProductoResponse(buscarEntidad(id));
    }

    @Transactional
    public ProductoResponse crear(ProductoRequest request) {
        Categoria categoria = buscarCategoria(request.getCategoriaId());

        Producto producto = new Producto();
        producto.setCategoria(categoria);
        producto.setNombre(request.getNombre());
        producto.setDescripcion(request.getDescripcion());
        producto.setPrecio(request.getPrecio());
        producto.setStock(request.getStock());
        producto.setImagenUrl(request.getImagenUrl());

        boolean generarCodigo = request.getCodigo() == null || request.getCodigo().isBlank();
        String codigoInicial = generarCodigo ? "TEMP-" + System.currentTimeMillis() : request.getCodigo();

        if (!generarCodigo && productoRepository.findByCodigo(codigoInicial).isPresent()) {
            throw new RecursoDuplicadoException("Ya existe un producto con el código '" + codigoInicial + "'");
        }

        producto.setCodigo(codigoInicial);
        producto = productoRepository.save(producto);

        if (generarCodigo) {
            producto.setCodigo("PRD-" + producto.getId());
            producto = productoRepository.save(producto);
        }

        return new ProductoResponse(producto);
    }

    @Transactional
    public ProductoResponse actualizar(Long id, ProductoRequest request) {
        Producto producto = buscarEntidad(id);
        Categoria categoria = buscarCategoria(request.getCategoriaId());

        if (request.getCodigo() != null && !request.getCodigo().isBlank()
                && !request.getCodigo().equals(producto.getCodigo())
                && productoRepository.findByCodigo(request.getCodigo()).isPresent()) {
            throw new RecursoDuplicadoException("Ya existe un producto con el código '" + request.getCodigo() + "'");
        }

        producto.setCategoria(categoria);
        producto.setNombre(request.getNombre());
        producto.setDescripcion(request.getDescripcion());
        producto.setPrecio(request.getPrecio());
        producto.setStock(request.getStock());
        producto.setImagenUrl(request.getImagenUrl());
        if (request.getCodigo() != null && !request.getCodigo().isBlank()) {
            producto.setCodigo(request.getCodigo());
        }

        return new ProductoResponse(productoRepository.save(producto));
    }

    @Transactional
    public void eliminar(Long id) {
        Producto producto = buscarEntidad(id);
        producto.setActivo(false);
        productoRepository.save(producto);
    }

    private Producto buscarEntidad(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto con id " + id + " no encontrado"));
    }

    private Categoria buscarCategoria(Long categoriaId) {
        return categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría con id " + categoriaId + " no encontrada"));
    }

    @Transactional
    public void reactivar(Long id) {
        Producto producto = buscarEntidad(id);
        producto.setActivo(true);
        productoRepository.save(producto);
    }

    @Transactional(readOnly = true)
    public byte[] exportarExcel() throws java.io.IOException {
        return excelReporteService.generarExcelProductos(productoRepository.findAll());
    }
}