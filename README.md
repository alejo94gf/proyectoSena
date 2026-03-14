# AhorroApp - Gestión de Ahorros y Gastos Personales

Aplicación web full-stack para controlar ingresos, gastos y metas de ahorro.

---

## Tecnologías

- **Frontend**: React 19 + Vite + Recharts
- **Backend**: Node.js + Express + JWT
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT (JSON Web Tokens)

---

## Estructura del Proyecto

```
/                    ← Frontend (React)
  src/
    context/         ← AuthContext (estado global de auth)
    services/        ← Cliente Axios (api.js)
    components/      ← Layout, Sidebar, Modal
    pages/           ← Dashboard, Ingresos, Gastos, Metas, Reportes, Admin

/backend/            ← Backend (Node.js + Express)
  config/            ← Conexión PostgreSQL
  controllers/       ← Lógica de negocio
  middleware/        ← Verificación JWT y roles
  routes/            ← Endpoints REST
  database/          ← Schema SQL
```

---

## Configuración y Ejecución

### 1. Requisitos previos

- Node.js >= 18
- PostgreSQL >= 14

### 2. Base de datos

Abre pgAdmin o psql y ejecuta el archivo `backend/database/schema.sql`:

```sql
-- En psql:
\i backend/database/schema.sql
```

Esto crea la base de datos `ahorro_db` con todas las tablas y categorías por defecto.

### 3. Configurar el Backend

Edita `backend/.env` con tus credenciales de PostgreSQL:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ahorro_db
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD_AQUI
JWT_SECRET=cambia_esto_por_algo_seguro
```

### 4. Instalar dependencias del Backend

```bash
cd backend
npm install
```

### 5. Iniciar el Backend

```bash
cd backend
npm run dev
```

El servidor corre en: http://localhost:5000

### 6. Instalar dependencias del Frontend (ya instaladas)

```bash
npm install
```

### 7. Iniciar el Frontend

```bash
npm run dev
```

La app corre en: http://localhost:5173

---

## Credenciales por defecto (Admin)

```
Email:    admin@ahorro.com
Password: password   (hash de bcrypt en el schema)
```

> Nota: el hash en el schema corresponde a la contraseña `password`. Cámbiala después del primer login.

---

## API Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/registro | Registro de usuario |
| POST | /api/auth/login | Login |
| GET | /api/ingresos | Listar ingresos |
| POST | /api/ingresos | Crear ingreso |
| GET | /api/gastos | Listar gastos |
| POST | /api/gastos | Crear gasto |
| GET | /api/metas | Listar metas |
| POST | /api/metas/:id/abonar | Abonar a meta |
| GET | /api/reportes/dashboard | Datos del dashboard |
| GET | /api/reportes/mensual | Reporte anual por mes |
| GET | /api/usuarios | Listar usuarios (solo admin) |

---

## Roles

- **usuario**: gestiona sus propios datos financieros
- **admin**: accede a panel de usuarios y reportes globales
