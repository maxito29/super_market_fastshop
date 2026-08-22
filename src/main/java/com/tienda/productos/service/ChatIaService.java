package com.tienda.productos.service;

import com.tienda.productos.dto.ChatMensajeDTO;
import com.tienda.productos.entity.Producto;
import com.tienda.productos.entity.Usuario;
import com.tienda.productos.repository.CategoriaRepository;
import com.tienda.productos.repository.ProductoRepository;
import com.tienda.productos.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpStatusCodeException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class ChatIaService {

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.url}")
    private String apiUrl;

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public ChatIaService(ProductoRepository productoRepository,
                         CategoriaRepository categoriaRepository,
                         UsuarioRepository usuarioRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public String preguntar(String pregunta, Usuario usuarioActual, List<ChatMensajeDTO> historial) {

        String contexto = construirContexto();

        String systemPrompt =
                "Eres el asistente virtual del panel administrativo de un supermercado en Peru. " +
                        "Respondes de forma breve, clara y profesional en español. " +
                        "Usa SOLO los datos reales que te doy en el contexto, nunca inventes cifras. " +
                        "Si te preguntan algo que no esta en el contexto (por ejemplo ventas o pedidos), " +
                        "explica que ese modulo todavia no esta disponible en el sistema. " +
                        "Cuando muestres listas, usa formato con viñetas (•). " +
                        "El usuario que te habla se llama " + usuarioActual.getNombre() +
                        " y tiene el rol " + usuarioActual.getRol().getNombre() + ".\n\n" +
                        "=== DATOS ACTUALES DEL SISTEMA ===\n" + contexto;

        List<Map<String, Object>> mensajes = new ArrayList<>();

        Map<String, Object> sistema = new HashMap<>();
        sistema.put("role", "system");
        sistema.put("content", systemPrompt);
        mensajes.add(sistema);

        if (historial != null) {
            for (ChatMensajeDTO m : historial) {
                Map<String, Object> msg = new HashMap<>();
                msg.put("role", m.getRole());
                msg.put("content", m.getContent());
                mensajes.add(msg);
            }
        }

        Map<String, Object> msgUsuario = new HashMap<>();
        msgUsuario.put("role", "user");
        msgUsuario.put("content", pregunta);
        mensajes.add(msgUsuario);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "openai/gpt-oss-120b");
        requestBody.put("messages", mensajes);
        requestBody.put("max_tokens", 1024);
        requestBody.put("temperature", 0.7);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(apiUrl, request, Map.class);
            return extraerTexto(response);
        } catch (Exception e) {
            e.printStackTrace();
            return "No pude conectar con el asistente en este momento. Intenta de nuevo en unos segundos.";
        }
    }

    @SuppressWarnings("unchecked")
    private String extraerTexto(Map<String, Object> response) {
        try {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            return "No se pudo procesar la respuesta del asistente.";
        }
    }

    private String construirContexto() {
        StringBuilder ctx = new StringBuilder();

        ctx.append("RESUMEN GENERAL:\n");
        ctx.append("- Total productos activos: ").append(productoRepository.countByActivoTrue()).append("\n");
        ctx.append("- Total categorias activas: ").append(categoriaRepository.countByActivoTrue()).append("\n");
        ctx.append("- Total trabajadores activos: ").append(usuarioRepository.countByActivoTrue()).append("\n\n");

        ctx.append("PRODUCTOS Y STOCK (ordenados de menor a mayor stock):\n");
        List<Producto> productos = productoRepository.findByActivoTrue();
        productos.stream()
                .sorted((a, b) -> Integer.compare(a.getStock(), b.getStock()))
                .forEach(p -> ctx.append("- ").append(p.getNombre())
                        .append(" | Categoria: ").append(p.getCategoria().getNombre())
                        .append(" | Precio: S/ ").append(p.getPrecio())
                        .append(" | Stock: ").append(p.getStock())
                        .append(" unidades\n"));
        ctx.append("\n");

        ctx.append("PRODUCTOS CON STOCK BAJO (menos de 20 unidades):\n");
        productos.stream()
                .filter(p -> p.getStock() < 20)
                .forEach(p -> ctx.append("- ").append(p.getNombre())
                        .append(": ").append(p.getStock()).append(" unidades\n"));
        ctx.append("\n");

        ctx.append("TRABAJADORES:\n");
        usuarioRepository.findAll()
                .forEach(u -> ctx.append("- ").append(u.getNombre())
                        .append(" | Usuario: ").append(u.getUsername())
                        .append(" | Rol: ").append(u.getRol().getNombre())
                        .append(" | Estado: ").append(Boolean.TRUE.equals(u.getActivo()) ? "Activo" : "Inactivo")
                        .append("\n"));
        ctx.append("\n");

        ctx.append("NOTA: El modulo de pedidos y ventas todavia no esta implementado, ")
                .append("por lo que no hay datos de ingresos, ventas ni pedidos disponibles todavia.\n");

        return ctx.toString();
    }
}