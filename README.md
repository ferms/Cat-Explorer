# 🐱 Cat Breeds Explorer

**Aplicación de exploración de razas de gatos** desarrollada con **Angular 21** y **PrimeNG**, que permite autenticación de usuarios, listado paginado de razas, filtros avanzados, vista de detalle con carrusel de imágenes y visualización en tabla comparativa.

El proyecto cumple con los lineamientos de una **prueba técnica Frontend Senior (Angular)**, incorporando arquitectura moderna con *standalone components*, *signals*, manejo de estado local, guards de autenticación, backend mock con Express y pruebas unitarias con **Vitest**.

---

## 🚀 Tecnologías principales

| Tecnología | Versión | Uso |
|-----------|--------|-----|
| **Angular** | ^21.0.x | Framework principal, standalone + signals |
| **Node.js** | 20+ | (versión recomendada: LTS) |
| **PrimeNG** | ^21.0.x | UI: Table, Carousel, Paginator, Forms |
| **PrimeIcons** | ^7.0.0 | Iconografía |
| **TailwindCSS** | ^4.x | Layout y utilidades visuales |
| **RxJS** | ^7.8 | Manejo de streams |
| **TypeScript** | ^5.9 | Tipado estricto |
| **Express** | ^5.x | API mock REST |
| **JWT** | — | Autenticación simulada |
| **Vitest** | ^4.x | Pruebas unitarias |
| **Angular SSR** | ^21 | Preparado para renderizado server-side |

---


## ⚙️ Instalación y ejecución

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/ferms/Cat-Explorer.git
cd cat-breeds-explorer
```

### 2️⃣ Instalar dependencias
```bash
npm install
```

### 3️⃣ Iniciar la API mock (Express o json-server)
```bash
npm run api
# o
npx json-server --watch api/db.json --port 4300 --delay 300
```

### 4️⃣ Iniciar la aplicación Angular
```bash
npm run web
```
> Esto ejecuta `ng serve --proxy-config proxy.conf.json -o` y abre el panel en el navegador.

### 5️⃣ Modo desarrollo completo (API + Web)
```bash
npm run dev
```
Ejecuta ambos procesos concurrentemente usando **concurrently**.

---

## 👤 Usuarios demo

| Rol | Email | Contraseña |
|------|--------|-------------|
| **Administrador** | `admin@demo.com` | `admin123` |
| **Usuario demo** | `demo@demo.com` | `123456` |

> Estos usuarios están definidos en el archivo `api/db.json` dentro de la clave `"users"` y se utilizan para simular el login del sistema.

---

## 🧠 Funcionalidades implementadas

✅ **Autenticación**
- Login / Register / Forgot Password
- Guards de ruta (`authGuard`, `guestGuard`)
- Persistencia de sesión en `localStorage`
- JWT simulado

✅ **Dashboard de razas de gatos**
- Listado paginado de razas de gatos
- Filtros por:
  - Texto
  - Orden (A–Z, Z–A, popularidad)
  - MultiSelect de razas
- Skeleton loaders
- Estado global manejado con **signals**

✅ **Vista de detalle**
- Información completa de la raza
- Carrusel de imágenes
- Ratings (inteligencia, energía, afecto)
- Chips de temperamento
- Navegación a tabla comparativa

✅ **Tabla comparativa**
- Vista en tabla con **PrimeNG Table**
- Búsqueda local
- Paginación
- Highlight de la raza seleccionada
- Navegación contextual (volver al detalle)

✅ **Testing**
- Pruebas unitarias con **Vitest**
- Tests para:
  - Servicios (`AuthService`, `CatsApiService`, `CatsStore`)
  - Guards
  - Páginas principales (Dashboard, Login, Register)
- Mocks controlados y aislamiento de dependencias


---

## 🧱 Scripts disponibles

| Script | Descripción |
|--------|--------------|
| `npm run api` | Levanta el servidor mock en `localhost:3000` |
| `npm run web` | Inicia Angular con proxy y abre el navegador |
| `npm run dev` | Ejecuta API y web en paralelo |
| `npm run build` | Compila la app para producción |
| `npm run watch` | Compila en modo observador |
| `npm run start` | Alias de `ng serve` |

---

## 🧩 Estructura del proyecto

```
src/
 ├── app/
 │   ├── core/
 │   │   ├── auth/        → auth.service, guards
 │   │   ├── services/    → cats-api, cats-store
 │   │   └── models/      → interfaces y tipos
 │   ├── ui/
 │   │   ├── auth/        → login, register
 │   │   └── dashboard/  → list, detail, table
 │   ├── shared/
 │   │   ├── components/ → cards, filters
 │   └── app.routes.ts
 ├── assets/
 └── environments/
api/
 └── server.js
```

---

## 🧠 Decisiones técnicas clave

| Aspecto | Decisión |
|--------|----------|
| **Estado** | Signals + servicios (sin NgRx) |
| **Arquitectura** | Standalone Components |
| **UI** | PrimeNG + TailwindCSS |
| **Autenticación** | JWT simulado + route guards |
| **Backend** | API mock con Express |
| **Testing** | Vitest (sin Karma / Jasmine) |
| **SSR** | Preparado para Angular SSR |


---

## ⚠️ Pendiente
- Contenerización Docker (Opcional).

---

## 👨‍💻 Autor

**Fernando Montaño**  
Frontend Engineer
📧 contacto: fer.montanosa@gmail.com
💼 [linkedin.com/in/fernandomontano](https://www.linkedin.com/in/fernando-monta%C3%B1o-651719200/)