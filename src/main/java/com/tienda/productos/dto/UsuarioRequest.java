package com.tienda.productos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UsuarioRequest {

    @NotNull(message = "El rol es obligatorio")
    private Long rolId;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El username es obligatorio")
    private String username;

    // Obligatorio al crear. Al actualizar, si se deja vacío se conserva el password actual.
    private String password;
}