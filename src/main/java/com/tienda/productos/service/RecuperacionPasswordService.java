package com.tienda.productos.service;

import com.tienda.productos.entity.PasswordResetToken;
import com.tienda.productos.entity.Usuario;
import com.tienda.productos.repository.PasswordResetTokenRepository;
import com.tienda.productos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class RecuperacionPasswordService {

    private static final int MINUTOS_EXPIRACION = 30;

    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final BrevoService brevoService;

    public void solicitarRecuperacion(String email) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);

        if (usuarioOpt.isEmpty()) {
            return;
        }

        Usuario usuario = usuarioOpt.get();

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUsuario(usuario);
        resetToken.setToken(UUID.randomUUID().toString());
        resetToken.setFechaExpiracion(LocalDateTime.now().plusMinutes(MINUTOS_EXPIRACION));
        resetToken.setUsado(false);
        tokenRepository.save(resetToken);

        String html = "<h2>Recupera tu contraseña</h2>"
                + "<p>Hola " + usuario.getNombre() + ", solicitaste restablecer tu contraseña.</p>"
                + "<p>Usa este código en la app (válido por " + MINUTOS_EXPIRACION + " minutos):</p>"
                + "<h1 style='letter-spacing:2px'>" + resetToken.getToken() + "</h1>"
                + "<p>Si no fuiste tú, ignora este correo.</p>";

        brevoService.enviarCorreo(usuario.getEmail(), usuario.getNombre(), "Recuperar contraseña - Supermercado", html);
    }

    public void restablecerPassword(String token, String nuevaPassword) {
        PasswordResetToken resetToken = tokenRepository.findByTokenAndUsadoFalse(token)
                .orElseThrow(() -> new IllegalArgumentException("El código no es válido o ya fue usado"));

        if (resetToken.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("El código expiró, solicita uno nuevo");
        }

        Usuario usuario = resetToken.getUsuario();
        usuario.setPassword(passwordEncoder.encode(nuevaPassword));
        usuarioRepository.save(usuario);

        resetToken.setUsado(true);
        tokenRepository.save(resetToken);
    }
}