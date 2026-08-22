package com.tienda.productos.controller;

import com.tienda.productos.dto.MetodoPagoResponse;
import com.tienda.productos.repository.MetodoPagoRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/metodos-pago")
@RequiredArgsConstructor
@Tag(name = "Metodos de pago", description = "Catalogo de metodos de pago disponibles")
public class MetodoPagoController {

    private final MetodoPagoRepository metodoPagoRepository;

    @GetMapping
    @Operation(summary = "Lista los metodos de pago disponibles (Yape, Efectivo, Tarjeta, Plin)")
    public List<MetodoPagoResponse> listar() {
        return metodoPagoRepository.findAll().stream()
                .map(MetodoPagoResponse::new)
                .toList();
    }
}
