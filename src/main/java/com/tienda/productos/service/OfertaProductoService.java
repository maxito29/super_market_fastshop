package com.tienda.productos.service;

import com.tienda.productos.dto.OfertaProductoResponse;
import com.tienda.productos.repository.OfertaProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OfertaProductoService {

    private final OfertaProductoRepository ofertaProductoRepository;

    public List<OfertaProductoResponse> listarPorProducto(Long productoId) {
        return ofertaProductoRepository.buscarPorProducto(productoId).stream()
                .map(OfertaProductoResponse::new)
                .toList();
    }
}
