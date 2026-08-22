package com.tienda.productos.controller;

import com.tienda.productos.dto.DniConsultaResponse;
import com.tienda.productos.service.ReniecService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/documentos")
@RequiredArgsConstructor
@Tag(name = "Documentos", description = "Consulta de DNI para autocompletar datos del cliente")
public class DocumentoController {

    private final ReniecService reniecService;

    @GetMapping("/dni/{numero}")
    @Operation(summary = "Consulta el nombre completo asociado a un DNI")
    public DniConsultaResponse consultarDni(@PathVariable String numero) {
        DniConsultaResponse respuesta = new DniConsultaResponse();
        respuesta.setNombreCompleto(reniecService.consultarNombreCompleto(numero));
        return respuesta;
    }
}
