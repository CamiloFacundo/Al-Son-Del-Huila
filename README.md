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

- **PHP 8.3 o superior** con las extensiones `curl`, `fileinfo`, `mbstring`, `openssl`, `pdo_mysql`, `zip`, `gd` y `exif` (las dos últimas, para convertir fotos).
  El PHP 8.2 de XAMPP **no sirve**; se puede tener otro PHP aparte (p. ej. `C:\php84`).
- **Composer** 2
- **Node.js** 20 o superior y npm
- **MySQL/MariaDB** (el de XAMPP vale). El cliente `mysql` tiene que estar en el `PATH`
  (p. ej. `C:\xampp\mysql\bin`), porque Laravel lo usa para cargar el esquema.

## Puesta en marcha rápida (Windows)

Con los requisitos instalados, desde la carpeta del proyecto:

1. **`instalar.cmd`** (una sola vez): revisa PHP, Composer, MySQL y Node; crea `backend\.env` y pide las claves
   de Groq y Google si faltan; instala las dependencias; crea la base de datos con los 185 destinos (si ya tiene
   tablas, no la toca).
2. **`iniciar.cmd`** (cada vez): enciende MySQL de XAMPP si está apagado, abre las ventanas «API» (puerto 8000)
   y «Web» (puerto 5173) y abre `http://localhost:5173`. Para apagar, cierra esas dos ventanas.

Los scripts buscan PHP 8.3+ en `C:\php84`, `C:\php83` o el `PATH`; si está en otro sitio, define la variable
`PHP_BIN` con la ruta de `php.exe`. Abajo están los pasos manuales equivalentes.

## Puesta en marcha manual

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
| `php artisan destinos:buscar-fotos` | Busca fotos con licencia libre en Wikimedia Commons para los destinos sin foto y genera `storage/app/fotos-commons/revision.html` para revisarlas |
| `php artisan destinos:importar-fotos` | Descarga las fotos elegidas de Commons y/o importa fotos propias de `storage/app/fotos-propias/{id}.jpg` (con `--autor="Nombre"`), las convierte a WebP y guarda los créditos |
| `php artisan usuarios:admin correo@ejemplo.com` | Da el rol de administrador (acceso a `/admin` para gestionar destinos, etiquetas y fotos). Con `--quitar` lo retira |
| `php artisan correo:probar tu@correo.com` | Envía un correo de prueba para comprobar la configuración `MAIL_*` (recuperación de contraseña) |
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

## Funciones para usuarios

- **Reseñas**: 1 a 5 estrellas y comentario por destino (una por usuario, editable).
- **Favoritos**: el corazón de cada destino; se ven en *Perfil → Favoritos*.
- **Preferencias del quiz**: con sesión, las respuestas se guardan en la cuenta; el perfil muestra un resumen
  y permite ver la ruta recomendada sin repetir el quiz.
- **Recuperar contraseña**: *Login → ¿Olvidaste tu contraseña?* envía un enlace a `/restablecer`.
  En local los correos no se envían: se escriben en `backend/storage/logs/laravel.log` (`MAIL_MAILER=log`).
  Para enviarlos de verdad configura `MAIL_MAILER=smtp` y `MAIL_HOST`, `MAIL_PORT`, `MAIL_ENCRYPTION`, `MAIL_USERNAME`,
  `MAIL_PASSWORD` y `MAIL_FROM_ADDRESS` en `backend/.env` (en `.env.example` hay un ejemplo con Gmail y contraseña de aplicación)
  y compruébalo con `php artisan correo:probar tu@correo.com`.
- **Panel de administración** (`/admin`, solo rol admin): crear, editar y desactivar destinos, asignar etiquetas y
  tipos de viajero y subir fotos. Después de cambiar el catálogo ejecuta `php artisan catalogo:exportar`.

## Integración continua

En cada push a `main` y en cada pull request, GitHub Actions (`.github/workflows/ci.yml`) ejecuta
ESLint y el build del frontend, y los tests de la API contra un MariaDB 10.4.

## Seguridad

- Nunca subas `.env` al repositorio (está en `.gitignore`).
- Los tokens de sesión caducan a los 7 días (`SANCTUM_EXPIRATION`, en minutos).
- Login, registro y cambio de contraseña: máximo 5 intentos por minuto; chat: 20 por minuto.
