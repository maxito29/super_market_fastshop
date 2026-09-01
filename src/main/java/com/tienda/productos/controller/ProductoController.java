package com.tienda.productos.controller;

import com.tienda.productos.dto.ProductoRequest;
import com.tienda.productos.dto.ProductoResponse;
import com.tienda.productos.service.ProductoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
@Tag(name = "Productos", description = "Catálogo público (GET) y administración (POST/PUT/DELETE, solo ADMIN)")
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    public List<ProductoResponse> listar() {
        return productoService.listarActivos();
    }

    @GetMapping("/categoria/{categoriaId}")
    public List<ProductoResponse> listarPorCategoria(@PathVariable Long categoriaId) {
        return productoService.listarPorCategoria(categoriaId);
    }

    @GetMapping("/buscar")
    @Operation(summary = "Busca productos activos cuyo nombre contenga el texto indicado")
    public List<ProductoResponse> buscar(@RequestParam(name = "q", defaultValue = "") String q) {
        return productoService.buscarPorNombre(q);
    }

    @GetMapping("/destacados")
    @Operation(summary = "Productos activos marcados como destacados, para la vitrina 'Lo mejor de la semana'")
    public List<ProductoResponse> listarDestacados() {
        return productoService.listarDestacados();
    }

    @GetMapping("/admin/todos")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lista todos los productos, incluyendo los inactivos (solo ADMIN)")
    public List<ProductoResponse> listarTodos() {
        return productoService.listarTodos();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalle público de un producto activo (página de producto de la tienda)")
    public ProductoResponse obtener(@PathVariable Long id) {
        return productoService.obtenerPublicoPorId(id);
    }

    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Detalle de un producto para administración, incluye inactivos")
    public ProductoResponse obtenerAdmin(@PathVariable Long id) {
        return productoService.obtenerPorId(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductoResponse crear(@Valid @RequestBody ProductoRequest request) {
        return productoService.crear(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ProductoResponse actualizar(@PathVariable Long id, @Valid @RequestBody ProductoRequest request) {
        return productoService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Desactiva el producto (borrado lógico, no se elimina de la BD)")
    public void eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
    }

    @PatchMapping("/{id}/reactivar")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reactiva un producto previamente desactivado")
    public void reactivar(@PathVariable Long id) {
        productoService.reactivar(id);
    }

    @PatchMapping("/{id}/destacado")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Marca o quita un producto de la vitrina de destacados")
    public void marcarDestacado(@PathVariable Long id, @RequestParam boolean valor) {
        productoService.marcarDestacado(id, valor);
    }

    @GetMapping("/exportar/excel")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Descarga un Excel (.xlsx) con todos los productos")
    public org.springframework.http.ResponseEntity<byte[]> exportarExcel() throws java.io.IOException {
        byte[] excel = productoService.exportarExcel();

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "productos.xlsx");

        return org.springframework.http.ResponseEntity.ok().headers(headers).body(excel);
    }
}