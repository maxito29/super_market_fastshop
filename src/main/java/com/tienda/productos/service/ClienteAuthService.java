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
}