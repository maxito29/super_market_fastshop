package com.tienda.productos.service;

import com.tienda.productos.dto.*;
import com.tienda.productos.entity.*;
import com.tienda.productos.exception.RecursoNoEncontradoException;
import com.tienda.productos.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

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
            direccion = crearDireccionParaPedido(cliente, request.getDireccion(), request.getDistrito(), request.getReferencia());
        }

        Pedido pedido = new Pedido();
        pedido.setNumeroPedido(generarNumeroPedido());
        pedido.setCliente(cliente);
        pedido.setEstado(buscarEstadoInicial());
        pedido.setMetodoPago(buscarMetodoPago(request.getMetodoPagoId()));
        pedido.setModalidadEntrega(request.getModalidadEntrega());
        pedido.setDireccion(direccion);
        pedido.setMontoPagoEfectivo(request.getMontoPagoEfectivo());

        aplicarDatosComprobanteInvitado(pedido, request, cliente);

        pedido.setTotal(BigDecimal.ZERO);
        Pedido pedidoGuardado = pedidoRepository.save(pedido);

        BigDecimal total = guardarDetalles(pedidoGuardado, request.getItems());

        if (pedidoGuardado.getTipoComprobante() == TipoComprobante.BOLETA
                && "00000000".equals(pedidoGuardado.getDocComprobante())
                && total.compareTo(UMBRAL_IDENTIFICACION_SUNAT) >= 0) {
            throw new IllegalArgumentException("Por regulación de SUNAT, las compras desde S/ 700 requieren DNI");
        }

        pedidoGuardado.setTotal(total);
        pedidoGuardado = pedidoRepository.save(pedidoGuardado);

        guardarHistorialInicial(pedidoGuardado);

        return new PedidoResponse(pedidoGuardado);
    }

    private Cliente obtenerOCrearClienteInvitado(CrearPedidoInvitadoRequest request) {
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

    private void aplicarDatosComprobanteInvitado(Pedido pedido, CrearPedidoInvitadoRequest request, Cliente cliente) {
        if (request.getTipoComprobante() == TipoComprobante.FACTURA) {
            if (request.getRuc() == null || request.getRuc().length() != 11 || request.getRazonSocial() == null || request.getRazonSocial().isBlank()) {
                throw new IllegalArgumentException("Para factura, el RUC (11 dígitos) y la razón social son obligatorios");
            }
            pedido.setTipoComprobante(TipoComprobante.FACTURA);
            pedido.setRucComprobante(request.getRuc());
            pedido.setRazonSocialComprobante(request.getRazonSocial());
            pedido.setDocComprobante(request.getRuc());
            pedido.setNombreComprobante(request.getRazonSocial());
            return;
        }

        pedido.setTipoComprobante(TipoComprobante.BOLETA);

        if (request.getDni() != null && !request.getDni().isBlank()) {
            pedido.setDocComprobante(request.getDni());
            pedido.setNombreComprobante(cliente.getNombreRazonSocial());
        } else {
            pedido.setDocComprobante("00000000");
            pedido.setNombreComprobante("Clientes Varios");
        }
    }

    public PedidoResponse crearParaCliente(Cliente cliente, CrearPedidoClienteRequest request) {
        DireccionCliente direccion = null;
        if (request.getModalidadEntrega() == ModalidadEntrega.DELIVERY) {
            direccion = resolverDireccion(cliente, request);
        }

        Pedido pedido = new Pedido();
        pedido.setNumeroPedido(generarNumeroPedido());
        pedido.setCliente(cliente);
        pedido.setEstado(buscarEstadoInicial());
        pedido.setMetodoPago(buscarMetodoPago(request.getMetodoPagoId()));
        pedido.setModalidadEntrega(request.getModalidadEntrega());
        pedido.setDireccion(direccion);
        pedido.setMontoPagoEfectivo(request.getMontoPagoEfectivo());

        aplicarDatosComprobanteCliente(pedido, request, cliente);

        pedido.setTotal(BigDecimal.ZERO);
        Pedido pedidoGuardado = pedidoRepository.save(pedido);

        BigDecimal total = guardarDetalles(pedidoGuardado, request.getItems());
        pedidoGuardado.setTotal(total);
        pedidoGuardado = pedidoRepository.save(pedidoGuardado);

        guardarHistorialInicial(pedidoGuardado);

        return new PedidoResponse(pedidoGuardado);
    }

    public List<PedidoResponse> misPedidos(Cliente cliente) {
        return pedidoRepository.findByClienteIdOrderByFechaPedidoDesc(cliente.getId())
                .stream().map(PedidoResponse::new).toList();
    }

    public PedidoDetalleResponse detallePedido(Cliente cliente, Long pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido no encontrado"));

        if (!pedido.getCliente().getId().equals(cliente.getId())) {
            throw new IllegalArgumentException("Ese pedido no pertenece a tu cuenta");
        }

        List<PedidoItemResponse> items = detallePedidoRepository.findByPedidoId(pedido.getId())
                .stream().map(PedidoItemResponse::new).toList();

        return new PedidoDetalleResponse(pedido, items);
    }

    private DireccionCliente resolverDireccion(Cliente cliente, CrearPedidoClienteRequest request) {
        if (request.getDireccionId() != null) {
            DireccionCliente direccion = direccionClienteRepository.findById(request.getDireccionId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Dirección no encontrada"));

            if (!direccion.getCliente().getId().equals(cliente.getId())) {
                throw new IllegalArgumentException("Esa dirección no pertenece a tu cuenta");
            }
            return direccion;
        }

        return crearDireccionParaPedido(cliente, request.getDireccion(), request.getDistrito(), request.getReferencia());
    }

    private void aplicarDatosComprobanteCliente(Pedido pedido, CrearPedidoClienteRequest request, Cliente cliente) {
        if (request.getTipoComprobante() == TipoComprobante.FACTURA) {
            if (request.getRuc() == null || request.getRuc().length() != 11 || request.getRazonSocial() == null || request.getRazonSocial().isBlank()) {
                throw new IllegalArgumentException("Para factura, el RUC (11 dígitos) y la razón social son obligatorios");
            }
            pedido.setTipoComprobante(TipoComprobante.FACTURA);
            pedido.setRucComprobante(request.getRuc());
            pedido.setRazonSocialComprobante(request.getRazonSocial());
            pedido.setDocComprobante(request.getRuc());
            pedido.setNombreComprobante(request.getRazonSocial());
            return;
        }

        pedido.setTipoComprobante(TipoComprobante.BOLETA);
        pedido.setDocComprobante(cliente.getNumeroDocumento());
        pedido.setNombreComprobante(cliente.getNombreRazonSocial());
    }

    private DireccionCliente crearDireccionParaPedido(Cliente cliente, String direccionTexto, String distrito, String referencia) {
        DireccionCliente direccion = new DireccionCliente();
        direccion.setCliente(cliente);
        direccion.setDireccion(direccionTexto);
        direccion.setDistrito(distrito);
        direccion.setReferencia(referencia);
        direccion.setPredeterminada(false);
        return direccionClienteRepository.save(direccion);
    }

    private BigDecimal guardarDetalles(Pedido pedido, List<ItemPedidoRequest> items) {
        BigDecimal total = BigDecimal.ZERO;

        for (ItemPedidoRequest item : items) {
            Producto producto = productoRepository.findById(item.getProductoId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Producto con id " + item.getProductoId() + " no encontrado"));

            if (producto.getStock() < item.getCantidad()) {
                throw new IllegalArgumentException("Stock insuficiente para '" + producto.getNombre() + "' (disponible: " + producto.getStock() + ")");
            }

            BigDecimal subtotal = producto.getPrecio().multiply(BigDecimal.valueOf(item.getCantidad()));

            DetallePedido detalle = new DetallePedido();
            detalle.setPedido(pedido);
            detalle.setProducto(producto);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(producto.getPrecio());
            detalle.setSubtotal(subtotal);
            detallePedidoRepository.save(detalle);

            producto.setStock(producto.getStock() - item.getCantidad());
            productoRepository.save(producto);

            total = total.add(subtotal);
        }

        return total;
    }

    private void guardarHistorialInicial(Pedido pedido) {
        registrarHistorial(pedido, "Pedido creado");
    }

    private EstadoPedido buscarEstadoInicial() {
        return estadoPedidoRepository.findByCodigo("PENDIENTE")
                .orElseThrow(() -> new RecursoNoEncontradoException("Estado PENDIENTE no configurado en el sistema"));
    }

    private MetodoPago buscarMetodoPago(Long id) {
        return metodoPagoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Método de pago con id " + id + " no encontrado"));
    }

    private String generarNumeroPedido() {
        return "PED-" + System.currentTimeMillis();
    }

    public PedidoResponse marcarPagado(Long pedidoId) {
        Pedido pedido = buscarPedido(pedidoId);

        if (!"PENDIENTE".equals(pedido.getEstado().getCodigo())) {
            throw new IllegalArgumentException("Este pedido no está pendiente de pago");
        }

        pedido.setEstado(buscarEstado("PAGADO"));
        Pedido guardado = pedidoRepository.save(pedido);
        registrarHistorial(guardado, "Pago confirmado");

        return new PedidoResponse(guardado);
    }

    public List<PedidoTrabajadorResponse> pedidosDisponiblesParaPicker() {
        return mapearConItems(pedidoRepository.findByEstado_CodigoAndPickerUsuarioIsNull("PAGADO"));
    }

    public PedidoTrabajadorResponse tomarPedido(Usuario picker, Long pedidoId) {
        Pedido pedido = buscarPedido(pedidoId);

        if (pedido.getPickerUsuario() != null) {
            throw new IllegalArgumentException("Este pedido ya fue tomado por otro picker");
        }
        if (!"PAGADO".equals(pedido.getEstado().getCodigo())) {
            throw new IllegalArgumentException("Este pedido ya no está disponible para tomar");
        }

        pedido.setPickerUsuario(picker);
        pedido.setEstado(buscarEstado("EN_PREPARACION"));
        Pedido guardado = pedidoRepository.save(pedido);
        registrarHistorial(guardado, "Tomado por " + picker.getNombre());

        return new PedidoTrabajadorResponse(guardado, itemsDe(guardado));
    }

    public List<PedidoTrabajadorResponse> misPreparaciones(Usuario picker) {
        return mapearConItems(pedidoRepository.findByPickerUsuarioIdAndEstado_Codigo(picker.getId(), "EN_PREPARACION"));
    }

    public PedidoTrabajadorResponse marcarListo(Usuario picker, Long pedidoId) {
        Pedido pedido = buscarPedido(pedidoId);

        if (pedido.getPickerUsuario() == null || !pedido.getPickerUsuario().getId().equals(picker.getId())) {
            throw new IllegalArgumentException("Este pedido no está asignado a ti");
        }

        String siguienteEstado = pedido.getModalidadEntrega() == ModalidadEntrega.RECOJO_TIENDA
                ? "LISTO_RECOJO" : "ENVIADO";

        pedido.setEstado(buscarEstado(siguienteEstado));
        Pedido guardado = pedidoRepository.save(pedido);
        registrarHistorial(guardado, "Preparación terminada por " + picker.getNombre());

        return new PedidoTrabajadorResponse(guardado, itemsDe(guardado));
    }

    public List<PedidoTrabajadorResponse> pedidosListosParaRecojo() {
        return mapearConItems(pedidoRepository.findByEstado_Codigo("LISTO_RECOJO"));
    }

    public PedidoTrabajadorResponse confirmarRecojo(Long pedidoId) {
        Pedido pedido = buscarPedido(pedidoId);

        if (!"LISTO_RECOJO".equals(pedido.getEstado().getCodigo())) {
            throw new IllegalArgumentException("Este pedido no está listo para recojo");
        }

        pedido.setEstado(buscarEstado("ENTREGADO"));
        Pedido guardado = pedidoRepository.save(pedido);
        registrarHistorial(guardado, "Cliente recogió su pedido en tienda");

        return new PedidoTrabajadorResponse(guardado, itemsDe(guardado));
    }

    public List<PedidoTrabajadorResponse> pedidosDisponiblesParaRepartidor() {
        return mapearConItems(pedidoRepository.findByEstado_CodigoAndRepartidorUsuarioIsNull("ENVIADO"));
    }

    public PedidoTrabajadorResponse tomarEntrega(Usuario repartidor, Long pedidoId) {
        Pedido pedido = buscarPedido(pedidoId);

        if (pedido.getRepartidorUsuario() != null) {
            throw new IllegalArgumentException("Este pedido ya fue tomado por otro repartidor");
        }
        if (!"ENVIADO".equals(pedido.getEstado().getCodigo())) {
            throw new IllegalArgumentException("Este pedido no está listo para reparto");
        }

        pedido.setRepartidorUsuario(repartidor);
        Pedido guardado = pedidoRepository.save(pedido);
        registrarHistorial(guardado, "Tomado para reparto por " + repartidor.getNombre());

        return new PedidoTrabajadorResponse(guardado, itemsDe(guardado));
    }

    public List<PedidoTrabajadorResponse> misEntregas(Usuario repartidor) {
        return mapearConItems(pedidoRepository.findByRepartidorUsuarioIdAndEstado_Codigo(repartidor.getId(), "ENVIADO"));
    }

    public PedidoTrabajadorResponse marcarEntregado(Usuario repartidor, Long pedidoId) {
        Pedido pedido = buscarPedido(pedidoId);

        if (pedido.getRepartidorUsuario() == null || !pedido.getRepartidorUsuario().getId().equals(repartidor.getId())) {
            throw new IllegalArgumentException("Este pedido no está asignado a ti");
        }

        pedido.setEstado(buscarEstado("ENTREGADO"));
        Pedido guardado = pedidoRepository.save(pedido);
        registrarHistorial(guardado, "Entregado por " + repartidor.getNombre());

        return new PedidoTrabajadorResponse(guardado, itemsDe(guardado));
    }

    private Pedido buscarPedido(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido con id " + id + " no encontrado"));
    }

    private EstadoPedido buscarEstado(String codigo) {
        return estadoPedidoRepository.findByCodigo(codigo)
                .orElseThrow(() -> new RecursoNoEncontradoException("Estado " + codigo + " no configurado en el sistema"));
    }

    private List<PedidoItemResponse> itemsDe(Pedido pedido) {
        return detallePedidoRepository.findByPedidoId(pedido.getId())
                .stream().map(PedidoItemResponse::new).toList();
    }

    private List<PedidoTrabajadorResponse> mapearConItems(List<Pedido> pedidos) {
        return pedidos.stream()
                .map(p -> new PedidoTrabajadorResponse(p, itemsDe(p)))
                .toList();
    }

    private void registrarHistorial(Pedido pedido, String comentario) {
        HistorialEstadoPedido historial = new HistorialEstadoPedido();
        historial.setPedido(pedido);
        historial.setEstado(pedido.getEstado());
        historial.setComentario(comentario);
        historialEstadoPedidoRepository.save(historial);
    }

    public List<PedidoTrabajadorResponse> pedidosPendientesPago() {
        return mapearConItems(pedidoRepository.findByEstado_Codigo("PENDIENTE"));
    }

    @Transactional(readOnly = true)
    public Page<PedidoResponse> buscar(String valor, Pageable pageable) {
        return pedidoRepository.buscarPorNumeroDocOTelefono(valor, pageable)
                .map(PedidoResponse::new);
    }
}