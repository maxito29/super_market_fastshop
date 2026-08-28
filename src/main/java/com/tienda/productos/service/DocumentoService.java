package com.tienda.productos.service;

import com.tienda.productos.entity.ApisPeruProperties;
import com.tienda.productos.exception.DocumentoConsultaException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;


import com.tienda.productos.dto.ApisPeruRawResponses.RucRaw;
import com.tienda.productos.dto.ApisPeruRawResponses.DniRaw;
import com.tienda.productos.dto.DocumentoResponses.DniConsultaResponse;
import com.tienda.productos.dto.DocumentoResponses.RucConsultaResponse;

@Service
public class DocumentoService {

    private final RestTemplate restTemplate;
    private final ApisPeruProperties propiedades;

    public DocumentoService(RestTemplate restTemplate, ApisPeruProperties propiedades) {
        this.restTemplate = restTemplate;
        this.propiedades = propiedades;
    }

    public DniConsultaResponse consultarDni(String numero) {
        if (numero == null || !numero.matches("\\d{8}")) {
            throw new DocumentoConsultaException(HttpStatus.BAD_REQUEST, "El DNI debe tener 8 dígitos.");
        }

        DniRaw raw = llamarApisPeru(propiedades.getUrl().getDni(), numero, DniRaw.class, "DNI");

        String nombreCompleto = String.join(
                " ",
                valorOVacio(raw.nombres),
                valorOVacio(raw.apellidoPaterno),
                valorOVacio(raw.apellidoMaterno)
        ).trim().replaceAll("\\s+", " ");

        if (nombreCompleto.isEmpty()) {
            throw new DocumentoConsultaException(HttpStatus.NOT_FOUND, "No se encontró información para ese DNI.");
        }

        return new DniConsultaResponse(nombreCompleto);
    }

    public RucConsultaResponse consultarRuc(String numero) {
        if (numero == null || !numero.matches("\\d{11}")) {
            throw new DocumentoConsultaException(HttpStatus.BAD_REQUEST, "El RUC debe tener 11 dígitos.");
        }

        RucRaw raw = llamarApisPeru(propiedades.getUrl().getRuc(), numero, RucRaw.class, "RUC");

        if (raw.razonSocial == null || raw.razonSocial.isBlank()) {
            throw new DocumentoConsultaException(HttpStatus.NOT_FOUND, "No se encontró información para ese RUC.");
        }

        return new RucConsultaResponse(raw.razonSocial, raw.estado, raw.condicion);
    }

    private <T> T llamarApisPeru(String urlBase, String numero, Class<T> tipoRespuesta, String etiquetaDocumento) {
        if (urlBase == null || urlBase.isBlank()) {
            throw new DocumentoConsultaException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Falta configurar apisperu.url." + etiquetaDocumento.toLowerCase() + " en application.properties.");
        }

        String url = UriComponentsBuilder
                .fromUriString(urlBase + numero)
                .queryParam("token", propiedades.getToken())
                .toUriString();

        try {
            T respuesta = restTemplate.getForObject(url, tipoRespuesta);
            if (respuesta == null) {
                throw new DocumentoConsultaException(HttpStatus.NOT_FOUND, "No se encontró información para ese " + etiquetaDocumento + ".");
            }
            return respuesta;

        } catch (HttpClientErrorException.NotFound ex) {
            throw new DocumentoConsultaException(HttpStatus.NOT_FOUND, "No se encontró información para ese " + etiquetaDocumento + ".");

        } catch (HttpClientErrorException.Unauthorized | HttpClientErrorException.Forbidden ex) {
            throw new DocumentoConsultaException(HttpStatus.BAD_GATEWAY, "El servicio de consulta de " + etiquetaDocumento + " no está disponible en este momento.");

        } catch (HttpClientErrorException | HttpServerErrorException ex) {
            throw new DocumentoConsultaException(HttpStatus.BAD_GATEWAY, "No se pudo consultar el " + etiquetaDocumento + " en este momento. Intenta nuevamente.");

        } catch (ResourceAccessException ex) {
            throw new DocumentoConsultaException(HttpStatus.GATEWAY_TIMEOUT, "El servicio de consulta de " + etiquetaDocumento + " tardó demasiado en responder.");
        }
    }

    private String valorOVacio(String valor) {
        return valor == null ? "" : valor;
    }
}