package com.tienda.productos.exception;

import org.springframework.security.access.AccessDeniedException;

public class RecursoDuplicadoException extends RuntimeException {
    public RecursoDuplicadoException(String mensaje) {
        super(mensaje);
    }
}