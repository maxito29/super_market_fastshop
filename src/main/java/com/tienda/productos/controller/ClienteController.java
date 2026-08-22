package com.tienda.productos.controller;

import com.tienda.productos.dto.DireccionResponse;
import com.tienda.productos.dto.PedidoDetalleResponse;
import com.tienda.productos.dto.PedidoResponse;
import com.tienda.productos.entity.Cliente;
import com.tienda.productos.repository.DireccionClienteRepository;
import com.tienda.productos.service.PedidoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cliente")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CLIENTE')")
@Tag(name = "Cliente (autenticado)", description = "Datos propios del cliente logueado")
public class ClienteController {

    private final DireccionClienteRepository direccionClienteRepository;
    private final PedidoService pedidoService;

    @GetMapping("/direcciones")
    @Operation(summary = "Lista las direcciones guardadas del cliente logueado")
    public List<DireccionResponse> misDirecciones(@AuthenticationPrincipal Cliente cliente) {
        return direccionClienteRepository.findByClienteId(cliente.getId())
                .stream().map(DireccionResponse::new).toList();
    }

    @GetMapping("/pedidos")
    @Operation(summary = "Historial de pedidos del cliente logueado")
    public List<PedidoResponse> misPedidos(@AuthenticationPrincipal Cliente cliente) {
        return pedidoService.misPedidos(cliente);
    }

    @GetMapping("/pedidos/{id}")
    @Operation(summary = "Detalle completo de un pedido del cliente logueado")
    public PedidoDetalleResponse detallePedido(@AuthenticationPrincipal Cliente cliente, @PathVariable Long id) {
        return pedidoService.detallePedido(cliente, id);
    }
}