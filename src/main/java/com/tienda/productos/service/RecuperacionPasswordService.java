package com.tienda.productos.service;

import com.tienda.productos.entity.PasswordResetToken;
import com.tienda.productos.entity.Usuario;
import com.tienda.productos.repository.PasswordResetTokenRepository;
import com.tienda.productos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class RecuperacionPasswordService {

    private static final int MINUTOS_EXPIRACION = 30;
    private static final int LONGITUD_CODIGO = 6;
    private static final String CARACTERES_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

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
        resetToken.setToken(generarCodigoUnico());
        resetToken.setFechaExpiracion(LocalDateTime.now().plusMinutes(MINUTOS_EXPIRACION));
        resetToken.setUsado(false);
        tokenRepository.save(resetToken);

        String html = "<h2>Recupera tu contraseña</h2>"
                + "<p>Hola " + usuario.getNombre() + ", solicitaste restablecer tu contraseña.</p>"
                + "<p>Este es tu código (válido por " + MINUTOS_EXPIRACION + " minutos):</p>"
                + "<h1 style='letter-spacing:4px;font-size:2rem'>" + resetToken.getToken() + "</h1>"
                + "<p>Si no fuiste tú, ignora este correo.</p>";

        brevoService.enviarCorreo(usuario.getEmail(), usuario.getNombre(), "Recuperar contraseña - Supermercado", html);
    }

    public void restablecerPassword(String token, String nuevaPassword) {
        String codigoNormalizado = token.trim().toUpperCase();

        PasswordResetToken resetToken = tokenRepository.findByTokenAndUsadoFalse(codigoNormalizado)
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

    private String generarCodigoUnico() {
        String codigo;
        do {
            codigo = generarCodigoAleatorio();
        } while (tokenRepository.findByTokenAndUsadoFalse(codigo).isPresent());
        return codigo;
    }

    private String generarCodigoAleatorio() {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(LONGITUD_CODIGO);
        for (int i = 0; i < LONGITUD_CODIGO; i++) {
            sb.append(CARACTERES_CODIGO.charAt(random.nextInt(CARACTERES_CODIGO.length())));
        }
        return sb.toString();
    }
}