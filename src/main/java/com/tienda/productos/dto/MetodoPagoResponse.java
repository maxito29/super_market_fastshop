package com.tienda.productos.dto;

import com.tienda.productos.entity.MetodoPago;
import lombok.Getter;

@Getter
public class MetodoPagoResponse {
    private final Long id;
    private final String codigo;
    private final String nombre;

    public MetodoPagoResponse(MetodoPago metodoPago) {
        this.id = metodoPago.getId();
        this.codigo = metodoPago.getCodigo();
        this.nombre = metodoPago.getNombre();
    }
}
