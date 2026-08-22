package com.tienda.productos.controller;

import com.tienda.productos.dto.EstadoPedidoResponse;
import com.tienda.productos.repository.EstadoPedidoRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/estados-pedido")
@RequiredArgsConstructor
@Tag(name = "Estados de pedido", description = "Catalogo de estados posibles de un pedido")
public class EstadoPedidoController {

    private final EstadoPedidoRepository estadoPedidoRepository;

    @GetMapping
    @Operation(summary = "Lista los estados de pedido disponibles, en orden")
    public List<EstadoPedidoResponse> listar() {
        return estadoPedidoRepository.findAll(Sort.by("orden")).stream()
                .map(EstadoPedidoResponse::new)
                .toList();
    }
}
