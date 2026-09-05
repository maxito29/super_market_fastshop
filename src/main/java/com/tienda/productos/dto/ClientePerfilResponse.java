package com.tienda.productos.dto;

import com.tienda.productos.entity.Cliente;
import com.tienda.productos.entity.TipoDocumento;
import lombok.Getter;

@Getter
public class ClientePerfilResponse {
    private final TipoDocumento tipoDocumento;
    private final String numeroDocumento;
    private final String nombreRazonSocial;
    private final String telefono;
    private final String email;
    private final boolean perfilCompleto;

    public ClientePerfilResponse(Cliente cliente) {
        this.tipoDocumento = cliente.getTipoDocumento();
        this.numeroDocumento = cliente.getNumeroDocumento();
        this.nombreRazonSocial = cliente.getNombreRazonSocial();
        this.telefono = cliente.getTelefono();
        this.email = cliente.getEmail();
        this.perfilCompleto = cliente.getTipoDocumento() != null
                && cliente.getNumeroDocumento() != null && !cliente.getNumeroDocumento().isBlank()
                && cliente.getTelefono() != null && !cliente.getTelefono().isBlank();
    }
}