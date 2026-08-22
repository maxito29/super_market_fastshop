package com.tienda.productos.controller;

import com.tienda.productos.dto.ProveedorRequest;
import com.tienda.productos.dto.ProveedorResponse;
import com.tienda.productos.service.ProveedorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
@RequiredArgsConstructor
@Tag(name = "Proveedores", description = "Administración de proveedores")
public class ProveedorController {

    private final ProveedorService proveedorService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<ProveedorResponse> listar() {
        return proveedorService.listarTodos();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public ProveedorResponse crear(@Valid @RequestBody ProveedorRequest request) {
        return proveedorService.crear(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ProveedorResponse actualizar(@PathVariable Long id, @Valid @RequestBody ProveedorRequest request) {
        return proveedorService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desactivar(@PathVariable Long id) {
        proveedorService.desactivar(id);
    }

    @PatchMapping("/{id}/reactivar")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reactiva un proveedor previamente desactivado")
    public void reactivar(@PathVariable Long id) {
        proveedorService.reactivar(id);
    }
}
