package com.tienda.productos.controller;

import com.tienda.productos.dto.CrearPedidoInvitadoRequest;
import com.tienda.productos.dto.PedidoResponse;
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
}