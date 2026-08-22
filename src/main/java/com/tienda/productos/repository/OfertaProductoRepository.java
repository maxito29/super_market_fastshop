package com.tienda.productos.repository;

import com.tienda.productos.entity.OfertaProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OfertaProductoRepository extends JpaRepository<OfertaProducto, Long> {

    @Query("SELECT o FROM OfertaProducto o WHERE o.producto.id = :productoId AND o.activo = true ORDER BY o.precio ASC")
    List<OfertaProducto> buscarPorProducto(@Param("productoId") Long productoId);

    Optional<OfertaProducto> findByIdAndActivoTrue(Long id);
}
