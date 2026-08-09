package com.tienda.productos.entity;


import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "historial_estado_pedido")
@Data
public class HistorialEstadoPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estado_id", nullable = false)
    private EstadoPedido estado;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fecha;

    @Column(length = 255)
    private String comentario;

    @PrePersist
    protected void onCreate(){
        this.fecha = LocalDateTime.now();
    }
}
