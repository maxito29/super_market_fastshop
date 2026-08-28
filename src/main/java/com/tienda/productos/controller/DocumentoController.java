package com.tienda.productos.controller;

import com.tienda.productos.dto.DocumentoResponses;
import com.tienda.productos.exception.DocumentoConsultaException;
import com.tienda.productos.service.DocumentoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/documentos")
public class DocumentoController {

    private final DocumentoService documentoService;

    public DocumentoController(DocumentoService documentoService) {
        this.documentoService = documentoService;
    }

    @GetMapping("/dni/{numero}")
    public DocumentoResponses.DniConsultaResponse consultarDni(@PathVariable String numero) {
        return documentoService.consultarDni(numero);
    }

    @GetMapping("/ruc/{numero}")
    public DocumentoResponses.RucConsultaResponse consultarRuc(@PathVariable String numero) {
        return documentoService.consultarRuc(numero);
    }

    @ExceptionHandler(DocumentoConsultaException.class)
    public ResponseEntity<DocumentoResponses.ErrorResponse> manejarErrorConsulta(DocumentoConsultaException ex) {
        return ResponseEntity
                .status(ex.getStatus())
                .body(new DocumentoResponses.ErrorResponse(ex.getMessage()));
    }
}
