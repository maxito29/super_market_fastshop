package com.tienda.productos.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DireccionRequest {
    @NotBlank
    private String direccion;

    @NotBlank
    private String distrito;

    private String referencia;
    private Boolean predeterminada;
}