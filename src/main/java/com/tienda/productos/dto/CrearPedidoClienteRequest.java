package com.tienda.productos.dto;

import com.tienda.productos.entity.ModalidadEntrega;
import com.tienda.productos.entity.TipoComprobante;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class CrearPedidoClienteRequest {

    @NotNull(message = "La modalidad de entrega es obligatoria")
    private ModalidadEntrega modalidadEntrega;
    private Long direccionId;
    private String direccion;
    private String distrito;
    private String referencia;

    @NotNull(message = "El método de pago es obligatorio")
    private Long metodoPagoId;

    private BigDecimal montoPagoEfectivo;

    @NotNull(message = "El tipo de comprobante es obligatorio")
    private TipoComprobante tipoComprobante = TipoComprobante.BOLETA;

    private String ruc;
    private String razonSocial;

    @NotEmpty(message = "El pedido debe tener al menos un producto")
    @Valid
    private List<ItemPedidoRequest> items;
}