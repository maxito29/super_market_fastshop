package com.tienda.productos.controller;

import com.tienda.productos.dto.PreferenciaResponse;
import com.tienda.productos.service.PagoMercadoPagoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pagos")
@Tag(name = "Pagos", description = "Integración con Mercado Pago")
public class PagoController {

    private final PagoMercadoPagoService pagoService;

    public PagoController(PagoMercadoPagoService pagoService) {
        this.pagoService = pagoService;
    }

    @PostMapping("/preferencia/{pedidoId}")
    @Operation(summary = "Crea la preferencia de pago en Mercado Pago para un pedido ya creado y devuelve la URL de checkout")
    public PreferenciaResponse crearPreferencia(@PathVariable Long pedidoId) {
        return pagoService.crearPreferencia(pedidoId);
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(
            @RequestParam(required = false) String type,
            @RequestParam(name = "data.id", required = false) String dataId
    ) {
        pagoService.procesarNotificacionDePago(type, dataId);
        return ResponseEntity.ok().build();
    }
}