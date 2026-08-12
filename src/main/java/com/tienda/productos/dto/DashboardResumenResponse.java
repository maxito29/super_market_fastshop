package com.tienda.productos.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class DashboardResumenResponse {
    private long totalProductos;
    private long totalCategorias;
    private long totalTrabajadores;
    private long productosStockBajo;
    private List<CategoriaConteoResponse> productosPorCategoria;
    private List<ProductoStockResponse> topProductosStock;
}