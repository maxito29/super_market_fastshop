package com.tienda.productos.dto;

import com.tienda.productos.entity.Producto;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
public class ProductoResponse {
    private final Long id;
    private final Long categoriaId;
    private final String categoriaNombre;
    private final String codigo;
    private final String nombre;
    private final String descripcion;
    private final BigDecimal precio;
    private final Integer stock;
    private final String imagenUrl;
    private final Boolean activo;
    private final Boolean destacado;
    private final LocalDateTime fechaCreacion;

    public ProductoResponse(Producto producto) {
        this.id = producto.getId();
        this.categoriaId = producto.getCategoria().getId();
        this.categoriaNombre = producto.getCategoria().getNombre();
        this.codigo = producto.getCodigo();
        this.nombre = producto.getNombre();
        this.descripcion = producto.getDescripcion();
        this.precio = producto.getPrecio();
        this.stock = producto.getStock();
        this.imagenUrl = producto.getImagenUrl();
        this.activo = producto.getActivo();
        this.destacado = producto.getDestacado();
        this.fechaCreacion = producto.getFechaCreacion();
    }
}