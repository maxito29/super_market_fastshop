package com.tienda.productos.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

        @Bean
        public OpenAPI customOpenAPI() {
                final String esquemaJwt = "bearerAuth";
                return new OpenAPI()
                        .info(new Info()
                                .title("API Supermercado - Admin y Trabajadores - Carrito de Compras - Clientes")
                                .description("Backend REST para el dashboard administrativo y los paneles de trabajadores (picker/repartidor)")
                                .version("1.0"))
                        .addSecurityItem(new SecurityRequirement().addList(esquemaJwt))
                        .components(new Components().addSecuritySchemes(esquemaJwt,
                                new SecurityScheme()
                                        .name(esquemaJwt)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
        }
}