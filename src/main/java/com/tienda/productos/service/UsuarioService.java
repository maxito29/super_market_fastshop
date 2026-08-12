package com.tienda.productos.service;

import com.tienda.productos.dto.UsuarioRequest;
import com.tienda.productos.dto.UsuarioResponse;
import com.tienda.productos.entity.Rol;
import com.tienda.productos.entity.Usuario;
import com.tienda.productos.exception.RecursoDuplicadoException;
import com.tienda.productos.exception.RecursoNoEncontradoException;
import com.tienda.productos.repository.RolRepository;
import com.tienda.productos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UsuarioResponse> listarTodos() {
        return usuarioRepository.findAll().stream().map(UsuarioResponse::new).toList();
    }

    public UsuarioResponse obtenerPorId(Long id) {
        return new UsuarioResponse(buscarEntidad(id));
    }

    @Transactional
    public UsuarioResponse crear(UsuarioRequest request) {
        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new RecursoDuplicadoException("Ya existe un usuario con el username '" + request.getUsername() + "'");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("El password es obligatorio al crear un usuario");
        }

        Rol rol = buscarRol(request.getRolId());

        Usuario usuario = new Usuario();
        usuario.setRol(rol);
        usuario.setNombre(request.getNombre());
        usuario.setUsername(request.getUsername());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setActivo(true);

        return new UsuarioResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponse actualizar(Long id, UsuarioRequest request) {
        Usuario usuario = buscarEntidad(id);

        if (!usuario.getUsername().equalsIgnoreCase(request.getUsername())
                && usuarioRepository.existsByUsername(request.getUsername())) {
            throw new RecursoDuplicadoException("Ya existe un usuario con el username '" + request.getUsername() + "'");
        }

        Rol rol = buscarRol(request.getRolId());

        usuario.setRol(rol);
        usuario.setNombre(request.getNombre());
        usuario.setUsername(request.getUsername());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return new UsuarioResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public void desactivar(Long id) {
        Usuario usuario = buscarEntidad(id);
        usuario.setActivo(false);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void reactivar(Long id) {
        Usuario usuario = buscarEntidad(id);
        usuario.setActivo(true);
        usuarioRepository.save(usuario);
    }

    private Usuario buscarEntidad(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario con id " + id + " no encontrado"));
    }

    private Rol buscarRol(Long rolId) {
        return rolRepository.findById(rolId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Rol con id " + rolId + " no encontrado"));
    }
}