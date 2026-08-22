package com.tienda.productos.service;

import com.tienda.productos.entity.Cliente;
import com.tienda.productos.entity.ClientePasswordResetToken;
import com.tienda.productos.repository.ClientePasswordResetTokenRepository;
import com.tienda.productos.repository.ClienteRepository;
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
public class ClienteRecuperacionPasswordService {

    private static final int MINUTOS_EXPIRACION = 30;
    private static final int LONGITUD_CODIGO = 6;
    private static final String CARACTERES_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private final ClienteRepository clienteRepository;
    private final ClientePasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final BrevoService brevoService;

    public void solicitarRecuperacion(String email) {
        Optional<Cliente> clienteOpt = clienteRepository.findByEmail(email);

        if (clienteOpt.isEmpty()) {
            return;
        }

        Cliente cliente = clienteOpt.get();

        if (cliente.getPassword() == null) {
            String html = "<h2>Todavía no tienes contraseña</h2>"
                    + "<p>Hola " + cliente.getNombreRazonSocial() + ", vimos que compraste como invitado antes.</p>"
                    + "<p>Si quieres guardar tu historial y comprar más rápido la próxima vez, "
                    + "crea tu contraseña registrándote con este mismo correo.</p>";
            brevoService.enviarCorreo(cliente.getEmail(), cliente.getNombreRazonSocial(),
                    "Crea tu contraseña - Supermercado", html);
            return;
        }

        ClientePasswordResetToken resetToken = new ClientePasswordResetToken();
        resetToken.setCliente(cliente);
        resetToken.setToken(generarCodigoUnico());
        resetToken.setFechaExpiracion(LocalDateTime.now().plusMinutes(MINUTOS_EXPIRACION));
        resetToken.setUsado(false);
        tokenRepository.save(resetToken);

        String html = "<h2>Recupera tu contraseña</h2>"
                + "<p>Hola " + cliente.getNombreRazonSocial() + ", solicitaste restablecer tu contraseña.</p>"
                + "<p>Este es tu código (válido por " + MINUTOS_EXPIRACION + " minutos):</p>"
                + "<h1 style='letter-spacing:4px;font-size:2rem'>" + resetToken.getToken() + "</h1>"
                + "<p>Si no fuiste tú, ignora este correo.</p>";

        brevoService.enviarCorreo(cliente.getEmail(), cliente.getNombreRazonSocial(),
                "Recuperar contraseña - Supermercado", html);
    }

    public void restablecerPassword(String token, String nuevaPassword) {
        String codigoNormalizado = token.trim().toUpperCase();

        ClientePasswordResetToken resetToken = tokenRepository.findByTokenAndUsadoFalse(codigoNormalizado)
                .orElseThrow(() -> new IllegalArgumentException("El código no es válido o ya fue usado"));

        if (resetToken.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("El código expiró, solicita uno nuevo");
        }

        Cliente cliente = resetToken.getCliente();
        cliente.setPassword(passwordEncoder.encode(nuevaPassword));
        clienteRepository.save(cliente);

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