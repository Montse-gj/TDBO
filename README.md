# TDBO — Gestor de gastos compartidos para viajes

> Aplicación web fullstack para gestionar gastos compartidos en viajes grupales. Permite crear grupos de viaje, añadir miembros, registrar gastos, dividir cuentas y saldar deudas entre participantes de forma sencilla.

---

## 🗂️ Estructura del proyecto

```txt
TDBO/
├── backend/          # API REST con Express + TypeScript + Sequelize
├── frontend/         # SPA con React + Vite + TypeScript
├── docker-compose.yml
├── .env.example
└── tdbo.sh           # Script de utilidades de desarrollo
```


---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
| :-- | :-- |
| **Frontend** | React, Vite, TypeScript, React Router |
| **Backend** | Node.js, Express, TypeScript |
| **Base de datos** | PostgreSQL |
| **ORM** | Sequelize |
| **Auth** | JWT (`jsonwebtoken`) + `bcrypt` |
| **Infraestructura** | Docker + Docker Compose |


---

## ✨ Funcionalidades

- **Autenticación** — Registro e inicio de sesión con tokens JWT.
- **Grupos de viaje** — Crea, actualiza y elimina grupos de viaje con fechas de inicio y fin.
- **Miembros** — Añade participantes al grupo buscando por nombre o correo electrónico.
- **Invitación por enlace** — Genera un enlace compartible para que cualquier persona pueda unirse al viaje. Si el usuario no está autenticado, se guarda la invitación pendiente y se reanuda el flujo tras iniciar sesión o registrarse.
- **Gastos** — Registra gastos indicando quién pagó y cómo se reparten entre los miembros.
- **Balances y liquidación** — Calcula cuánto debe aportar cada persona y propone las transferencias mínimas necesarias para saldar las deudas.

---

## 🚀 Puesta en marcha

### Requisitos previos

- Docker Desktop instalado y en ejecución.
- Git instalado.


### 1. Clonar el repositorio

```bash
git clone https://github.com/Montse-gj/TDBO.git
cd TDBO
```


### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Ejemplo de configuración:

```env
# DB
DB_USER=tu_usuario
DB_PASS=tu_contraseña
DB_PORT=5432
DB_NAME=tdbo-db
DB_HOST=db

# App
APP_PORT=3000
FRONT_PORT=5173

# Admin
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@tdbo.com
ADMIN_PASSWORD=contraseña_usuario_admin

# Auth
JWT_SECRET=una_clave_secreta_muy_larga
```


### 3. Levantar el proyecto

```bash
docker compose up --build
```

| Servicio | URL |
| :-- | :-- |
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Swagger UI | http://localhost:3000/api-docs |

> La base de datos se sincroniza automáticamente al arrancar. Si la tabla `users` está vacía, se cargan datos de prueba mediante el seed inicial.

---

## 📡 API reference

Todos los endpoints protegidos requieren la cabecera:

```http
Authorization: Bearer <token>
```


### Autenticación `/api/auth`

| Método | Ruta | Descripción | Auth |
| :-- | :-- | :-- | :-- |
| `POST` | `/register` | Registrar nuevo usuario | ❌ |
| `POST` | `/login` | Iniciar sesión | ❌ |

### Usuarios `/api/users`

| Método | Ruta | Descripción | Auth |
| :-- | :-- | :-- | :-- |
| `GET` | `/profile` | Obtener perfil propio | ✅ |
| `GET` | `/search?query=` | Buscar usuarios por nombre o email | ✅ |
| `GET` | `/` | Listar todos los usuarios | ✅ |

### Viajes `/api/trips`

| Método | Ruta | Descripción | Auth |
| :-- | :-- | :-- | :-- |
| `GET` | `/` | Obtener mis grupos de viaje | ✅ |
| `POST` | `/` | Crear un nuevo grupo | ✅ |
| `PUT` | `/:groupId` | Actualizar un grupo | ✅ miembro |
| `DELETE` | `/:groupId/delete` | Eliminar un grupo | ✅ miembro |
| `GET` | `/:groupId/public-info` | Obtener información pública del viaje | ❌ |
| `GET` | `/:groupId/members` | Listar miembros del grupo | ✅ miembro |
| `POST` | `/:groupId/members` | Añadir miembro por email o userId | ✅ miembro |
| `POST` | `/:groupId/join` | Unirse al viaje | ✅ |
| `DELETE` | `/:groupId/members/:userId` | Expulsar a un miembro | ✅ miembro |

### Gastos `/api/expenses`

| Método | Ruta | Descripción | Auth |
| :-- | :-- | :-- | :-- |
| `GET` | `/:groupId` | Listar gastos del grupo | ✅ miembro |
| `POST` | `/` | Crear un gasto | ✅ miembro |
| `PUT` | `/:expenseId` | Editar un gasto | ✅ miembro |
| `DELETE` | `/:expenseId` | Eliminar un gasto | ✅ miembro |
| `GET` | `/group/:groupId/balances` | Obtener balances y sugerencias de liquidación | ✅ miembro |


---

## 🔗 Sistema de invitación por enlace

Para invitar a alguien a un viaje:

1. En la página **Mis Viajes**, selecciona un grupo.
2. Copia el enlace de invitación generado automáticamente.
3. Comparte el enlace con la persona invitada.
4. Si la persona ya tiene sesión iniciada, puede unirse directamente.
5. Si no está autenticada, el sistema guarda la invitación pendiente y la reanuda después de iniciar sesión o registrarse.

El enlace tiene el formato `http://localhost:5173/join-trip/:tripId`.

---

## 🗃️ Modelos de base de datos

```txt
users         → user_id, user_name, user_email, user_password, when_created, is_admin
groups        → group_id, group_name, created_by, trip_starts, trip_ends
group_members → group_id, user_id
expenses      → expense_id, group_id, paid_by_user_id, amount, created_at, description
expense_splits→ split_id, expense_id, user_id, amount
```

Notas:

- `created_by` en `groups` guarda el nombre del creador como texto.
- `created_at` es la fecha del gasto; no existe un campo `date` en el modelo.
- `group_members` actúa como tabla intermedia entre usuarios y grupos.

---

## 📁 Estructura del backend

```txt
backend/src/
├── config/         # Conexión a la base de datos y Swagger
├── controllers/    # Lógica de negocio (auth, user, trip, expense)
├── middlewares/    # verifyToken y verifyGroupMembership
├── models/         # Modelos Sequelize y seed de datos iniciales
└── routes/         # Definición de rutas Express
```


---

## 📁 Estructura del frontend

```txt
frontend/src/
├── components/     # NavBar, Root
├── context/        # AuthContext
├── hooks/          # useTrips, useExpenses, useBalances
├── pages/          # Home, Login, Register, Trips, Expenses, Balance, JoinTripPage, User
├── styles/         # index.css, dashboard.css, NavBar.css
└── types/          # Tipos TypeScript compartidos
```

---

## 👥 Equipo

| Nombre | GitHub |
|---|---|
| Montse | [Montse-gj](https://github.com/Montse-gj) |
| Marcos | [marcossalinas26](https://github.com/marcossalinas26) |
| Luis | [lualvarimp](https://github.com/lualvarimp) |
| jonathan | [r3dc0m](https://github.com/r3dc0m) |

---

## 📄 Licencia

Distribuido bajo la licencia incluida en el archivo [LICENSE](./LICENSE).