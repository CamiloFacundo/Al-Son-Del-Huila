<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Esta app no tiene página de login en Laravel (el login está en React):
        // en /api/* no se redirige, se responde 401 en JSON.
        $middleware->redirectGuestsTo(fn ($request) => $request->is('api/*') ? null : config('services.frontend_url') . '/login');

        // Rutas /api/admin/*: solo usuarios con rol "admin"
        $middleware->alias(['admin' => \App\Http\Middleware\EsAdmin::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Las rutas /api/* siempre responden en JSON (p. ej. 401 si el token caducó),
        // aunque la petición no mande "Accept: application/json".
        // Sin esto Laravel intenta redirigir a la ruta "login", que no existe, y da error 500.
        $exceptions->shouldRenderJsonWhen(fn ($request) => $request->is('api/*') || $request->expectsJson());
    })->create();
