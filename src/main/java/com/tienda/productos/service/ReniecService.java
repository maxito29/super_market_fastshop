package com.tienda.productos.service;

import com.tienda.productos.exception.RecursoNoEncontradoException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class ReniecService {

    private static final String RENIEC_URL = "https://api.decolecta.com/v1/reniec/dni?numero=";

    @Value("${decolecta.api.token}")
    private String token;

    private final RestTemplate restTemplate = new RestTemplate();

    public String consultarNombreCompleto(String dni) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        HttpEntity<Void> peticion = new HttpEntity<>(headers);

        try {
            Map<String, Object> respuesta = restTemplate.exchange(
                    RENIEC_URL + dni,
                    org.springframework.http.HttpMethod.GET,
                    peticion,
                    Map.class
            ).getBody();

            if (respuesta == null || respuesta.get("full_name") == null) {
                throw new RecursoNoEncontradoException("No se encontró información para el DNI " + dni);
            }

            return String.valueOf(respuesta.get("full_name"));

        } catch (RestClientException ex) {
            throw new RecursoNoEncontradoException("No se pudo consultar el DNI en este momento");
        }
    }
}
