package com.tienda.productos.dto;

import com.tienda.productos.entity.EstadoPedido;
import lombok.Getter;

@Getter
public class EstadoPedidoResponse {
    private final Long id;
    private final String codigo;
    private final String nombre;
    private final Integer orden;

    public EstadoPedidoResponse(EstadoPedido estadoPedido) {
        this.id = estadoPedido.getId();
        this.codigo = estadoPedido.getCodigo();
        this.nombre = estadoPedido.getNombre();
        this.orden = estadoPedido.getOrden();
    }
}
