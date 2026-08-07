package com.tienda.productos.repository;

import com.tienda.productos.entity.HistorialEstadoPedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistorialEstadoPedidoRepository extends JpaRepository<HistorialEstadoPedido, Long> {

    List<HistorialEstadoPedido> findByPedidoIdOrderByFechaAsc(Long pedidoId);
}
