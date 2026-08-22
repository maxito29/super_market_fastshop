package com.tienda.productos.controller;

import com.tienda.productos.dto.*;
import com.tienda.productos.service.ClienteAuthService;
import com.tienda.productos.service.ClienteRecuperacionPasswordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cliente")
@RequiredArgsConstructor
@Tag(name = "Cliente", description = "Registro, login y recuperación de contraseña de clientes")
public class ClienteAuthController {

    private final ClienteAuthService clienteAuthService;
    private final ClienteRecuperacionPasswordService clienteRecuperacionPasswordService;

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

    @PostMapping("/olvide-password")
    @Operation(summary = "Envía un código de recuperación al correo del cliente, si existe")
    public Map<String, String> olvidePassword(@Valid @RequestBody OlvidePasswordRequest request) {
        clienteRecuperacionPasswordService.solicitarRecuperacion(request.getEmail());
        return Map.of("mensaje", "Si el correo existe en el sistema, te enviamos instrucciones");
    }

    @PostMapping("/restablecer-password")
    @Operation(summary = "Cambia la contraseña del cliente usando el código recibido por correo")
    public Map<String, String> restablecerPassword(@Valid @RequestBody RestablecerPasswordRequest request) {
        clienteRecuperacionPasswordService.restablecerPassword(request.getToken(), request.getNuevaPassword());
        return Map.of("mensaje", "Contraseña actualizada correctamente");
    }
}