package com.tienda.productos.repository;

import com.tienda.productos.entity.Cliente;
import com.tienda.productos.entity.TipoDocumento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByTipoDocumentoAndNumeroDocumento
            (TipoDocumento tipoDocumento, String numeroDocumento);
}
