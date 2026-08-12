package com.tienda.productos.dto;

import com.tienda.productos.entity.Rol;
import lombok.Getter;

@Getter
public class RolResponse {
    private final Long id;
    private final String nombre;

    public RolResponse(Rol rol) {
        this.id = rol.getId();
        this.nombre = rol.getNombre();
    }
}