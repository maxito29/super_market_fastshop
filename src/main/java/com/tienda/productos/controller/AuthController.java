package com.tienda.productos.controller;

import com.tienda.productos.dto.LoginRequest;
import com.tienda.productos.dto.LoginResponse;
import com.tienda.productos.dto.OlvidePasswordRequest;
import com.tienda.productos.dto.RestablecerPasswordRequest;
import com.tienda.productos.entity.Usuario;
import com.tienda.productos.security.JwtService;
import com.tienda.productos.service.RecuperacionPasswordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Login del panel admin y de los paneles de trabajadores")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RecuperacionPasswordService recuperacionPasswordService;

    @PostMapping("/login")
    @Operation(summary = "Autentica un usuario (admin, picker o repartidor) ")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        Usuario usuario = (Usuario) auth.getPrincipal();
        String token = jwtService.generarToken(usuario);

        return new LoginResponse(
                token,
                usuario.getUsername(),
                usuario.getNombre(),
                usuario.getRol().getNombre()
        );
    }

    @GetMapping("/usuario")
    @Operation(summary = "Devuelve los datos del usuario autenticado a partir de su JWT")
    public LoginResponse me(@AuthenticationPrincipal Usuario usuario) {
        return new LoginResponse(null, usuario.getUsername(), usuario.getNombre(), usuario.getRol().getNombre());
    }

    @PostMapping("/olvide-password")
    @Operation(summary = "Envia un codigo de recuperacion al correo del usuario, si existe")
    public java.util.Map<String, String> olvidePassword(@Valid @RequestBody OlvidePasswordRequest request) {
        recuperacionPasswordService.solicitarRecuperacion(request.getEmail());
        return java.util.Map.of("mensaje", "Si el correo existe en el sistema, te enviamos un código de recuperación");
    }

    @PostMapping("/restablecer-password")
    @Operation(summary = "Cambia la contraseña usando el codigo recibido por correo")
    public java.util.Map<String, String> restablecerPassword(@Valid @RequestBody RestablecerPasswordRequest request) {
        recuperacionPasswordService.restablecerPassword(request.getToken(), request.getNuevaPassword());
        return java.util.Map.of("mensaje", "Contraseña actualizada correctamente");
    }
}