# TDBO — Trip Debt Balance Organizer

> Aplicación web fullstack para gestionar gastos compartidos en viajes grupales, al estilo Tricount. Crea grupos de viaje, añade gastos, divide cuentas y salda deudas entre amigos con facilidad.

---

## 🗂️ Estructura del Proyecto

```
TDBO/
├── backend/          # API REST con Express + TypeScript + Sequelize
├── frontend/         # SPA con React + Vite + TypeScript
├── docs/             # Diagramas y documentación
├── docker-compose.yml
├── .env.example
└── tdbo.sh           # Script de utilidades de desarrollo
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, React Router v6 |
| **Backend** | Node.js, Express 5, TypeScript, tsx |
| **Base de datos** | PostgreSQL 16 |
| **ORM** | Sequelize v6 |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **Infraestructura** | Docker + Docker Compose |

---

## ✨ Funcionalidades

- **Autenticación** — Registro e inicio de sesión con tokens JWT.
- **Grupos de Viaje** — Crea, edita y elimina grupos de viaje con fechas de inicio y fin.
- **Miembros** — Añade participantes al grupo buscando por nombre o correo electrónico.
- **Invitación por Enlace** — Genera un enlace compartible para que cualquier persona pueda unirse al viaje. Si no tiene cuenta, el sistema guarda la invitación y la procesa automáticamente tras el registro o inicio de sesión.
- **Gastos** — Registra gastos indicando quién pagó y cómo se divide entre los miembros.
- **Balances y Liquidación** — Calcula automáticamente quién le debe qué a quién y muestra las transferencias mínimas necesarias para saldar todas las deudas.

---

## 🚀 Puesta en Marcha

### Requisitos Previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución.
- [Git](https://git-scm.com/)

### 1. Clonar el repositorio

```bash
git clone https://github.com/Montse-gj/TDBO.git
cd TDBO
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus valores:

```env
DB_NAME=tdbo_db
DB_USER=tu_usuario
DB_PASS=tu_contraseña
DB_PORT=5432
APP_PORT=3000
JWT_SECRET=una_clave_secreta_muy_larga
```

### 3. Levantar el proyecto

```bash
docker compose up --build
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |

> La base de datos se sincroniza automáticamente al arrancar. Si la tabla `users` está vacía, se cargan datos de prueba (_seed_) automáticamente.

---

## 📡 API Reference

Todos los endpoints protegidos requieren la cabecera:
```
Authorization: Bearer <token>
```

### Autenticación `/api/auth`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `POST` | `/register` | Registrar nuevo usuario | ❌ |
| `POST` | `/login` | Iniciar sesión | ❌ |

### Usuarios `/api/users`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `GET` | `/profile` | Obtener perfil propio | ✅ |
| `GET` | `/search?query=` | Buscar usuarios por nombre o email | ✅ |
| `GET` | `/` | Listar todos los usuarios | ✅ |

### Viajes `/api/trips`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `GET` | `/` | Obtener mis grupos de viaje | ✅ |
| `POST` | `/` | Crear un nuevo grupo | ✅ |
| `PUT` | `/:groupId` | Actualizar un grupo | ✅ miembro |
| `DELETE` | `/:groupId/delete` | Eliminar un grupo | ✅ miembro |
| `GET` | `/:groupId/public-info` | Info pública del viaje (nombre) | ❌ |
| `GET` | `/:groupId/members` | Listar miembros del grupo | ✅ miembro |
| `POST` | `/:groupId/members` | Añadir miembro por email/userId | ✅ miembro |
| `POST` | `/:groupId/join` | Unirse al viaje (enlace de invitación) | ✅ |
| `DELETE` | `/:groupId/members/:userId` | Expulsar a un miembro | ✅ miembro |

### Gastos `/api/expenses`

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `GET` | `/:groupId` | Listar gastos del grupo | ✅ miembro |
| `POST` | `/:groupId` | Crear un gasto | ✅ miembro |
| `PUT` | `/:groupId/:expenseId` | Editar un gasto | ✅ miembro |
| `DELETE` | `/:groupId/:expenseId` | Eliminar un gasto | ✅ miembro |

---

## 🔗 Sistema de Invitación por Enlace

Para invitar a alguien que aún no tiene cuenta:

1. En la página **Mis Viajes**, selecciona un viaje.
2. Copia el **Enlace de Invitación** generado automáticamente.
3. Comparte el enlace (tiene el formato `http://localhost:5173/join-trip/:id`).
4. El invitado:
   - Si ya tiene cuenta → se une directamente al viaje.
   - Si no tiene cuenta → se le guarda la invitación, se registra/inicia sesión y se une automáticamente.

---

## 🗃️ Modelos de Base de Datos

```
users           → id, user_name, user_email, user_password, when_created, is_admin
groups          → group_id, group_name, created_by, trip_starts, trip_ends
group_members   → group_id, user_id
expenses        → expense_id, group_id, paid_by_user_id, description, amount, date
expense_splits  → split_id, expense_id, user_id, amount
```

---

## 🧰 Script de Utilidades (`tdbo.sh`)

```bash
# Dar permisos de ejecución (una sola vez)
chmod +x ./tdbo.sh

# Instalar dependencias y configurar .env básico
./tdbo.sh install <DB_USER> <DB_PASS>

# Levantar los contenedores sin reconstruir
./tdbo.sh up

# Detener los contenedores
./tdbo.sh down

# Reconstruir desde cero (útil en desarrollo)
./tdbo.sh rebuild

# Levantar pgAdmin para gestionar la BD desde el navegador
./tdbo.sh pgadmin up
./tdbo.sh pgadmin down
```

---

## 📁 Estructura del Backend

```
backend/src/
├── config/         # Conexión a la base de datos
├── controllers/    # Lógica de negocio (auth, trip, expense, user)
├── middlewares/    # verifyToken, verifyGroupMembership
├── models/         # Modelos Sequelize + seed de datos iniciales
└── routes/         # Definición de rutas Express
```

## 📁 Estructura del Frontend

```
frontend/src/
├── components/     # NavBar, Root
├── context/        # AuthContext (estado de sesión global)
├── hooks/          # useTrips (lógica de viajes reutilizable)
├── pages/          # Home, Login, Register, Trips, Expenses, JoinTripPage...
├── styles/         # index.css, dashboard.css, NavBar.css
└── types/          # Definiciones de tipos TypeScript compartidos
```

---

## 👥 Equipo

Proyecto desarrollado como práctica fullstack.

---

## 📄 Licencia

Distribuido bajo la licencia incluida en el archivo [LICENSE](./LICENSE).