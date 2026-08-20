package com.tienda.productos.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ClienteLoginResponse {
    private String token;
    private String numeroDocumento;
    private String nombreRazonSocial;
    private String email;
}