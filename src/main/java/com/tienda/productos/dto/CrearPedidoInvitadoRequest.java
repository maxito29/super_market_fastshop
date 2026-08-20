package com.tienda.productos.dto;

import com.tienda.productos.entity.ModalidadEntrega;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class CrearPedidoInvitadoRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El teléfono es obligatorio")
    private String telefono;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no tiene un formato válido")
    private String email;

    @NotNull(message = "La modalidad de entrega es obligatoria")
    private ModalidadEntrega modalidadEntrega;
    private String direccion;
    private String distrito;
    private String referencia;

    @NotNull(message = "El método de pago es obligatorio")
    private Long metodoPagoId;

    private BigDecimal montoPagoEfectivo;

    @NotEmpty(message = "El pedido debe tener al menos un producto")
    @Valid
    private List<ItemPedidoRequest> items;

    private com.tienda.productos.entity.TipoComprobante tipoComprobante = com.tienda.productos.entity.TipoComprobante.BOLETA;
    private String dni;
    private String ruc;
    private String razonSocial;
}