package com.tienda.productos.entity;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "estado_pedido")
@Data
public class EstadoPedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String codigo;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(nullable = false)
    private Integer orden;

}
