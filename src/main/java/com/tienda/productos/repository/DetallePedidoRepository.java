package com.tienda.productos.repository;

import com.tienda.productos.entity.DetallePedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DetallePedidoRepository extends JpaRepository<DetallePedido, Long> {

    List<DetallePedido> finByPedidoId(Long pedidoId);

}
