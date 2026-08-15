package com.tienda.productos.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ChatRequest {

    @NotBlank(message = "La pregunta es obligatoria")
    private String pregunta;

    private List<ChatMensajeDTO> historial;
}