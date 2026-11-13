<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Límites de peticiones con nombre. Cada uno tiene su propio contador;
        // con "throttle:5,1" sin nombre todas las rutas compartirían el mismo contador por IP.
        $porUsuarioOIp = fn (Request $r) => $r->user('sanctum')?->id ?: $r->ip();

        // Login, registro y cambio de contraseña: 5 por minuto
        RateLimiter::for('auth', fn (Request $r) => Limit::perMinute(5)->by('auth|' . $r->ip()));

        // Intercambio del código de Google: 10 por minuto
        RateLimiter::for('google', fn (Request $r) => Limit::perMinute(10)->by('google|' . $r->ip()));

        // Asistente Huily (cada mensaje cuesta una llamada a Groq): 20 por minuto
        RateLimiter::for('chat', fn (Request $r) => Limit::perMinute(20)->by('chat|' . $porUsuarioOIp($r)));
    }
}
