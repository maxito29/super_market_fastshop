package com.tienda.productos.dto;

import com.tienda.productos.entity.DetallePedido;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class PedidoItemResponse {
    private final String productoNombre;
    private final Integer cantidad;
    private final BigDecimal precioUnitario;
    private final BigDecimal subtotal;

    public PedidoItemResponse(DetallePedido detalle) {
        this.productoNombre = detalle.getProducto().getNombre();
        this.cantidad = detalle.getCantidad();
        this.precioUnitario = detalle.getPrecioUnitario();
        this.subtotal = detalle.getSubtotal();
    }
}