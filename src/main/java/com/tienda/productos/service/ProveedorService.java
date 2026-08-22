package com.tienda.productos.service;

import com.tienda.productos.dto.ProveedorRequest;
import com.tienda.productos.dto.ProveedorResponse;
import com.tienda.productos.entity.Proveedor;
import com.tienda.productos.exception.RecursoNoEncontradoException;
import com.tienda.productos.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProveedorService {

    private final ProveedorRepository proveedorRepository;

    public List<ProveedorResponse> listarTodos() {
        return proveedorRepository.findAll().stream()
                .map(ProveedorResponse::new)
                .toList();
    }

    public ProveedorResponse crear(ProveedorRequest request) {
        Proveedor proveedor = new Proveedor();
        proveedor.setNombre(request.getNombre());
        proveedor.setActivo(true);
        return new ProveedorResponse(proveedorRepository.save(proveedor));
    }

    public ProveedorResponse actualizar(Long id, ProveedorRequest request) {
        Proveedor proveedor = obtenerOLanzar(id);
        proveedor.setNombre(request.getNombre());
        return new ProveedorResponse(proveedorRepository.save(proveedor));
    }

    public void desactivar(Long id) {
        Proveedor proveedor = obtenerOLanzar(id);
        proveedor.setActivo(false);
        proveedorRepository.save(proveedor);
    }

    public void reactivar(Long id) {
        Proveedor proveedor = obtenerOLanzar(id);
        proveedor.setActivo(true);
        proveedorRepository.save(proveedor);
    }

    private Proveedor obtenerOLanzar(Long id) {
        return proveedorRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Proveedor con id " + id + " no encontrado"));
    }
}
