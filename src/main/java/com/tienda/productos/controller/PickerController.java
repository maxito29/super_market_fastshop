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
@RequestMapping("/api/picker")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PICKER')")
@Tag(name = "Panel Picker", description = "Preparación de pedidos pagados")
public class PickerController {

    private final PedidoService pedidoService;

    @GetMapping("/disponibles")
    @Operation(summary = "Pedidos pagados sin picker asignado")
    public List<PedidoTrabajadorResponse> disponibles() {
        return pedidoService.pedidosDisponiblesParaPicker();
    }

    @PatchMapping("/{id}/tomar")
    @Operation(summary = "Toma un pedido para empezar a prepararlo")
    public PedidoTrabajadorResponse tomar(@AuthenticationPrincipal Usuario picker, @PathVariable Long id) {
        return pedidoService.tomarPedido(picker, id);
    }

    @GetMapping("/mis-preparaciones")
    @Operation(summary = "Pedidos que este picker está preparando ahora")
    public List<PedidoTrabajadorResponse> misPreparaciones(@AuthenticationPrincipal Usuario picker) {
        return pedidoService.misPreparaciones(picker);
    }

    @PatchMapping("/{id}/listo")
    @Operation(summary = "Marca terminada la preparación")
    public PedidoTrabajadorResponse marcarListo(@AuthenticationPrincipal Usuario picker, @PathVariable Long id) {
        return pedidoService.marcarListo(picker, id);
    }

    @GetMapping("/listos-recojo")
    @Operation(summary = "Pedidos listos para que el cliente los recoja en tienda")
    public List<PedidoTrabajadorResponse> listosParaRecojo() {
        return pedidoService.pedidosListosParaRecojo();
    }

    @PatchMapping("/{id}/confirmar-recojo")
    @Operation(summary = "Confirma que el cliente recogió su pedido en tienda")
    public PedidoTrabajadorResponse confirmarRecojo(@PathVariable Long id) {
        return pedidoService.confirmarRecojo(id);
    }
}