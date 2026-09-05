package com.tienda.productos.controller;

import com.tienda.productos.dto.*;
import com.tienda.productos.entity.Cliente;
import com.tienda.productos.entity.DireccionCliente;
import com.tienda.productos.exception.RecursoDuplicadoException;
import com.tienda.productos.exception.RecursoNoEncontradoException;
import com.tienda.productos.repository.ClienteRepository;
import com.tienda.productos.repository.DireccionClienteRepository;
import com.tienda.productos.service.PedidoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cliente")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CLIENTE')")
@Tag(name = "Cliente (autenticado)", description = "Datos propios del cliente logueado")
public class ClienteController {

    private final ClienteRepository clienteRepository;
    private final DireccionClienteRepository direccionClienteRepository;
    private final PedidoService pedidoService;


    @GetMapping("/perfil")
    @Operation(summary = "Obtiene el perfil del cliente logueado")
    public ClientePerfilResponse miPerfil(@AuthenticationPrincipal Cliente cliente) {
        return new ClientePerfilResponse(cliente);
    }

    @PutMapping("/perfil")
    @Operation(summary = "Actualiza el perfil del cliente logueado (completar documento/teléfono, etc.)")
    public ClientePerfilResponse actualizarPerfil(@AuthenticationPrincipal Cliente cliente,
                                                  @Valid @RequestBody ClientePerfilRequest request) {

        if (request.getTipoDocumento() != null && request.getNumeroDocumento() != null && !request.getNumeroDocumento().isBlank()) {
            clienteRepository.findByTipoDocumentoAndNumeroDocumento(request.getTipoDocumento(), request.getNumeroDocumento())
                    .filter(otro -> !otro.getId().equals(cliente.getId()))
                    .ifPresent(otro -> {
                        throw new RecursoDuplicadoException("Ese documento ya está registrado en otra cuenta");
                    });
        }

        cliente.setTipoDocumento(request.getTipoDocumento());
        cliente.setNumeroDocumento(request.getNumeroDocumento());
        cliente.setNombreRazonSocial(request.getNombreRazonSocial());
        cliente.setTelefono(request.getTelefono());
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            cliente.setEmail(request.getEmail());
        }

        Cliente guardado = clienteRepository.save(cliente);
        return new ClientePerfilResponse(guardado);
    }


    @GetMapping("/direcciones")
    @Operation(summary = "Lista las direcciones guardadas del cliente logueado")
    public List<DireccionResponse> misDirecciones(@AuthenticationPrincipal Cliente cliente) {
        return direccionClienteRepository.findByClienteId(cliente.getId())
                .stream().map(DireccionResponse::new).toList();
    }

    @PostMapping("/direcciones")
    @Operation(summary = "Crea una nueva dirección para el cliente logueado")
    public DireccionResponse crearDireccion(@AuthenticationPrincipal Cliente cliente,
                                            @Valid @RequestBody DireccionRequest request) {
        List<DireccionCliente> existentes = direccionClienteRepository.findByClienteId(cliente.getId());

        if (Boolean.TRUE.equals(request.getPredeterminada())) {
            desmarcarPredeterminadas(existentes);
        }

        DireccionCliente nueva = new DireccionCliente();
        nueva.setCliente(cliente);
        nueva.setDireccion(request.getDireccion());
        nueva.setDistrito(request.getDistrito());
        nueva.setReferencia(request.getReferencia());
        nueva.setPredeterminada(Boolean.TRUE.equals(request.getPredeterminada()) || existentes.isEmpty());

        return new DireccionResponse(direccionClienteRepository.save(nueva));
    }

    @PutMapping("/direcciones/{id}")
    @Operation(summary = "Actualiza una dirección del cliente logueado")
    public DireccionResponse actualizarDireccion(@AuthenticationPrincipal Cliente cliente,
                                                 @PathVariable Long id,
                                                 @Valid @RequestBody DireccionRequest request) {
        DireccionCliente direccion = obtenerDireccionPropia(cliente, id);

        if (Boolean.TRUE.equals(request.getPredeterminada())) {
            desmarcarPredeterminadas(direccionClienteRepository.findByClienteId(cliente.getId()));
        }

        direccion.setDireccion(request.getDireccion());
        direccion.setDistrito(request.getDistrito());
        direccion.setReferencia(request.getReferencia());
        direccion.setPredeterminada(Boolean.TRUE.equals(request.getPredeterminada()));

        return new DireccionResponse(direccionClienteRepository.save(direccion));
    }

    @DeleteMapping("/direcciones/{id}")
    @Operation(summary = "Elimina una dirección del cliente logueado")
    public void eliminarDireccion(@AuthenticationPrincipal Cliente cliente, @PathVariable Long id) {
        direccionClienteRepository.delete(obtenerDireccionPropia(cliente, id));
    }

    private DireccionCliente obtenerDireccionPropia(Cliente cliente, Long id) {
        return direccionClienteRepository.findById(id)
                .filter(d -> d.getCliente().getId().equals(cliente.getId()))
                .orElseThrow(() -> new RecursoNoEncontradoException("Dirección no encontrada"));
    }

    private void desmarcarPredeterminadas(List<DireccionCliente> direcciones) {
        direcciones.forEach(d -> d.setPredeterminada(false));
        direccionClienteRepository.saveAll(direcciones);
    }


    @GetMapping("/pedidos")
    @Operation(summary = "Historial de pedidos del cliente logueado")
    public List<PedidoResponse> misPedidos(@AuthenticationPrincipal Cliente cliente) {
        return pedidoService.misPedidos(cliente);
    }

    @GetMapping("/pedidos/{id}")
    @Operation(summary = "Detalle completo de un pedido del cliente logueado")
    public PedidoDetalleResponse detallePedido(@AuthenticationPrincipal Cliente cliente, @PathVariable Long id) {
        return pedidoService.detallePedido(cliente, id);
    }
}