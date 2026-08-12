package com.tienda.productos.controller;

import com.tienda.productos.dto.UsuarioRequest;
import com.tienda.productos.dto.UsuarioResponse;
import com.tienda.productos.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Usuarios (trabajadores)", description = "Gestión de trabajadores del admin: vendedores, pickers y repartidores. Solo ADMIN.")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public List<UsuarioResponse> listar() {
        return usuarioService.listarTodos();
    }

    @GetMapping("/{id}")
    public UsuarioResponse obtener(@PathVariable Long id) {
        return usuarioService.obtenerPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponse crear(@Valid @RequestBody UsuarioRequest request) {
        return usuarioService.crear(request);
    }

    @PutMapping("/{id}")
    public UsuarioResponse actualizar(@PathVariable Long id, @Valid @RequestBody UsuarioRequest request) {
        return usuarioService.actualizar(id, request);
    }

    @PatchMapping("/{id}/desactivar")
    @Operation(summary = "Desactiva al trabajador (no puede volver a loguearse, pero se conserva su historial)")
    public void desactivar(@PathVariable Long id) {
        usuarioService.desactivar(id);
    }

    @PatchMapping("/{id}/reactivar")
    public void reactivar(@PathVariable Long id) {
        usuarioService.reactivar(id);
    }
}