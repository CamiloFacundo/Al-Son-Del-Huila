<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Solo deja pasar a usuarios con rol "admin" (usuarios.rol). Para dar el rol: php artisan usuarios:admin email */
class EsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless($request->user()?->esAdmin(), 403, 'Solo para administradores.');

        return $next($request);
    }
}
