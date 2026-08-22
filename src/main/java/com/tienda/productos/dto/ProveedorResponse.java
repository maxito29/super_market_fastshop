package com.tienda.productos.dto;

import com.tienda.productos.entity.Proveedor;
import lombok.Getter;

@Getter
public class ProveedorResponse {
    private final Long id;
    private final String nombre;
    private final Boolean activo;

    public ProveedorResponse(Proveedor proveedor) {
        this.id = proveedor.getId();
        this.nombre = proveedor.getNombre();
        this.activo = proveedor.getActivo();
    }
}
