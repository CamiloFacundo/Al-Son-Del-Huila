# Al Son del Huila

[![CI](https://github.com/CamiloFacundo/Al-Son-Del-Huila/actions/workflows/ci.yml/badge.svg)](https://github.com/CamiloFacundo/Al-Son-Del-Huila/actions/workflows/ci.yml)

Aplicación web de turismo para el departamento del Huila (Colombia): catálogo de destinos, mapa, rutas personalizadas, un quiz que recomienda itinerarios, el asistente **Huily** (IA) y un muro de experiencias.

| Parte | Tecnología | Carpeta |
|---|---|---|
| Backend (API) | Laravel 13 · PHP 8.3+ · Sanctum · Socialite (Google) | `backend/` |
| Frontend | React 19 · Vite · React Router · Leaflet | `frontend/` |
| Base de datos | MySQL / MariaDB | esquema en `backend/database/schema/` |
| IA | Groq (llamado desde el backend) | `ChatController` |

---

## Requisitos

- **PHP 8.3 o superior** con las extensiones `curl`, `fileinfo`, `mbstring`, `openssl`, `pdo_mysql`, `zip`.
  El PHP 8.2 de XAMPP **no sirve**; se puede tener otro PHP aparte (p. ej. `C:\php84`).
- **Composer** 2
- **Node.js** 20 o superior y npm
- **MySQL/MariaDB** (el de XAMPP vale). El cliente `mysql` tiene que estar en el `PATH`
  (p. ej. `C:\xampp\mysql\bin`), porque Laravel lo usa para cargar el esquema.

## Puesta en marcha

### 1. Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Edita `backend/.env`:

- `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`: tu base de datos (créala vacía antes).
- `GROQ_API_KEY`: clave de [console.groq.com](https://console.groq.com) para el asistente Huily.
- `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`: para el login con Google (Google Cloud Console).
  La URI de redirección autorizada debe ser `http://localhost:8000/api/auth/google/callback`.

Crea las tablas y carga el catálogo (categorías, municipios, 185 destinos, etiquetas…):

```bash
php artisan migrate:fresh --seed
php artisan serve
```

La API queda en `http://localhost:8000/api`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

La web queda en `http://localhost:5173`.

> ⚠️ En `frontend/.env` solo van variables públicas (`VITE_...`): todo lo que empieza por `VITE_`
> termina dentro del JavaScript que descarga el navegador. Las claves (Groq, Google) van **solo** en `backend/.env`.

---

## Comandos útiles

| Comando (en `backend/`) | Para qué |
|---|---|
| `php artisan test` | Ejecuta los tests de la API (usa la BD `al_son_del_huila_test`; créala vacía una vez) |
| `php artisan catalogo:exportar` | Si cambias destinos/categorías/etiquetas en tu BD, regenera `database/seeders/data/*.json` para que los demás reciban los cambios |
| `php artisan schedule:work` | Ejecuta las tareas programadas (borrado diario de tokens caducados) |
| `php artisan route:list --path=api` | Lista los endpoints |

| Comando (en `frontend/`) | Para qué |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compila para producción en `dist/` |
| `npm run lint` | Revisa el código con ESLint |

## Estructura

```
backend/
  app/Http/Controllers/Api/   Controladores de la API
  app/Models/                 Modelos (User → tabla usuarios, Destino, Publicacion, Ruta…)
  database/schema/            Esquema completo de la BD (php artisan schema:dump)
  database/seeders/data/      Catálogo en JSON (php artisan catalogo:exportar)
  routes/api.php              Rutas de la API
  tests/Feature/              Tests de la API
frontend/
  src/pages/                  Páginas (Catálogo, Mapa, Rutas, Quiz, Perfil…)
  src/components/             Componentes reutilizables
  src/api/ y src/services/    Llamadas a la API (axios con el token)
  src/context/AuthContext.jsx Sesión del usuario
```

## Cambios en la base de datos

El esquema actual está en `backend/database/schema/mysql-schema.sql`. Para cualquier cambio nuevo
(columnas, tablas) crea una migración con `php artisan make:migration ...`; no edites el esquema a mano.
Cuando acumules varias, puedes regenerarlo con `php artisan schema:dump`.

## Integración continua

En cada push a `main` y en cada pull request, GitHub Actions (`.github/workflows/ci.yml`) ejecuta
ESLint y el build del frontend, y los tests de la API contra un MariaDB 10.4.

## Seguridad

- Nunca subas `.env` al repositorio (está en `.gitignore`).
- Los tokens de sesión caducan a los 7 días (`SANCTUM_EXPIRATION`, en minutos).
- Login, registro y cambio de contraseña: máximo 5 intentos por minuto; chat: 20 por minuto.
