package com.tienda.productos.repository;

import com.tienda.productos.entity.DireccionCliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DireccionClienteRepository extends JpaRepository<DireccionCliente, Long> {
    List<DireccionCliente> findByClienteId(Long clienteId);
}