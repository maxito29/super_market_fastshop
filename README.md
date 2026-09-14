# 🛒 Fastshop — Sistema de E-commerce para Supermercado

Sistema completo de e-commerce para un supermercado, compuesto por un backend en **Spring Boot** y dos frontends en **Angular**: una tienda pública para clientes y un panel administrativo para el equipo interno (admin, picker y repartidor).

Proyecto desarrollado como parte del curso **Desarrollo de Aplicaciones Web I (DAW1)** — Cibertec.

---

## 📋 Tabla de contenidos

* [Arquitectura del proyecto](#-arquitectura-del-proyecto)
* [Tecnologías](#-tecnologías)
* [Funcionalidades](#-funcionalidades)
* [Capturas de pantalla](#-capturas-de-pantalla)
* [Requisitos previos](#-requisitos-previos)
* [Instalación y configuración](#-instalación-y-configuración)
* [Roles del sistema](#-roles-del-sistema)
* [Estructura de carpetas](#-estructura-de-carpetas)
* [Autores](#-autores)

---

## 🏗 Arquitectura del proyecto

El repositorio contiene tres módulos independientes:

```text
super_market_fastshop/
├── src/                  # Backend — API REST (Spring Boot)
├── admin-frontend/       # Panel administrativo (Angular + PrimeNG)
└── tienda-frontend/      # Tienda pública para clientes (Angular + PrimeNG)
```

* El **backend** expone una única API REST consumida por ambos frontends.
* El **admin-frontend** es utilizado por administradores, pickers y repartidores.
* El **tienda-frontend** permite a los clientes consultar productos, gestionar su carrito, realizar pedidos y pagos.

---

## 🛠 Tecnologías

### Backend

* Java 17 + Spring Boot
* Spring Data JPA / Hibernate
* Spring Security + JWT
* MySQL
* Apache POI
* OpenPDF
* Springdoc OpenAPI / Swagger

### Frontend

* Angular 17
* TypeScript
* PrimeNG + PrimeIcons
* SweetAlert2
* Chart.js / ApexCharts

### Integraciones externas

* 🔐 **Google Authentication** — inicio de sesión con cuenta de Google
* 🤖 **Groq API** — asistente de IA para el panel administrativo
* 📧 **Brevo** — envío de correos para recuperación de contraseña
* 🇵🇪 **API de consulta RUC** — consulta de información tributaria de empresas en Perú
* 🗺️ **Google Maps** — selección y ubicación de la dirección del cliente
* 💳 **Mercado Pago** — procesamiento de pagos online
* 🪪 **Decolecta** — consulta de DNI/RUC

---

## ✨ Funcionalidades

### 🛍 Tienda pública

* Catálogo de productos por categoría.
* Productos en oferta.
* Carrito de compras.
* Checkout como invitado o cliente registrado.
* Inicio de sesión tradicional y mediante **Google**.
* Múltiples métodos de pago.
* Integración con **Mercado Pago**.
* Emisión de boleta o factura.
* Consulta de DNI/RUC.
* Consulta de pedidos sin iniciar sesión.
* Recuperación de contraseña mediante correo.
* **Google Maps para seleccionar la dirección de entrega del cliente.**
* Registro de ubicación para pedidos con delivery.

### 🛠 Panel administrativo

* Dashboard con métricas del negocio.
* CRUD de categorías y productos.
* Gestión de trabajadores y roles.
* Gestión de proveedores.
* Gestión de pedidos.
* Confirmación manual de pagos.
* Panel de **Picker** para preparación de pedidos.
* Panel de **Repartidor** para gestión de entregas.
* Exportación de reportes a Excel y PDF.
* **Asistente virtual con IA mediante Groq.**
* Consulta de productos, stock y trabajadores mediante el asistente.

---

## 📸 Capturas de pantalla

### 🛍 Tienda pública

#### Inicio / Catálogo

![Tienda Fastshop]

<img width="1366" height="725" alt="image" src="https://github.com/user-attachments/assets/e5f29f45-ed58-4907-97f4-0b4bf6922835" />

<img width="1363" height="621" alt="image" src="https://github.com/user-attachments/assets/abbcfd4b-9f61-414d-9a2c-22b5fab19e7d" />



#### Catálogo de productos

![Catálogo de productos]

<img width="1362" height="609" alt="image" src="https://github.com/user-attachments/assets/71306a5f-ce67-47ad-90b1-271b603c8bc4" />

<img width="1366" height="593" alt="image" src="https://github.com/user-attachments/assets/12646e84-ca5f-4fb0-9ce5-2460015955e0" />

<img width="1365" height="604" alt="image" src="https://github.com/user-attachments/assets/7dfca886-e294-4c52-8080-bf0ac7f8bcca" />

<img width="1365" height="604" alt="image" src="https://github.com/user-attachments/assets/1dd196dd-c6e1-4695-a4d2-f6ad47078681" />


#### Carrito de compras

![Carrito de compras]

<img width="1366" height="604" alt="image" src="https://github.com/user-attachments/assets/87cca70d-52a1-4850-bcf7-36b8ae3c18e9" />

<img width="1366" height="604" alt="image" src="https://github.com/user-attachments/assets/6b314ff1-f490-4d15-8d97-f2c1015b6a40" />

<img width="1366" height="601" alt="image" src="https://github.com/user-attachments/assets/c9986811-514e-4558-b010-3e7851d23dfd" />



#### Checkout y dirección

![Checkout]

<img width="1366" height="603" alt="image" src="https://github.com/user-attachments/assets/2b79d24d-6ce9-413b-9327-b63adf24a265" />

<img width="1365" height="605" alt="image" src="https://github.com/user-attachments/assets/69e17904-2b41-4975-8ccf-e2a472a4549f" />

<img width="1366" height="597" alt="image" src="https://github.com/user-attachments/assets/f550810c-8bb9-4008-8b3e-821eb09659fb" />

#### Selección de dirección mediante Google Maps

![Google Maps]

<img width="1366" height="604" alt="image" src="https://github.com/user-attachments/assets/2ce44d3f-4e68-4ee7-966a-1b960b842355" />


#### Inicio de sesión con Google

![Google Login]

<img width="1362" height="617" alt="image" src="https://github.com/user-attachments/assets/4540dc43-85bc-49d5-9d37-6de3ca6814e8" />

<img width="1366" height="604" alt="image" src="https://github.com/user-attachments/assets/b242f923-8a50-4596-857b-6b3d0bf6bae8" />

---

### 🛠 Panel administrativo

#### Dashboard

![Dashboard administrativo]

<img width="1366" height="601" alt="image" src="https://github.com/user-attachments/assets/6ad14b87-753b-4a60-b8be-1a16b592fee7" />

<img width="1366" height="608" alt="image" src="https://github.com/user-attachments/assets/117968fe-0039-4a13-a630-e316a7be890c" />

<img width="1366" height="609" alt="image" src="https://github.com/user-attachments/assets/a1f8cbc4-e164-43e2-8b01-280f69aad236" />

#### Gestión de productos

![Gestión de productos]

<img width="1366" height="609" alt="image" src="https://github.com/user-attachments/assets/d4015628-c490-40dd-9c9c-7b5271415b73" />


#### Gestión de pedidos

![Gestión de pedidos]

<img width="1366" height="607" alt="image" src="https://github.com/user-attachments/assets/79ea044c-536a-43b3-9034-12204def5a7b" />


#### Panel Picker

![Panel Picker](screenshots/picker.png)

#### Panel Repartidor

![Panel Repartidor](screenshots/repartidor.png)

#### Asistente IA

![Asistente IA]

<img width="1099" height="531" alt="image" src="https://github.com/user-attachments/assets/0e13e57a-14b3-4c40-aa80-2a4feb0c2904" />


---

## ✅ Requisitos previos

* **Java 17** o superior
* **Maven**
* **Node.js 18+**
* **Angular CLI 17**
* **MySQL 8+**
* Cuenta/API keys de:

  * Google
  * Groq
  * Brevo
  * API de consulta RUC
  * Mercado Pago
  * Google Maps

---

## ⚙️ Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/maxito29/super_market_fastshop.git
cd super_market_fastshop
```

### 2. Backend

Crear:

```text
src/main/resources/application.properties
```

Configurar las credenciales de la base de datos y servicios externos.

Luego ejecutar:

```bash
./mvnw spring-boot:run
```

API:

```text
http://localhost:8080
```

Swagger:

```text
http://localhost:8080/swagger-ui/index.html
```

### 3. Tienda

```bash
cd tienda-frontend
npm install
ng serve
```

Disponible en:

```text
http://localhost:4200
```

### 4. Panel administrativo

```bash
cd admin-frontend
npm install
ng serve --port 4201
```

Disponible en:

```text
http://localhost:4201
```

---

## 👥 Roles del sistema

| Rol          | Acceso                                        |
| ------------ | --------------------------------------------- |
| `CLIENTE`    | Tienda pública, compras y consulta de pedidos |
| `ADMIN`      | Administración completa del sistema           |
| `PICKER`     | Preparación de pedidos                        |
| `REPARTIDOR` | Gestión de entregas                           |

La autenticación se maneja mediante **JWT y Google Authentication**, mientras que las rutas protegidas utilizan autorización basada en roles.

---

## 📁 Estructura de carpetas

### Backend

```text
src/main/java/com/tienda/productos/
├── config/
├── controller/
├── dto/
├── entity/
├── exception/
├── repository/
├── security/
├── service/
└── util/
```

### Frontends

```text
src/app/
├── core/
├── features/
└── shared/
```

---

## 👨‍💻 Autores

* **Maximiliano Juliano Lopez Avalos** — Coordinador del proyecto
* **Guido Alonso Lionel Lara Candela**

Proyecto académico — **Cibertec, Computación e Informática, 5to ciclo**.
