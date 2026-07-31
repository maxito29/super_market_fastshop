package com.tienda.productos.controller;


import com.tienda.productos.entity.Producto;
import com.tienda.productos.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {
    private final ProductoService productoService;

    @GetMapping
    public List<Producto> listar(){
        return productoService.listarActivos();
    }

    @GetMapping("/categoria/{categoriaId}")
    public List<Producto>
    listarPorCategoria(@PathVariable Long categoriaId){
        return productoService.listarPorCategoria(categoriaId);
    }
}
