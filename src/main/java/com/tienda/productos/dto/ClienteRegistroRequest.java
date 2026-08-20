package com.tienda.productos.dto;

import com.tienda.productos.entity.TipoDocumento;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClienteRegistroRequest {

    @NotNull(message = "El tipo de documento es obligatorio")
    private TipoDocumento tipoDocumento;

    @NotBlank(message = "El número de documento es obligatorio")
    @Size(min = 8, max = 15, message = "El número de documento no es válido")
    private String numeroDocumento;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombreRazonSocial;

    private String direccion;

    @NotBlank(message = "El teléfono es obligatorio")
    private String telefono;

    @Email(message = "El correo no tiene un formato válido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;
}