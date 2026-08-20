package com.tienda.productos.dto;

import com.tienda.productos.entity.Pedido;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
public class PedidoResponse {
    private final Long id;
    private final String numeroPedido;
    private final String estado;
    private final String modalidadEntrega;
    private final BigDecimal total;
    private final LocalDateTime fechaPedido;

    public PedidoResponse(Pedido pedido) {
        this.id = pedido.getId();
        this.numeroPedido = pedido.getNumeroPedido();
        this.estado = pedido.getEstado().getNombre();
        this.modalidadEntrega = pedido.getModalidadEntrega().name();
        this.total = pedido.getTotal();
        this.fechaPedido = pedido.getFechaPedido();
    }
}