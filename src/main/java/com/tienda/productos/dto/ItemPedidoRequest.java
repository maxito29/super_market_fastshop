package com.tienda.productos.dto;

import lombok.Data;

@Data
public class ItemPedidoRequest
{
    private  Long productoId;
    private  Integer cantidad;
}
