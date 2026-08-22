package com.tienda.productos.repository;

import com.tienda.productos.entity.ClientePasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClientePasswordResetTokenRepository extends JpaRepository<ClientePasswordResetToken, Long> {
    Optional<ClientePasswordResetToken> findByTokenAndUsadoFalse(String token);
}