package com.tienda.productos.dto;

import com.tienda.productos.entity.Pedido;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
public class PedidoDetalleResponse {
    private final Long id;
    private final String numeroPedido;
    private final String estado;
    private final String modalidadEntrega;
    private final String direccion;
    private final String metodoPago;
    private final String tipoComprobante;
    private final String docComprobante;
    private final String nombreComprobante;
    private final BigDecimal total;
    private final LocalDateTime fechaPedido;
    private final List<PedidoItemResponse> items;

    public PedidoDetalleResponse(Pedido pedido, List<PedidoItemResponse> items) {
        this.id = pedido.getId();
        this.numeroPedido = pedido.getNumeroPedido();
        this.estado = pedido.getEstado().getNombre();
        this.modalidadEntrega = pedido.getModalidadEntrega().name();
        this.direccion = pedido.getDireccion() != null
                ? pedido.getDireccion().getDireccion() + ", " + pedido.getDireccion().getDistrito()
                : null;
        this.metodoPago = pedido.getMetodoPago().getNombre();
        this.tipoComprobante = pedido.getTipoComprobante().name();
        this.docComprobante = pedido.getDocComprobante();
        this.nombreComprobante = pedido.getNombreComprobante();
        this.total = pedido.getTotal();
        this.fechaPedido = pedido.getFechaPedido();
        this.items = items;
    }
}