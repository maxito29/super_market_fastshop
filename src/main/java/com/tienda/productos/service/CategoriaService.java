package com.tienda.productos.service;

import com.tienda.productos.entity.Categoria;
import com.tienda.productos.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {
    private final CategoriaRepository categoriaRepository;

    public List<Categoria> listarActivas(){
        return categoriaRepository.findByActivoTrue();
    }
}
