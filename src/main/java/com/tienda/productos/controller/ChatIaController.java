package com.tienda.productos.controller;

import com.tienda.productos.dto.ChatRequest;
import com.tienda.productos.dto.ChatResponse;
import com.tienda.productos.entity.Usuario;
import com.tienda.productos.service.ChatIaService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Tag(name = "Asistente IA", description = "Chat que responde preguntas sobre los datos reales del sistema")
public class ChatIaController {

    private final ChatIaService chatIaService;

    @PostMapping("/preguntar")
    public ChatResponse preguntar(@Valid @RequestBody ChatRequest request, @AuthenticationPrincipal Usuario usuario) {
        String respuesta = chatIaService.preguntar(request.getPregunta(), usuario, request.getHistorial());
        return new ChatResponse(respuesta);
    }
}