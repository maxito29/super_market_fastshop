package com.tienda.productos.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMensajeDTO {
    private String role;    // "user" o "assistant"
    private String content;
}