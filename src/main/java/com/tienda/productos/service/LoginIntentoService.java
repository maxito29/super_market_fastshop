package com.tienda.productos.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginIntentoService {

    private static final int MAX_INTENTOS = 3;
    private static final int MINUTOS_VENTANA = 10;

    @Value("${brevo.destinatario.alertas}")
    private String destinatarioAlertas;

    private final BrevoService brevoService;

    public LoginIntentoService(BrevoService brevoService) {
        this.brevoService = brevoService;
    }

    private static class IntentoInfo {
        int cantidad;
        LocalDateTime primerIntento;
    }

    private final Map<String, IntentoInfo> intentosPorUsuario = new ConcurrentHashMap<>();

    public void registrarLoginExitoso(String username) {
        intentosPorUsuario.remove(username);
    }

    public void registrarLoginFallido(String username) {
        IntentoInfo info = intentosPorUsuario.compute(username, (key, actual) -> {
            LocalDateTime ahora = LocalDateTime.now();
            if (actual == null || actual.primerIntento.isBefore(ahora.minusMinutes(MINUTOS_VENTANA))) {
                IntentoInfo nuevo = new IntentoInfo();
                nuevo.cantidad = 1;
                nuevo.primerIntento = ahora;
                return nuevo;
            }
            actual.cantidad++;
            return actual;
        });

        if (info.cantidad == MAX_INTENTOS) {
            enviarAlerta(username, info.cantidad);
        }
    }

    private void enviarAlerta(String username, int cantidad) {
        String html = "<h2>Alerta de seguridad</h2>"
                + "<p>Se detectaron <b>" + cantidad + " intentos de login fallidos</b> seguidos "
                + "para el usuario <b>" + username + "</b>.</p>"
                + "<p>Si no fuiste tú, alguien podría estar intentando adivinar la contraseña de esta cuenta.</p>";

        brevoService.enviarCorreo(destinatarioAlertas, "Administrador",
                "Alerta de seguridad: intentos de login fallidos", html);
    }
}