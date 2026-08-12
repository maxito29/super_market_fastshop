package com.tienda.productos.dto;

import com.tienda.productos.entity.Usuario;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class UsuarioResponse {
    private final Long id;
    private final String nombre;
    private final String username;
    private final String rol;
    private final Boolean activo;
    private final LocalDateTime fechaCreacion;

    public UsuarioResponse(Usuario usuario) {
        this.id = usuario.getId();
        this.nombre = usuario.getNombre();
        this.username = usuario.getUsername();
        this.rol = usuario.getRol().getNombre();
        this.activo = usuario.getActivo();
        this.fechaCreacion = usuario.getFechaCreacion();
    }
}