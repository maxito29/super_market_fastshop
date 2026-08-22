package com.tienda.productos.dto;

import com.tienda.productos.entity.Pedido;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
public class PedidoTrabajadorResponse {
    private final Long id;
    private final String numeroPedido;
    private final String estado;
    private final String modalidadEntrega;
    private final String clienteNombre;
    private final String clienteTelefono;
    private final String direccion;
    private final BigDecimal total;
    private final LocalDateTime fechaPedido;
    private final List<PedidoItemResponse> items;

    public PedidoTrabajadorResponse(Pedido pedido, List<PedidoItemResponse> items) {
        this.id = pedido.getId();
        this.numeroPedido = pedido.getNumeroPedido();
        this.estado = pedido.getEstado().getNombre();
        this.modalidadEntrega = pedido.getModalidadEntrega().name();
        this.clienteNombre = pedido.getCliente().getNombreRazonSocial();
        this.clienteTelefono = pedido.getCliente().getTelefono();
        this.direccion = pedido.getDireccion() != null
                ? pedido.getDireccion().getDireccion() + ", " + pedido.getDireccion().getDistrito()
                : null;
        this.total = pedido.getTotal();
        this.fechaPedido = pedido.getFechaPedido();
        this.items = items;
    }
}