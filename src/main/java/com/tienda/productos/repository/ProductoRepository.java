package com.tienda.productos.repository;

import com.tienda.productos.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface ProductoRepository extends JpaRepository<Producto, Long> {

    List<Producto> findByCategoriaId(Long categoriaId);

    List<Producto> findByActivoTrue();

    Optional<Producto> findByCodigo(String codigo);

    long countByActivoTrue();

    long countByActivoTrueAndStockLessThan(Integer stock);

    @org.springframework.data.jpa.repository.Query(
            "SELECT p.categoria.nombre, COUNT(p) FROM Producto p WHERE p.activo = true GROUP BY p.categoria.nombre"
    )
    java.util.List<Object[]> contarProductosPorCategoria();

    java.util.List<com.tienda.productos.entity.Producto> findTop5ByActivoTrueOrderByStockDesc();

    java.util.List<com.tienda.productos.entity.Producto> findByActivoTrueAndStockLessThanOrderByStockAsc(Integer stock);
}
