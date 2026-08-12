package com.tienda.productos.dto;

import com.tienda.productos.entity.Producto;
import lombok.Getter;

@Getter
public class ProductoStockResponse {
    private final String nombre;
    private final Integer stock;

    public ProductoStockResponse(Producto producto) {
        this.nombre = producto.getNombre();
        this.stock = producto.getStock();
    }
}