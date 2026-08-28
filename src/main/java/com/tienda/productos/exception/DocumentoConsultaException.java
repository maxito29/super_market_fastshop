package com.tienda.productos.exception;

import org.springframework.http.HttpStatus;

public class DocumentoConsultaException extends RuntimeException {

    private final HttpStatus status;

    public DocumentoConsultaException(HttpStatus status, String mensaje) {
        super(mensaje);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
