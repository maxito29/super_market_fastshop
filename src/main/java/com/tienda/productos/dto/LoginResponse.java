package com.tienda.productos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String username;
    private String nombre;
    private String rol;
}
