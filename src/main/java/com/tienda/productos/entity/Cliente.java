package com.tienda.productos.entity;


import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "cliente")
@Data
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_documento", nullable = false, length = 3)
    private TipoDocumento tipoDocumento;

    @Column(name = "numero_documento", nullable = false, length = 15)
    private String numeroDocumento;

    @Column(name = "nombre_razon_social", nullable = false, length = 200)
    private String nombreRazonSocial;

    @Column(length = 254)
    private String direccion;

    @Column(nullable = false, length = 20)
    private String telefono;

    @Column(length = 150)
    private String email;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void onCreate(){
        this.fechaCreacion = LocalDateTime.now();
    }
}
