package com.tienda.productos.controller;

import com.tienda.productos.dto.DashboardResumenResponse;
import com.tienda.productos.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Dashboard", description = "Resumen de indicadores para el panel administrativo")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/resumen")
    public DashboardResumenResponse resumen() {
        return dashboardService.obtenerResumen();
    }

    @PostMapping("/alertas/stock")
    @Operation(summary = "Envia por correo la lista de productos con stock bajo (menos de 20 unidades)")
    public java.util.Map<String, Object> enviarAlertaStock() {
        int cantidad = dashboardService.enviarAlertaStockBajo();
        return java.util.Map.of("productosNotificados", cantidad);
    }

    @GetMapping("/exportar/pdf")
    @Operation(summary = "Descarga un PDF con el resumen ejecutivo del dashboard")
    public org.springframework.http.ResponseEntity<byte[]> exportarPdf(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.tienda.productos.entity.Usuario usuario
    ) throws com.lowagie.text.DocumentException {
        byte[] pdf = dashboardService.generarReportePdf(usuario.getNombre());

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "reporte-dashboard.pdf");

        return org.springframework.http.ResponseEntity.ok().headers(headers).body(pdf);
    }
}