package com.tienda.productos.repository;

import com.tienda.productos.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoriaRepository  extends JpaRepository<Categoria, Long> {
    List<Categoria> findByActivoTrue();
}
