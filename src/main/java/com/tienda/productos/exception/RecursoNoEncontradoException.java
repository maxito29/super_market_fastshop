package com.tienda.productos.exception;

import org.springframework.security.access.AccessDeniedException;

public class RecursoNoEncontradoException extends RuntimeException {
    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}