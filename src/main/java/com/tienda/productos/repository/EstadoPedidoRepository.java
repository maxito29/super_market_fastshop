package com.tienda.productos.repository;

import com.tienda.productos.entity.EstadoPedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EstadoPedidoRepository extends JpaRepository<EstadoPedido, Long> {

    Optional<EstadoPedido> findByCodigo(String codigo);
}
