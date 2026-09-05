package com.tienda.productos.dto;

import com.tienda.productos.entity.TipoDocumento;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClientePerfilRequest {
    private TipoDocumento tipoDocumento;
    private String numeroDocumento;

    @NotBlank
    private String nombreRazonSocial;

    private String telefono;
    private String email;
}