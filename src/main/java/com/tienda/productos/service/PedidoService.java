package com.tienda.productos.service;

import com.tienda.productos.dto.CrearPedidoInvitadoRequest;
import com.tienda.productos.dto.ItemPedidoRequest;
import com.tienda.productos.dto.PedidoResponse;
import com.tienda.productos.entity.*;
import com.tienda.productos.exception.RecursoNoEncontradoException;
import com.tienda.productos.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PedidoService {

    private static final BigDecimal UMBRAL_IDENTIFICACION_SUNAT = new BigDecimal("700");

    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final HistorialEstadoPedidoRepository historialEstadoPedidoRepository;
    private final ClienteRepository clienteRepository;
    private final DireccionClienteRepository direccionClienteRepository;
    private final ProductoRepository productoRepository;
    private final EstadoPedidoRepository estadoPedidoRepository;
    private final MetodoPagoRepository metodoPagoRepository;

    public PedidoResponse crearComoInvitado(CrearPedidoInvitadoRequest request) {

        Cliente cliente = obtenerOCrearClienteInvitado(request);

        DireccionCliente direccion = null;

        if (request.getModalidadEntrega() == ModalidadEntrega.DELIVERY) {
            direccion = crearDireccionParaPedido(cliente, request);
        }

        Pedido pedido = new Pedido();

        pedido.setNumeroPedido(generarNumeroPedido());
        pedido.setCliente(cliente);
        pedido.setEstado(buscarEstadoInicial());
        pedido.setMetodoPago(buscarMetodoPago(request.getMetodoPagoId()));
        pedido.setModalidadEntrega(request.getModalidadEntrega());
        pedido.setDireccion(direccion);
        pedido.setMontoPagoEfectivo(request.getMontoPagoEfectivo());
        aplicarDatosComprobante(pedido, request, cliente);

        BigDecimal total = BigDecimal.ZERO;
        pedido.setTotal(total);

        Pedido pedidoGuardado = pedidoRepository.save(pedido);
        total = guardarDetalles(pedidoGuardado, request.getItems());
        if (pedidoGuardado.getTipoComprobante() == TipoComprobante.BOLETA
                && "00000000".equals(pedidoGuardado.getDocComprobante())
                && total.compareTo(UMBRAL_IDENTIFICACION_SUNAT) >= 0) {

            throw new IllegalArgumentException(
                    "Por regulación de SUNAT, las compras desde S/ 700 requieren DNI"
            );
        }

        pedidoGuardado.setTotal(total);

        pedidoGuardado = pedidoRepository.save(pedidoGuardado);

        guardarHistorialInicial(pedidoGuardado);

        return new PedidoResponse(pedidoGuardado);
    }

    private void aplicarDatosComprobante(
            Pedido pedido,
            CrearPedidoInvitadoRequest request,
            Cliente cliente) {

        // FACTURA
        if (request.getTipoComprobante() == TipoComprobante.FACTURA) {

            if (request.getRuc() == null
                    || request.getRuc().length() != 11
                    || request.getRazonSocial() == null
                    || request.getRazonSocial().isBlank()) {

                throw new IllegalArgumentException(
                        "Para factura, el RUC (11 dígitos) y la razón social son obligatorios"
                );
            }

            pedido.setTipoComprobante(TipoComprobante.FACTURA);
            pedido.setRucComprobante(request.getRuc());
            pedido.setRazonSocialComprobante(request.getRazonSocial());
            pedido.setDocComprobante(request.getRuc());
            pedido.setNombreComprobante(request.getRazonSocial());

            return;
        }

        // BOLETA
        pedido.setTipoComprobante(TipoComprobante.BOLETA);

        if (request.getDni() != null && !request.getDni().isBlank()) {

            pedido.setDocComprobante(request.getDni());
            pedido.setNombreComprobante(
                    cliente.getNombreRazonSocial()
            );

        } else {

            pedido.setDocComprobante("00000000");
            pedido.setNombreComprobante("Clientes Varios");
        }
    }

    private Cliente obtenerOCrearClienteInvitado(
            CrearPedidoInvitadoRequest request) {

        return clienteRepository.findByEmail(request.getEmail())
                .map(existente -> {

                    existente.setNombreRazonSocial(request.getNombre());
                    existente.setTelefono(request.getTelefono());

                    return clienteRepository.save(existente);
                })
                .orElseGet(() -> {

                    Cliente nuevo = new Cliente();

                    nuevo.setNombreRazonSocial(request.getNombre());
                    nuevo.setTelefono(request.getTelefono());
                    nuevo.setEmail(request.getEmail());

                    return clienteRepository.save(nuevo);
                });
    }

    private DireccionCliente crearDireccionParaPedido(
            Cliente cliente,
            CrearPedidoInvitadoRequest request) {

        DireccionCliente direccion = new DireccionCliente();

        direccion.setCliente(cliente);
        direccion.setDireccion(request.getDireccion());
        direccion.setDistrito(request.getDistrito());
        direccion.setReferencia(request.getReferencia());
        direccion.setPredeterminada(false);

        return direccionClienteRepository.save(direccion);
    }

    private BigDecimal guardarDetalles(
            Pedido pedido,
            List<ItemPedidoRequest> items) {

        BigDecimal total = BigDecimal.ZERO;

        for (ItemPedidoRequest item : items) {

            Producto producto = productoRepository.findById(
                    item.getProductoId()
            ).orElseThrow(() ->
                    new RecursoNoEncontradoException(
                            "Producto con id "
                                    + item.getProductoId()
                                    + " no encontrado"
                    )
            );

            if (producto.getStock() < item.getCantidad()) {

                throw new IllegalArgumentException(
                        "Stock insuficiente para '"
                                + producto.getNombre()
                                + "' (disponible: "
                                + producto.getStock()
                                + ")"
                );
            }

            BigDecimal subtotal = producto.getPrecio()
                    .multiply(BigDecimal.valueOf(item.getCantidad()));

            DetallePedido detalle = new DetallePedido();

            detalle.setPedido(pedido);
            detalle.setProducto(producto);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(producto.getPrecio());
            detalle.setSubtotal(subtotal);

            detallePedidoRepository.save(detalle);

            producto.setStock(
                    producto.getStock() - item.getCantidad()
            );

            productoRepository.save(producto);

            total = total.add(subtotal);
        }

        return total;
    }

    private void guardarHistorialInicial(Pedido pedido) {

        HistorialEstadoPedido historial =
                new HistorialEstadoPedido();

        historial.setPedido(pedido);
        historial.setEstado(pedido.getEstado());
        historial.setComentario("Pedido creado");

        historialEstadoPedidoRepository.save(historial);
    }

    private EstadoPedido buscarEstadoInicial() {

        return estadoPedidoRepository.findByCodigo("PENDIENTE")
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Estado PENDIENTE no configurado en el sistema"
                        )
                );
    }

    private MetodoPago buscarMetodoPago(Long id) {

        return metodoPagoRepository.findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Método de pago con id "
                                        + id
                                        + " no encontrado"
                        )
                );
    }

    private String generarNumeroPedido() {
        return "PED-" + System.currentTimeMillis();
    }
}