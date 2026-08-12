package com.tienda.productos.service;

import com.tienda.productos.dto.CategoriaRequest;
import com.tienda.productos.dto.CategoriaResponse;
import com.tienda.productos.entity.Categoria;
import com.tienda.productos.exception.RecursoDuplicadoException;
import com.tienda.productos.exception.RecursoNoEncontradoException;
import com.tienda.productos.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public List<CategoriaResponse> listarActivas() {
        return categoriaRepository.findByActivoTrue().stream().map(CategoriaResponse::new).toList();
    }

    public List<CategoriaResponse> listarTodas() {
        return categoriaRepository.findAll().stream().map(CategoriaResponse::new).toList();
    }

    public CategoriaResponse obtenerPorId(Long id) {
        return new CategoriaResponse(buscarEntidad(id));
    }

    @Transactional
    public CategoriaResponse crear(CategoriaRequest request) {
        if (categoriaRepository.existsByNombreIgnoreCase(request.getNombre())) {
            throw new RecursoDuplicadoException("Ya existe una categoría con el nombre '" + request.getNombre() + "'");
        }
        Categoria categoria = new Categoria();
        categoria.setNombre(request.getNombre());
        categoria.setDescripcion(request.getDescripcion());
        return new CategoriaResponse(categoriaRepository.save(categoria));
    }

    @Transactional
    public CategoriaResponse actualizar(Long id, CategoriaRequest request) {
        Categoria categoria = buscarEntidad(id);

        if (!categoria.getNombre().equalsIgnoreCase(request.getNombre())
                && categoriaRepository.existsByNombreIgnoreCase(request.getNombre())) {
            throw new RecursoDuplicadoException("Ya existe una categoría con el nombre '" + request.getNombre() + "'");
        }

        categoria.setNombre(request.getNombre());
        categoria.setDescripcion(request.getDescripcion());
        return new CategoriaResponse(categoriaRepository.save(categoria));
    }

    @Transactional
    public void eliminar(Long id) {
        Categoria categoria = buscarEntidad(id);
        categoria.setActivo(false);
        categoriaRepository.save(categoria);
    }

    private Categoria buscarEntidad(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría con id " + id + " no encontrada"));
    }

    @Transactional
    public void reactivar(Long id) {
        Categoria categoria = buscarEntidad(id);
        categoria.setActivo(true);
        categoriaRepository.save(categoria);
    }
}