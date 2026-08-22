package com.tienda.productos.controller;

import com.tienda.productos.dto.OfertaProductoResponse;
import com.tienda.productos.service.OfertaProductoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
@Tag(name = "Ofertas", description = "Ofertas de distintos proveedores para un mismo producto")
public class OfertaProductoController {

    private final OfertaProductoService ofertaProductoService;

    @GetMapping("/{productoId}/ofertas")
    @Operation(summary = "Lista las ofertas de proveedores de un producto, de mas barata a mas cara")
    public List<OfertaProductoResponse> listarOfertas(@PathVariable Long productoId) {
        return ofertaProductoService.listarPorProducto(productoId);
    }
}
