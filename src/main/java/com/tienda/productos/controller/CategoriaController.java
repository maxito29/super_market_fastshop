package com.tienda.productos.controller;


import com.tienda.productos.entity.Categoria;
import com.tienda.productos.service.CategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {
    private final CategoriaService categoriaService;

    @GetMapping
    public List<Categoria> listar(){
        return categoriaService.listarActivas();
    }
}
