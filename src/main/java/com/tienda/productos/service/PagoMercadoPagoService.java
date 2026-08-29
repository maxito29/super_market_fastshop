package com.tienda.productos.service;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.*;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;

import com.tienda.productos.dto.PreferenciaResponse;
import com.tienda.productos.entity.AppProperties;
import com.tienda.productos.entity.DetallePedido;
import com.tienda.productos.entity.MercadoPagoProperties;
import com.tienda.productos.entity.Pedido;
import com.tienda.productos.exception.RecursoNoEncontradoException;
import com.tienda.productos.repository.DetallePedidoRepository;
import com.tienda.productos.repository.PedidoRepository;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PagoMercadoPagoService {

    private final MercadoPagoProperties mpProperties;
    private final AppProperties appProperties;
    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final PedidoService pedidoService;

    public PagoMercadoPagoService(
            MercadoPagoProperties mpProperties,
            AppProperties appProperties,
            PedidoRepository pedidoRepository,
            DetallePedidoRepository detallePedidoRepository,
            PedidoService pedidoService
    ) {
        this.mpProperties = mpProperties;
        this.appProperties = appProperties;
        this.pedidoRepository = pedidoRepository;
        this.detallePedidoRepository = detallePedidoRepository;
        this.pedidoService = pedidoService;
    }
    @PostConstruct
    public void configurarSdk() {
        MercadoPagoConfig.setAccessToken(mpProperties.getAccessToken());
    }

    public PreferenciaResponse crearPreferencia(Long pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido con id " + pedidoId + " no encontrado"));

        List<DetallePedido> detalles = detallePedidoRepository.findByPedidoId(pedidoId);

        List<PreferenceItemRequest> items = detalles.stream()
                .map(detalle -> PreferenceItemRequest.builder()
                        .title(detalle.getProducto().getNombre())
                        .quantity(detalle.getCantidad())
                        .unitPrice(detalle.getPrecioUnitario())
                        .currencyId("PEN")
                        .build())
                .toList();

        String urlExito = appProperties.getFrontendUrl() + "/pedido-confirmado/" + pedido.getNumeroPedido();
        String urlFallo = appProperties.getFrontendUrl() + "/checkout";

        PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                .success(urlExito)
                .pending(urlExito)
                .failure(urlFallo)
                .build();

        PreferenceRequest.PreferenceRequestBuilder requestBuilder = PreferenceRequest.builder()
                .items(items)
                .backUrls(backUrls)
                .externalReference(pedido.getNumeroPedido());

        if (mpProperties.getNotificationUrl() != null && !mpProperties.getNotificationUrl().isBlank()) {
            requestBuilder.notificationUrl(mpProperties.getNotificationUrl());
        }

        requestBuilder.autoReturn("approved");

        try {
            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(requestBuilder.build());
            return new PreferenciaResponse(preference.getInitPoint(), preference.getId());

        } catch (MPApiException ex) {
            throw new RuntimeException(
                    "Mercado Pago rechazó la preferencia: " + ex.getApiResponse().getContent(), ex);
        } catch (MPException ex) {
            throw new RuntimeException("No se pudo crear la preferencia de pago en Mercado Pago", ex);
        }
    }

    public void procesarNotificacionDePago(String tipo, String paymentId) {
        if (!"payment".equals(tipo) || paymentId == null || paymentId.isBlank()) {
            return;
        }

        try {
            PaymentClient paymentClient = new PaymentClient();
            Payment pago = paymentClient.get(Long.parseLong(paymentId));

            if (!"approved".equals(pago.getStatus())) {
                return;
            }

            String numeroPedido = pago.getExternalReference();
            if (numeroPedido == null) {
                return;
            }

            Pedido pedido = pedidoRepository.findByNumeroPedido(numeroPedido)
                    .orElse(null);

            if (pedido == null) {
                return;
            }
            if ("PENDIENTE".equals(pedido.getEstado().getCodigo())) {
                pedidoService.marcarPagado(pedido.getId());
            }

        } catch (NumberFormatException | MPApiException | MPException ex) {
        }
    }
}