package com.tienda.productos.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pedido")
@Getter
@Setter
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_pedido", nullable = false, unique = true, length = 20)
    private String numeroPedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estado_id", nullable = false)
    private EstadoPedido estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "metodo_pago_id", nullable = false)
    private MetodoPago metodoPago;

    @Column(name = "monto_pago_efectivo", precision = 10, scale = 2)
    private BigDecimal montoPagoEfectivo;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Column(name = "fecha_pedido", nullable = false, updatable = false)
    private LocalDateTime fechaPedido;

    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;

    @PrePersist
    protected void onCreate(){
        LocalDateTime ahora = LocalDateTime.now();
        this.fechaPedido = ahora;
        this.fechaActualizacion = ahora;
    }

    @PreUpdate
    protected void onUpdate(){
        this.fechaActualizacion = LocalDateTime.now();
    }
}
