package com.tienda.productos.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CrearPedidoRequest {
    private String tipoDocumento;
    private String numeroDocumento;
    private String nombreRazonSocial;
    private String direccion;
    private String telefono;
    private String email;

    private String metodoPagoCodigo;
    private BigDecimal montoPagoEfectivo;

    private List<ItemPedidoRequest> items;
}
