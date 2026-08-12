package com.tienda.productos.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CategoriaConteoResponse {
    private String categoria;
    private Long cantidad;
}