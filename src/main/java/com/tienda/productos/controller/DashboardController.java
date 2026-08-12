package com.tienda.productos.controller;

import com.tienda.productos.dto.DashboardResumenResponse;
import com.tienda.productos.service.DashboardService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
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
}