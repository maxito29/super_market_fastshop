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

    @Enumerated(EnumType.STRING)
    @Column(name = "modalidad_entrega", nullable = false, length = 20)
    private ModalidadEntrega modalidadEntrega = ModalidadEntrega.RECOJO_TIENDA;

    // Solo aplica cuando la modalidad es DELIVERY
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "direccion_id")
    private DireccionCliente direccion;

    // Se asignan despues, cuando construyamos los paneles de picker/repartidor
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "picker_usuario_id")
    private Usuario pickerUsuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repartidor_usuario_id")
    private Usuario repartidorUsuario;

    @Column(name = "monto_pago_efectivo", precision = 10, scale = 2)
    private BigDecimal montoPagoEfectivo;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    // --- Datos del comprobante: una "foto" tomada al momento exacto de la venta,
    // no cambia aunque el cliente edite su perfil despues ---
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_comprobante", nullable = false, length = 10)
    private TipoComprobante tipoComprobante = TipoComprobante.BOLETA;

    @Column(name = "doc_comprobante", nullable = false, length = 15)
    private String docComprobante = "00000000";

    @Column(name = "nombre_comprobante", nullable = false, length = 200)
    private String nombreComprobante = "Clientes Varios";

    @Column(name = "ruc_comprobante", length = 11)
    private String rucComprobante;

    @Column(name = "razon_social_comprobante", length = 200)
    private String razonSocialComprobante;

    @Column(name = "fecha_pedido", nullable = false, updatable = false)
    private LocalDateTime fechaPedido;

    @Column(name = "fecha_actualizacion", nullable = false)
    private LocalDateTime fechaActualizacion;

    @PrePersist
    protected void onCreate() {
        LocalDateTime ahora = LocalDateTime.now();
        this.fechaPedido = ahora;
        this.fechaActualizacion = ahora;
    }

    @PreUpdate
    protected void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }
}