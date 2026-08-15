package com.tienda.productos.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BrevoService {

    private static final String BREVO_URL = "https://api.brevo.com/v3/smtp/email";

    @Value("${brevo.api.key}")
    private String apiKey;

    @Value("${brevo.remitente.email}")
    private String remitenteEmail;

    @Value("${brevo.remitente.nombre}")
    private String remitenteNombre;

    private final RestTemplate restTemplate = new RestTemplate();

    public void enviarCorreo(String destinatarioEmail, String destinatarioNombre, String asunto, String htmlContent) {
        Map<String, Object> sender = new HashMap<>();
        sender.put("name", remitenteNombre);
        sender.put("email", remitenteEmail);

        Map<String, Object> destinatario = new HashMap<>();
        destinatario.put("email", destinatarioEmail);
        destinatario.put("name", destinatarioNombre);

        Map<String, Object> body = new HashMap<>();
        body.put("sender", sender);
        body.put("to", List.of(destinatario));
        body.put("subject", asunto);
        body.put("htmlContent", htmlContent);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", apiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            restTemplate.postForObject(BREVO_URL, request, String.class);
        } catch (Exception e) {
            System.err.println("Error enviando correo con Brevo: " + e.getMessage());
        }
    }
}