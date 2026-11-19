<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GoogleAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $user = User::where('google_id', $googleUser->getId())
                ->orWhere('email', $googleUser->getEmail())
                ->first();

            if ($user) {
                $user->update([
                    'google_id'    => $googleUser->getId(),
                    'provider'     => 'google',
                    'foto'         => $user->foto ?? $googleUser->getAvatar(),
                    'google_token' => $googleUser->token,
                ]);
            } else {
                $user = User::create([
                    'nombre'       => $googleUser->getName(),
                    'email'        => $googleUser->getEmail(),
                    'google_id'    => $googleUser->getId(),
                    'provider'     => 'google',
                    'foto'         => $googleUser->getAvatar(),
                    'google_token' => $googleUser->token,
                    'password'     => null,
                    // El botón de Google avisa que al continuar se aceptan los Términos y la Privacidad
                    'terminos_aceptados_at' => now(),
                ]);
            }

            $token = $user->createToken('google_auth')->plainTextToken;

            // No mandamos el token por la URL (quedaría en el historial y en logs).
            // Mandamos un código de un solo uso que caduca en 60 s y el frontend
            // lo cambia por el token con POST /api/auth/google/exchange.
            $code = Str::random(64);
            Cache::put('google_auth:' . $code, $token, now()->addSeconds(60));

            $redirectUrl = config('services.frontend_url') . '/auth/google/callback?' . http_build_query(['code' => $code]);

            // Redirigir mediante JavaScript en la ventana principal para evitar problemas de frame
            return response()->make(
                '<!DOCTYPE html><html><head><script>window.top.location.href = ' . json_encode($redirectUrl, JSON_UNESCAPED_SLASHES | JSON_HEX_TAG) . ';</script></head><body></body></html>',
                200,
                ['Content-Type' => 'text/html']
            );

        } catch (\Exception $e) {
            Log::error('Google OAuth error: ' . $e->getMessage());
            return redirect(config('services.frontend_url') . '/login?error=google_failed');
        }
    }

    /**
     * Cambia el código de un solo uso por el token de Sanctum.
     * POST /api/auth/google/exchange  { code }
     */
    public function exchange(Request $request)
    {
        $request->validate(['code' => 'required|string|size:64']);

        // pull = leer y borrar: el código solo sirve una vez
        $token = Cache::pull('google_auth:' . $request->code);
        if (!$token) {
            return response()->json(['message' => 'Código inválido o caducado'], 401);
        }

        $user = \Laravel\Sanctum\PersonalAccessToken::findToken($token)?->tokenable;
        if (!$user) {
            return response()->json(['message' => 'Código inválido o caducado'], 401);
        }

        return response()->json([
            'token' => $token,
            'user'  => $user,
        ]);
    }
}
