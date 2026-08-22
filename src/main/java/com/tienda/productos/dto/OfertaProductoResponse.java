package com.tienda.productos.dto;

import com.tienda.productos.entity.OfertaProducto;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class OfertaProductoResponse {
    private final Long ofertaId;
    private final Long proveedorId;
    private final String proveedorNombre;
    private final BigDecimal precio;
    private final Integer stock;

    public OfertaProductoResponse(OfertaProducto oferta) {
        this.ofertaId = oferta.getId();
        this.proveedorId = oferta.getProveedor().getId();
        this.proveedorNombre = oferta.getProveedor().getNombre();
        this.precio = oferta.getPrecio();
        this.stock = oferta.getStock();
    }
}
