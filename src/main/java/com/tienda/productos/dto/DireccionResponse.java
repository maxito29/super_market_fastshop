package com.tienda.productos.dto;

import com.tienda.productos.entity.DireccionCliente;
import lombok.Getter;

@Getter
public class DireccionResponse {
    private final Long id;
    private final String direccion;
    private final String distrito;
    private final String referencia;
    private final Boolean predeterminada;

    public DireccionResponse(DireccionCliente d) {
        this.id = d.getId();
        this.direccion = d.getDireccion();
        this.distrito = d.getDistrito();
        this.referencia = d.getReferencia();
        this.predeterminada = d.getPredeterminada();
    }
}