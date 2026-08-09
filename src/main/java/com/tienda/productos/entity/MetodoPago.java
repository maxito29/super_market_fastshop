package com.tienda.productos.entity;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "metodo_pago")
@Data
public class MetodoPago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    @Column(nullable = false, length = 50)
    private String nombre;
}
