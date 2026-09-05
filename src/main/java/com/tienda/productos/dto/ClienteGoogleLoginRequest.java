package com.tienda.productos.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClienteGoogleLoginRequest {

    @NotBlank
    private String idToken;
}