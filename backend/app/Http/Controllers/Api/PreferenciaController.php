<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Preferencias de viaje del usuario (las respuestas del quiz), guardadas en
 * preferencias_usuario y en las tablas usuarios_categorias / _entornos / _etiquetas / _tipos_viajero.
 * Mismo formato que manda el quiz: { categorias: [], entornos: [], etiquetas: [], tipo_viajero, dias }
 */
class PreferenciaController extends Controller
{
    private const TABLAS = [
        'categorias'   => ['usuarios_categorias', 'categoria_id', 'categorias'],
        'entornos'     => ['usuarios_entornos', 'entorno_id', 'entornos'],
        'etiquetas'    => ['usuarios_etiquetas', 'etiqueta_id', 'etiquetas'],
    ];

    /** GET /api/perfil/preferencias — null si el usuario aún no hizo el quiz */
    public function show(Request $request)
    {
        return response()->json($this->leer($request->user()->id));
    }

    /** PUT /api/perfil/preferencias */
    public function update(Request $request)
    {
        $datos = $request->validate([
            'categorias'   => 'present|array',
            'categorias.*' => 'integer|exists:categorias,id',
            'entornos'     => 'present|array',
            'entornos.*'   => 'integer|exists:entornos,id',
            'etiquetas'    => 'present|array',
            'etiquetas.*'  => 'integer|exists:etiquetas,id',
            'tipo_viajero' => 'nullable|integer|exists:tipos_viajero,id',
            'dias'         => 'nullable|integer|min:1|max:14',
        ]);
        $userId = $request->user()->id;

        DB::transaction(function () use ($datos, $userId) {
            foreach (self::TABLAS as $clave => [$tabla, $columna]) {
                DB::table($tabla)->where('usuario_id', $userId)->delete();
                $filas = collect($datos[$clave])->unique()->map(fn ($id) => ['usuario_id' => $userId, $columna => $id]);
                DB::table($tabla)->insert($filas->all());
            }

            DB::table('usuarios_tipos_viajero')->where('usuario_id', $userId)->delete();
            if (!empty($datos['tipo_viajero'])) {
                DB::table('usuarios_tipos_viajero')->insert(['usuario_id' => $userId, 'tipo_viajero_id' => $datos['tipo_viajero']]);
            }

            DB::table('preferencias_usuario')->updateOrInsert(
                ['usuario_id' => $userId],
                ['dias' => $datos['dias'] ?? null]
            );
        });

        return response()->json($this->leer($userId));
    }

    private function leer(int $userId): ?array
    {
        $base = DB::table('preferencias_usuario')->where('usuario_id', $userId)->first();
        if (!$base) {
            return null;
        }

        $prefs = [];
        foreach (self::TABLAS as $clave => [$tabla, $columna]) {
            $prefs[$clave] = DB::table($tabla)->where('usuario_id', $userId)->orderBy($columna)->pluck($columna)->all();
        }
        $prefs['tipo_viajero'] = DB::table('usuarios_tipos_viajero')->where('usuario_id', $userId)->value('tipo_viajero_id');
        $prefs['dias'] = $base->dias;

        return $prefs;
    }
}
