<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

/**
 * Recuperar contraseña con el sistema de Laravel (tabla password_reset_tokens).
 * El enlace del correo apunta al frontend: {FRONTEND_URL}/restablecer?token=...&email=...
 * (ver AppServiceProvider). En local los correos se escriben en storage/logs/laravel.log.
 */
class PasswordController extends Controller
{
    /** POST /api/auth/forgot-password { email } */
    public function enviarEnlace(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        Password::sendResetLink($request->only('email'));

        // Misma respuesta exista o no la cuenta, para no revelar qué correos están registrados
        return response()->json([
            'message' => 'Si el correo está registrado, te enviamos un enlace para restablecer la contraseña.',
        ]);
    }

    /** POST /api/auth/reset-password { token, email, password, password_confirmation } */
    public function restablecer(Request $request)
    {
        $request->validate([
            'token'    => 'required|string',
            'email'    => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $estado = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, string $password) {
                $user->forceFill(['password' => $password])->save(); // el cast 'hashed' la cifra
                $user->tokens()->delete(); // cerrar las sesiones abiertas
                event(new PasswordReset($user));
            }
        );

        if ($estado !== Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'El enlace no es válido o ya caducó. Pide uno nuevo.',
            ], 422);
        }

        return response()->json(['message' => 'Contraseña actualizada. Ya puedes iniciar sesión.']);
    }
}
