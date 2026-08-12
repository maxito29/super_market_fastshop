package com.tienda.productos.repository;

import com.tienda.productos.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface ProductoRepository extends JpaRepository<Producto, Long> {

    List<Producto> findByCategoriaId(Long categoriaId);

    List<Producto> findByActivoTrue();

    Optional<Producto> findByCodigo(String codigo);


}
