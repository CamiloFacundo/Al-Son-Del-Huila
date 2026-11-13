<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Support\Imagenes;

class PerfilController extends Controller
{
    /**
     * Obtener los datos del perfil del usuario autenticado.
     * GET /api/perfil
     */
    public function show(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'id'            => $user->id,
            'nombre'        => $user->nombre,
            'email'         => $user->email,
            'bio'           => $user->bio,
            'ubicacion'     => $user->ubicacion_texto,
            'foto'          => $user->foto,
            'foto_portada'  => $user->foto_portada,
            'provider'      => $user->provider ?? 'local',
            'rol'           => $user->rol ?? 'turista',
            'fecha_registro'=> $user->created_at,
        ]);
    }

    /**
     * Actualizar la información del perfil.
     * PUT /api/perfil
     */
    public function update(Request $request)
    {
        $request->validate([
            'nombre'    => 'sometimes|string|max:100',
            'bio'       => 'sometimes|nullable|string|max:255',
            'ubicacion' => 'sometimes|nullable|string|max:100',
        ]);

        $user = $request->user();
        $user->nombre = $request->nombre ?? $user->nombre;
        // has() en vez de ??: así se puede vaciar la bio o la ubicación enviando "" o null
        if ($request->has('bio')) {
            $user->bio = $request->bio;
        }
        if ($request->has('ubicacion')) {
            $user->ubicacion_texto = $request->ubicacion;
        }
        $user->save();

        return response()->json([
            'id'            => $user->id,
            'nombre'        => $user->nombre,
            'email'         => $user->email,
            'bio'           => $user->bio,
            'ubicacion'     => $user->ubicacion_texto,
            'foto'          => $user->foto,
            'foto_portada'  => $user->foto_portada,
            'provider'      => $user->provider,
        ]);
    }

    /**
     * Subir foto de perfil o portada.
     * POST /api/perfil/foto
     */
    public function subirFoto(Request $request)
    {
        $request->validate([
            'foto' => 'required|image|max:8192',
            'tipo' => 'required|in:perfil,portada'
        ]);

        $user = $request->user();
        $columna = $request->tipo === 'portada' ? 'foto_portada' : 'foto';

        // Reducir (perfil 400 px, portada 1600 px), corregir rotación y guardar en WebP
        $webp = Imagenes::webp($request->file('foto')->get(), $columna === 'foto' ? 400 : 1600, 78);
        abort_if($webp === null, 422, 'No se pudo procesar la imagen.');

        $archivo = 'fotos/' . Str::uuid() . '.webp';
        Storage::disk('public')->put($archivo, $webp);

        // Borrar la foto anterior si era una subida aquí (no la de Google)
        $anterior = $user->getRawOriginal($columna);
        if ($anterior && preg_match('#(?:^|/)storage/(fotos/[^/]+)$#', $anterior, $m)) {
            Storage::disk('public')->delete($m[1]);
        }

        // En la BD se guarda la ruta relativa; el modelo devuelve la URL completa
        $user->forceFill([$columna => 'storage/' . $archivo])->save();

        return response()->json([
            'message' => 'Foto actualizada',
            'url'     => $user->{$columna},
        ]);
    }

    /**
     * Cambiar contraseña (solo para cuentas con email).
     * PUT /api/perfil/password
     */
    public function cambiarPassword(Request $request)
    {
        $request->validate([
            'password_actual' => 'required',
            'password_nuevo'  => 'required|min:8|confirmed',
        ]);

        $user = $request->user();
        if (!Hash::check($request->password_actual, $user->password)) {
            return response()->json([
                'message' => 'La contraseña actual es incorrecta'
            ], 422);
        }

        $user->password = Hash::make($request->password_nuevo);
        $user->save();

        return response()->json(['message' => 'Contraseña actualizada']);
    }
}