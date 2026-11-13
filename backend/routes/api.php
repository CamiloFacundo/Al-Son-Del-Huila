<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GoogleAuthController;
use App\Http\Controllers\Api\PasswordController;
use App\Http\Controllers\Api\PerfilController;
use App\Http\Controllers\Api\PreferenciaController;
use App\Http\Controllers\Api\DestinoController;
use App\Http\Controllers\Api\ResenaController;
use App\Http\Controllers\Api\FavoritoController;
use App\Http\Controllers\Api\PublicacionController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\RutaController;
use App\Http\Controllers\Api\MunicipioController;
use App\Http\Controllers\Api\EntornoController;
use App\Http\Controllers\Api\EtiquetaController;
use App\Http\Controllers\Api\TipoViajeroController;
use App\Http\Controllers\Api\RecomendadorController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\Admin\DestinoAdminController;

// ── Rutas públicas ───────────────────────────────────────────────
Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:auth');
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:auth');
Route::get('/auth/google', [GoogleAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);
Route::post('/auth/google/exchange', [GoogleAuthController::class, 'exchange'])->middleware('throttle:google');

// Recuperar contraseña: envía un enlace por correo y luego se fija la nueva
Route::post('/auth/forgot-password', [PasswordController::class, 'enviarEnlace'])->middleware('throttle:auth');
Route::post('/auth/reset-password', [PasswordController::class, 'restablecer'])->middleware('throttle:auth');

Route::get('/destinos', [DestinoController::class, 'index']);
Route::get('/destinos/buscar', [DestinoController::class, 'buscar']);
Route::get('/destinos/{id}', [DestinoController::class, 'show'])->whereNumber('id');
Route::get('/destinos/{id}/resenas', [ResenaController::class, 'index'])->whereNumber('id');
Route::get('/publicaciones', [PublicacionController::class, 'index']);
Route::get('/rutas', [RutaController::class, 'index']);

// Opciones de filtros
Route::get('/categorias', [CategoriaController::class, 'index']);
Route::get('/municipios', [MunicipioController::class, 'index']);
Route::get('/entornos', [EntornoController::class, 'index']);
Route::get('/etiquetas', [EtiquetaController::class, 'index']);
Route::get('/tipos-viajero', [TipoViajeroController::class, 'index']);

Route::post('/recomendar', [RecomendadorController::class, 'recomendar']);

// Asistente Huily (proxy a Groq; la API key solo vive en el backend)
Route::post('/chat', [ChatController::class, 'enviar'])->middleware('throttle:chat');

// ── Rutas con sesión ─────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/perfil', [PerfilController::class, 'show']);
    Route::put('/perfil', [PerfilController::class, 'update']);
    Route::post('/perfil/foto', [PerfilController::class, 'subirFoto']);
    Route::put('/perfil/password', [PerfilController::class, 'cambiarPassword'])->middleware('throttle:auth');
    Route::get('/perfil/mis-publicaciones', [PublicacionController::class, 'misPublicaciones']);
    Route::get('/perfil/favoritos', [FavoritoController::class, 'index']);
    Route::get('/perfil/preferencias', [PreferenciaController::class, 'show']);
    Route::put('/perfil/preferencias', [PreferenciaController::class, 'update']);

    Route::post('/destinos/{id}/favorito', [FavoritoController::class, 'toggle'])->whereNumber('id');
    Route::post('/destinos/{id}/resenas', [ResenaController::class, 'store'])->whereNumber('id');
    Route::delete('/destinos/{id}/resenas', [ResenaController::class, 'destroy'])->whereNumber('id');

    Route::post('/publicaciones', [PublicacionController::class, 'store']);
    Route::post('/publicaciones/{id}/like', [PublicacionController::class, 'like']);
    Route::put('/publicaciones/{id}', [PublicacionController::class, 'update']);
    Route::delete('/publicaciones/{id}', [PublicacionController::class, 'destroy']);

    Route::post('/rutas', [RutaController::class, 'store']);
    Route::delete('/rutas/{id}', [RutaController::class, 'destroy']);

    // ── Administración (usuarios con rol "admin") ──
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/destinos', [DestinoAdminController::class, 'index']);
        Route::post('/destinos', [DestinoAdminController::class, 'store']);
        Route::put('/destinos/{id}', [DestinoAdminController::class, 'update'])->whereNumber('id');
        Route::delete('/destinos/{id}', [DestinoAdminController::class, 'destroy'])->whereNumber('id');
        Route::post('/destinos/{id}/imagen', [DestinoAdminController::class, 'subirImagen'])->whereNumber('id');
    });
});
