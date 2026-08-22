package com.tienda.productos.repository;

import com.tienda.productos.entity.Pedido;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    Optional<Pedido> findByNumeroPedido(String numeroPedido);

    List<Pedido> findByCliente_NumeroDocumentoOrderByFechaPedidoDesc(String numeroDocumento);
    java.util.List<com.tienda.productos.entity.Pedido> findByClienteIdOrderByFechaPedidoDesc(Long clienteId);
    java.util.List<com.tienda.productos.entity.Pedido> findByEstado_CodigoAndPickerUsuarioIsNull(String codigo);
    java.util.List<com.tienda.productos.entity.Pedido> findByPickerUsuarioIdAndEstado_Codigo(Long pickerUsuarioId, String codigo);
    java.util.List<com.tienda.productos.entity.Pedido> findByEstado_Codigo(String codigo);
    java.util.List<com.tienda.productos.entity.Pedido> findByEstado_CodigoAndRepartidorUsuarioIsNull(String codigo);
    java.util.List<com.tienda.productos.entity.Pedido> findByRepartidorUsuarioIdAndEstado_Codigo(Long repartidorUsuarioId, String codigo);

    @Query("SELECT p FROM Pedido p WHERE " +
            "UPPER(p.numeroPedido) = UPPER(:valor) " +
            "OR p.docComprobante = :valor " +
            "OR p.cliente.telefono = :valor " +
            "ORDER BY p.fechaPedido DESC")
    Page<Pedido> buscarPorNumeroDocOTelefono(@Param("valor") String valor, Pageable pageable);
}