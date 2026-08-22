package com.tienda.productos.controller;

import com.tienda.productos.dto.PedidoTrabajadorResponse;
import com.tienda.productos.entity.Usuario;
import com.tienda.productos.service.PedidoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/repartidor")
@RequiredArgsConstructor
@PreAuthorize("hasRole('REPARTIDOR')")
@Tag(name = "Panel Repartidor", description = "Entrega de pedidos con delivery")
public class RepartidorController {

    private final PedidoService pedidoService;

    @GetMapping("/disponibles")
    @Operation(summary = "Pedidos listos para reparto, sin repartidor asignado")
    public List<PedidoTrabajadorResponse> disponibles() {
        return pedidoService.pedidosDisponiblesParaRepartidor();
    }

    @PatchMapping("/{id}/tomar")
    @Operation(summary = "Toma un pedido para entregarlo")
    public PedidoTrabajadorResponse tomar(@AuthenticationPrincipal Usuario repartidor, @PathVariable Long id) {
        return pedidoService.tomarEntrega(repartidor, id);
    }

    @GetMapping("/mis-entregas")
    @Operation(summary = "Pedidos que este repartidor tiene pendientes de entregar")
    public List<PedidoTrabajadorResponse> misEntregas(@AuthenticationPrincipal Usuario repartidor) {
        return pedidoService.misEntregas(repartidor);
    }

    @PatchMapping("/{id}/entregado")
    @Operation(summary = "Marca el pedido como entregado al cliente")
    public PedidoTrabajadorResponse marcarEntregado(@AuthenticationPrincipal Usuario repartidor, @PathVariable Long id) {
        return pedidoService.marcarEntregado(repartidor, id);
    }
}