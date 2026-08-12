package com.tienda.productos.controller;

import com.tienda.productos.dto.RolResponse;
import com.tienda.productos.repository.RolRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Roles", description = "Catálogo de roles para asignar a trabajadores. Solo ADMIN.")
public class RolController {

    private final RolRepository rolRepository;

    @GetMapping
    public List<RolResponse> listar() {
        return rolRepository.findAll().stream().map(RolResponse::new).toList();
    }
}