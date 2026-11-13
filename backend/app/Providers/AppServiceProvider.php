<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Notifications\Messages\MailMessage;
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

        // Recuperar contraseña: el enlace del correo abre la página de React, no una de Laravel
        ResetPassword::createUrlUsing(fn ($user, string $token) => config('services.frontend_url')
            . '/restablecer?' . http_build_query(['token' => $token, 'email' => $user->getEmailForPasswordReset()]));

        ResetPassword::toMailUsing(fn ($user, string $token) => (new MailMessage)
            ->subject('Restablece tu contraseña — Al Son del Huila')
            ->greeting('¡Hola, ' . $user->nombre . '!')
            ->line('Recibimos una solicitud para restablecer la contraseña de tu cuenta.')
            ->action('Elegir nueva contraseña', config('services.frontend_url') . '/restablecer?'
                . http_build_query(['token' => $token, 'email' => $user->getEmailForPasswordReset()]))
            ->line('El enlace caduca en 60 minutos.')
            ->line('Si no pediste este cambio, ignora este correo: tu contraseña seguirá siendo la misma.')
            ->salutation('Equipo Al Son del Huila'));
    }
}
