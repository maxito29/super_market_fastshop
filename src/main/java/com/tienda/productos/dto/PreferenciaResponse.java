package com.tienda.productos.dto;

public class PreferenciaResponse {
    public String initPoint;
    public String preferenceId;

    public PreferenciaResponse(String initPoint, String preferenceId) {
        this.initPoint = initPoint;
        this.preferenceId = preferenceId;
    }
}