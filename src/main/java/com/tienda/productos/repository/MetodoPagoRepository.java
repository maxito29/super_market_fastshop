package com.tienda.productos.repository;

import com.tienda.productos.entity.MetodoPago;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MetodoPagoRepository extends JpaRepository<MetodoPago, Long> {

    Optional<MetodoPago> findByCodigo(String codigo);
}
