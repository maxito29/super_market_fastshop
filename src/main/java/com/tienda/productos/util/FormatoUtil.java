package com.tienda.productos.util;

import org.springframework.stereotype.Component;

@Component
public class FormatoUtil {
    public String capitalizar(String texto){
        if(texto == null || texto.isEmpty()) return texto ;
        return texto.substring(0,1).toUpperCase() + texto.substring(1).toLowerCase();
    }
}
