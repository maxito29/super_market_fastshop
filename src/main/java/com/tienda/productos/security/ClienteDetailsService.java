package com.tienda.productos.security;

import com.tienda.productos.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClienteDetailsService implements UserDetailsService {

    private final ClienteRepository clienteRepository;

    @Override
    public UserDetails loadUserByUsername(String id) throws UsernameNotFoundException {
        return clienteRepository.findById(Long.valueOf(id))
                .orElseThrow(() -> new UsernameNotFoundException("Cliente no encontrado"));
    }
}