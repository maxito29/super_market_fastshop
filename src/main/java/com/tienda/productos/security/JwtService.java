package com.tienda.productos.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    private SecretKey obtenerLlaveFirma() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generarToken(UserDetails userDetails) {
        Date ahora = new Date();
        Date expiracion = new Date(ahora.getTime() + expirationMs);

        String rol = userDetails.getAuthorities().stream()
                .findFirst()
                .map(Object::toString)
                .orElse("");

        return Jwts.builder()
                .subject(userDetails.getUsername())
                .claim("rol", rol)
                .issuedAt(ahora)
                .expiration(expiracion)
                .signWith(obtenerLlaveFirma())
                .compact();
    }

    public String extraerUsername(String token) {
        return extraerClaim(token, Claims::getSubject);
    }

    public <T> T extraerClaim(String token, Function<Claims, T> resolver) {
        Claims claims = Jwts.parser()
                .verifyWith(obtenerLlaveFirma())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return resolver.apply(claims);
    }

    public boolean esTokenValido(String token, UserDetails userDetails) {
        try {
            String username = extraerUsername(token);
            Date expiracion = extraerClaim(token, Claims::getExpiration);
            return username.equals(userDetails.getUsername()) && expiracion.after(new Date());
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    public String extraerRol(String token) {
        return extraerClaim(token, claims -> claims.get("rol", String.class));
    }
}