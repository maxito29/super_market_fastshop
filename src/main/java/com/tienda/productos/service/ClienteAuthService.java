package com.tienda.productos.service;

import com.tienda.productos.dto.ClienteLoginRequest;
import com.tienda.productos.dto.ClienteLoginResponse;
import com.tienda.productos.dto.ClienteRegistroRequest;
import com.tienda.productos.entity.Cliente;
import com.tienda.productos.exception.RecursoDuplicadoException;
import com.tienda.productos.repository.ClienteRepository;
import com.tienda.productos.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.tienda.productos.dto.ClienteGoogleLoginRequest;
import org.springframework.beans.factory.annotation.Value;
import java.security.GeneralSecurityException;
import java.io.IOException;
import java.util.Collections;


@Service
@RequiredArgsConstructor
@Transactional
public class ClienteAuthService {

    private final ClienteRepository clienteRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public ClienteLoginResponse registrar(ClienteRegistroRequest request) {
        clienteRepository.findByTipoDocumentoAndNumeroDocumento(request.getTipoDocumento(), request.getNumeroDocumento())
                .filter(c -> c.getPassword() != null)
                .ifPresent(c -> {
                    throw new RecursoDuplicadoException("Ya existe una cuenta registrada con ese documento");
                });

        Cliente cliente = clienteRepository.findByEmail(request.getEmail())
                .filter(c -> c.getPassword() == null)
                .orElseGet(Cliente::new);

        cliente.setTipoDocumento(request.getTipoDocumento());
        cliente.setNumeroDocumento(request.getNumeroDocumento());
        cliente.setNombreRazonSocial(request.getNombreRazonSocial());
        cliente.setDireccion(request.getDireccion());
        cliente.setTelefono(request.getTelefono());
        cliente.setEmail(request.getEmail());
        cliente.setPassword(passwordEncoder.encode(request.getPassword()));

        Cliente guardado = clienteRepository.save(cliente);
        String token = jwtService.generarToken(guardado);

        return new ClienteLoginResponse(token, guardado.getNumeroDocumento(), guardado.getNombreRazonSocial(), guardado.getEmail());
    }

    public ClienteLoginResponse login(ClienteLoginRequest request) {
        Cliente cliente = clienteRepository
                .findByTipoDocumentoAndNumeroDocumento(request.getTipoDocumento(), request.getNumeroDocumento())
                .orElseThrow(() -> new BadCredentialsException("Documento o contraseña incorrectos"));

        if (cliente.getPassword() == null) {
            throw new BadCredentialsException("Esta cuenta todavía no tiene contraseña. Revisa tu correo para crear una.");
        }

        if (!passwordEncoder.matches(request.getPassword(), cliente.getPassword())) {
            throw new BadCredentialsException("Documento o contraseña incorrectos");
        }

        String token = jwtService.generarToken(cliente);
        return new ClienteLoginResponse(token, cliente.getNumeroDocumento(), cliente.getNombreRazonSocial(), cliente.getEmail());
    }

    @Value("${google.client-id}")
    private String googleClientId;

    public ClienteLoginResponse loginConGoogle(ClienteGoogleLoginRequest request) {
        GoogleIdToken.Payload payload = verificarTokenGoogle(request.getIdToken());

        String googleId = payload.getSubject();
        String email = payload.getEmail();
        String nombre = (String) payload.get("name");

        Cliente cliente = clienteRepository.findByGoogleId(googleId)
                .or(() -> clienteRepository.findByEmail(email))
                .orElseGet(Cliente::new);

        cliente.setGoogleId(googleId);
        cliente.setEmail(email);
        if (cliente.getNombreRazonSocial() == null) {
            cliente.setNombreRazonSocial(nombre != null ? nombre : email);
        }

        Cliente guardado = clienteRepository.save(cliente);
        String token = jwtService.generarToken(guardado);

        return new ClienteLoginResponse(token, guardado.getNumeroDocumento(), guardado.getNombreRazonSocial(), guardado.getEmail());
    }

    private GoogleIdToken.Payload verificarTokenGoogle(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new BadCredentialsException("Token de Google inválido");
            }
            return idToken.getPayload();
        } catch (GeneralSecurityException | IOException e) {
            throw new BadCredentialsException("No se pudo verificar el token de Google");
        }
    }
}