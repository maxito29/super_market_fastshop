package com.tienda.productos.dto;

public class DocumentoResponses {

    public static class DniConsultaResponse {
        public String nombreCompleto;

        public DniConsultaResponse(String nombreCompleto) {
            this.nombreCompleto = nombreCompleto;
        }
    }

    public static class RucConsultaResponse {
        public String razonSocial;
        public String estado;
        public String condicion;

        public RucConsultaResponse(String razonSocial, String estado, String condicion) {
            this.razonSocial = razonSocial;
            this.estado = estado;
            this.condicion = condicion;
        }
    }
    public static class ErrorResponse {
        public String mensaje;

        public ErrorResponse(String mensaje) {
            this.mensaje = mensaje;
        }
    }
}
