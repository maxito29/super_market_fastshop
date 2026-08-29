package com.tienda.productos.controller;

import com.tienda.productos.dto.CategoriaRequest;
import com.tienda.productos.dto.CategoriaResponse;
import com.tienda.productos.service.CategoriaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
@Tag(name = "Categorías", description = "Catálogo público (GET) y administración (POST/PUT/DELETE, solo ADMIN)")
public class CategoriaController {

    private final CategoriaService categoriaService;

    @GetMapping
    public List<CategoriaResponse> listar() {
        return categoriaService.listarActivas();
    }

    @GetMapping("/admin/todas")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lista todas las categorías, incluyendo las inactivas (solo ADMIN)")
    public List<CategoriaResponse> listarTodas() {
        return categoriaService.listarTodas();
    }

    // CAMBIO 1: Ahora es público, no requiere @PreAuthorize y llama a obtenerPublicaPorId
    @GetMapping("/{id}")
    @Operation(summary = "Detalle público de una categoría activa (catálogo de la tienda)")
    public CategoriaResponse obtener(@PathVariable Long id) {
        return categoriaService.obtenerPublicaPorId(id);
    }

    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Detalle de una categoría para administración, incluye inactivas")
    public CategoriaResponse obtenerAdmin(@PathVariable Long id) {
        return categoriaService.obtenerPorId(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public CategoriaResponse crear(@Valid @RequestBody CategoriaRequest request) {
        return categoriaService.crear(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public CategoriaResponse actualizar(@PathVariable Long id, @Valid @RequestBody CategoriaRequest request) {
        return categoriaService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Desactiva la categoría (borrado lógico)")
    public void eliminar(@PathVariable Long id) {
        categoriaService.eliminar(id);
    }

    @PatchMapping("/{id}/reactivar")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reactiva una categoría previamente desactivada")
    public void reactivar(@PathVariable Long id) {
        categoriaService.reactivar(id);
    }
}
