package com.tienda.productos.service;


import com.tienda.productos.entity.Producto;
import com.tienda.productos.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoService {
    private final ProductoRepository productoRepository;
    public List<Producto> listarActivos(){
        return productoRepository.findByActivoTrue();
    }
    public List<Producto> listarPorCategoria(Long categoriaId){
        return productoRepository.findByCategoriaId(categoriaId);
    }

}
