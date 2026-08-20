package com.tienda.productos.controller;

import com.tienda.productos.dto.ClienteLoginRequest;
import com.tienda.productos.dto.ClienteLoginResponse;
import com.tienda.productos.dto.ClienteRegistroRequest;
import com.tienda.productos.service.ClienteAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cliente")
@RequiredArgsConstructor
@Tag(name = "Cliente", description = "Registro y login de clientes de la tienda")
public class ClienteAuthController {

    private final ClienteAuthService clienteAuthService;

    @PostMapping("/registro")
    @Operation(summary = "Registra una cuenta nueva de cliente")
    public ClienteLoginResponse registro(@Valid @RequestBody ClienteRegistroRequest request) {
        return clienteAuthService.registrar(request);
    }

    @PostMapping("/login")
    @Operation(summary = "Inicia sesión como cliente")
    public ClienteLoginResponse login(@Valid @RequestBody ClienteLoginRequest request) {
        return clienteAuthService.login(request);
    }
}