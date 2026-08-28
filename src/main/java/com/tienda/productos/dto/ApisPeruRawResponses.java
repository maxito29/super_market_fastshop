package com.tienda.productos.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

public class ApisPeruRawResponses {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DniRaw {
        public String dni;
        public String nombres;
        public String apellidoPaterno;
        public String apellidoMaterno;
    }
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class RucRaw {
        public String ruc;
        public String razonSocial;
        public String nombreComercial;
        public String estado;
        public String condicion;
        public String direccion;
    }
}

