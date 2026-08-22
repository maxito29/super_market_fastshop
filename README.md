# 🛒 Fastshop — Sistema de E-commerce para Supermercado

Sistema completo de e-commerce para un supermercado, compuesto por un backend en **Spring Boot** y dos frontends en **Angular**: una tienda pública para clientes y un panel administrativo para el equipo interno (admin, picker, repartidor).

Proyecto desarrollado como parte del curso **Desarrollo de Aplicaciones Web I (DAW1)** — Cibertec.

---

## 📋 Tabla de contenidos

- [Arquitectura del proyecto](#-arquitectura-del-proyecto)
- [Tecnologías](#-tecnologías)
- [Funcionalidades](#-funcionalidades)
- [Requisitos previos](#-requisitos-previos)
- [Instalación y configuración](#-instalación-y-configuración)
- [Roles del sistema](#-roles-del-sistema)
- [Estructura de carpetas](#-estructura-de-carpetas)
- [Autores](#-autores)

---

## 🏗 Arquitectura del proyecto

El repositorio contiene tres módulos independientes:

```
super_market_fastshop/
├── src/                  # Backend — API REST (Spring Boot)
├── admin-frontend/       # Panel administrativo (Angular + PrimeNG)
└── tienda-frontend/      # Tienda pública para clientes (Angular + PrimeNG)
```

- El **backend** expone una única API REST consumida por ambos frontends.
- El **admin-frontend** es usado por trabajadores del supermercado: administradores, pickers (preparadores de pedido) y repartidores.
- El **tienda-frontend** es la tienda pública donde los clientes navegan el catálogo, arman su carrito, pagan y consultan sus pedidos (con o sin cuenta).

---

## 🛠 Tecnologías

**Backend**
- Java 17 + Spring Boot
- Spring Data JPA (Hibernate)
- Spring Security + JWT (autenticación stateless)
- MySQL (producción) / H2 (pruebas)
- Apache POI (exportación a Excel)
- OpenPDF (generación de comprobantes en PDF)
- Springdoc OpenAPI (documentación Swagger)

**Frontend (admin-frontend y tienda-frontend)**
- Angular 17 (standalone components + signals)
- PrimeNG + PrimeIcons
- SweetAlert2 (notificaciones)
- Chart.js / ApexCharts (dashboard, solo admin-frontend)

**Integraciones externas**
- **Groq API** — asistente de IA del panel administrativo (chat con contexto de datos reales del sistema)
- **Brevo (Sendinblue)** — envío de correos transaccionales (recuperación de contraseña)
- **Decolecta** — consulta de DNI/RUC para autocompletar datos del cliente

---

## ✨ Funcionalidades

### Tienda pública (tienda-frontend)
- Catálogo de productos por categoría, con ofertas
- Carrito de compras
- Checkout como invitado o como cliente registrado
- Múltiples métodos de pago (Yape, Plin, Efectivo, Tarjeta)
- Emisión de boleta o factura (con validación de RUC/DNI según monto, según normativa SUNAT)
- Consulta de pedidos por número de pedido, DNI/RUC o teléfono, sin necesidad de iniciar sesión
- Recuperación de contraseña vía correo electrónico

### Panel administrativo (admin-frontend)
- Dashboard con métricas del negocio
- CRUD de categorías y productos
- Gestión de trabajadores (usuarios, roles)
- Gestión de proveedores
- Confirmación manual de pagos (Yape/Efectivo)
- Panel de **picker**: preparación de pedidos
- Panel de **repartidor**: gestión de entregas
- Exportación de reportes a Excel y PDF
- **Asistente virtual con IA**: responde preguntas sobre productos, stock y trabajadores usando datos reales del sistema (Groq API)

---

## ✅ Requisitos previos

- **Java 17** o superior
- **Maven** (o usar el wrapper incluido `./mvnw`)
- **Node.js 18+** y **npm**
- **Angular CLI 17**
- **MySQL** 8+ en ejecución local
- Cuentas/API keys de:
  - [Groq](https://console.groq.com/) (chat con IA)
  - [Brevo](https://www.brevo.com/) (envío de correos)
  - [Decolecta](https://decolecta.com/) (consulta DNI/RUC)

---

## ⚙️ Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/maxito29/super_market_fastshop.git
cd super_market_fastshop
```

### 2. Backend (Spring Boot)

Crea el archivo `src/main/resources/application.properties` (no está versionado por seguridad) usando como referencia `application.properties.example` incluido en el repo:

```properties
# Base de datos
spring.datasource.url=jdbc:mysql://localhost:3306/fastshop_db
spring.datasource.username=root
spring.datasource.password=tu_password
spring.jpa.hibernate.ddl-auto=update

# JWT
jwt.secret=una_clave_secreta_larga_y_segura
jwt.expiration-ms=86400000

# Groq API (chat IA del panel admin)
groq.api.key=tu_api_key_de_groq
groq.api.url=https://api.groq.com/openai/v1/chat/completions

# Brevo (envío de correos)
brevo.api.key=tu_api_key_de_brevo
brevo.remitente.email=tu_correo_verificado@ejemplo.com
brevo.remitente.nombre=Fastshop
brevo.destinatario.alertas=correo_para_alertas@ejemplo.com

# Decolecta (consulta DNI/RUC)
decolecta.api.token=tu_token_de_decolecta
```

> ⚠️ Importante: en Brevo, si tu cuenta tiene activada la restricción de IPs autorizadas, agrega tu IP en `https://app.brevo.com/security/authorised_ips`, o los correos fallarán con `401 Unauthorized` aunque la API key sea correcta.

Levanta el backend:

```bash
./mvnw spring-boot:run
```

La API quedará disponible en `http://localhost:8080`, y la documentación Swagger en `http://localhost:8080/swagger-ui.html`.

### 3. Frontend de la tienda (tienda-frontend)

```bash
cd tienda-frontend
npm install
ng serve
```

Disponible en `http://localhost:4200`.

### 4. Panel administrativo (admin-frontend)

```bash
cd admin-frontend
npm install
ng serve --port 4201
```

Disponible en `http://localhost:4201` (usa un puerto distinto al de la tienda para poder correr ambos frontends a la vez).

---

## 👥 Roles del sistema

| Rol | Acceso |
|---|---|
| `CLIENTE` | Tienda pública: compras, historial de pedidos |
| `ADMIN` | Panel administrativo completo: productos, categorías, usuarios, proveedores, confirmación de pagos, asistente IA |
| `PICKER` | Panel de preparación de pedidos |
| `REPARTIDOR` | Panel de gestión de entregas |

La autenticación se maneja con **JWT**, y las rutas del backend están protegidas con `@PreAuthorize` según el rol correspondiente. Las rutas de catálogo (productos, categorías, métodos de pago) y la consulta pública de pedidos son accesibles sin autenticación.

---

## 📁 Estructura de carpetas

**Backend** (`src/main/java/com/tienda/productos/`)

```
├── config/         # Configuración general (Swagger, etc.)
├── controller/     # Endpoints REST
├── dto/            # Objetos de transferencia de datos (requests/responses)
├── entity/         # Entidades JPA
├── exception/      # Manejo centralizado de excepciones
├── repository/     # Repositorios Spring Data JPA
├── security/       # JWT, filtros de autenticación, configuración de seguridad
├── service/        # Lógica de negocio
└── util/           # Utilidades generales
```

**Frontends** (`admin-frontend/` y `tienda-frontend/`, estructura similar)

```
src/app/
├── core/           # Servicios HTTP, modelos, guards, interceptores
├── features/       # Módulos funcionales (productos, checkout, dashboard, etc.)
└── shared/         # Componentes reutilizables (layout, widgets)
```

---

## 👨‍💻 Autores

- **Maximiliano Juliano Lopez Avalos** ([@maxito29](https://github.com/maxito29)) — Coordinador del proyecto
- **Guido Alonso Lionel Lara Candela** 

Proyecto académico — Cibertec, Computación e Informática, 5to ciclo.
