package com.tienda.productos.controller;

import com.tienda.productos.dto.CrearPedidoClienteRequest;
import com.tienda.productos.dto.CrearPedidoInvitadoRequest;
import com.tienda.productos.dto.PedidoResponse;
import com.tienda.productos.dto.PedidoTrabajadorResponse;
import com.tienda.productos.service.PedidoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
@Tag(name = "Pedidos", description = "Creación de pedidos desde la tienda")
public class PedidoController {

    private final PedidoService pedidoService;

    @PostMapping("/invitado")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crea un pedido sin necesidad de iniciar sesión")
    public PedidoResponse crearComoInvitado(@Valid @RequestBody CrearPedidoInvitadoRequest request) {
        return pedidoService.crearComoInvitado(request);
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('CLIENTE')")
    @Operation(summary = "Crea un pedido como cliente logueado, reutilizando sus datos guardados")
    public PedidoResponse crear(
            @Valid @RequestBody CrearPedidoClienteRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.tienda.productos.entity.Cliente cliente
    ) {
        return pedidoService.crearParaCliente(cliente, request);
    }

    @PatchMapping("/{id}/marcar-pagado")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Confirma manualmente el pago (Yape/Efectivo) — Mercado Pago hará esto automático cuando Guido lo conecte")
    public PedidoResponse marcarPagado(@PathVariable Long id) {
        return pedidoService.marcarPagado(id);
    }

    @GetMapping("/pendientes")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lista pedidos pendientes de confirmar pago")
    public java.util.List<PedidoTrabajadorResponse> pendientes() {
        return pedidoService.pedidosPendientesPago();
    }
}