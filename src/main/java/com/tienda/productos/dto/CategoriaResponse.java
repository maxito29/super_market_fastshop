package com.tienda.productos.dto;

import com.tienda.productos.entity.Categoria;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class CategoriaResponse {
    private final Long id;
    private final String nombre;
    private final String descripcion;
    private final Boolean activo;
    private final LocalDateTime fechaCreacion;

    public CategoriaResponse(Categoria categoria) {
        this.id = categoria.getId();
        this.nombre = categoria.getNombre();
        this.descripcion = categoria.getDescripcion();
        this.activo = categoria.getActivo();
        this.fechaCreacion = categoria.getFechaCreacion();
    }
}