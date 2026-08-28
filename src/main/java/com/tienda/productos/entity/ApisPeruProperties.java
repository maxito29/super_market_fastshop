package com.tienda.productos.entity;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "apisperu")
public class ApisPeruProperties {

    private String token;
    private final Url url = new Url();

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Url getUrl() {
        return url;
    }

    public static class Url {
        private String ruc;
        private String dni;

        public String getRuc() {
            return ruc;
        }

        public void setRuc(String ruc) {
            this.ruc = ruc;
        }

        public String getDni() {
            return dni;
        }

        public void setDni(String dni) {
            this.dni = dni;
        }
    }
}