package com.tienda.productos.repository;

import com.tienda.productos.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    Optional<Pedido> findByNumeroPedido(String numeroPedido);

    List<Pedido>findByCliente_NumeroDocuemntoOrderByFechaPedidoDesc(String numeroDocumento);
}
