<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Destino;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * POST /api/recomendar
 * Recibe las respuestas del quiz:
 * { categorias: [ids], entornos: [ids], etiquetas: [ids], tipo_viajero: id, dias: n }
 * y devuelve { itinerario: [{ dia, destinos: [...] }], total }.
 *
 * Cada destino recibe una puntuación según cuánto coincide con las respuestas
 * y se eligen los mejores; los empates se desordenan para variar las rutas.
 */
class RecomendadorController extends Controller
{
    private const PESO_CATEGORIA = 3;
    private const PESO_ENTORNO   = 2;
    private const PESO_ETIQUETA  = 1;
    private const PESO_VIAJERO   = 1;

    public function recomendar(Request $request)
    {
        $datos = $request->validate([
            'categorias'   => 'nullable|array',
            'categorias.*' => 'integer',
            'entornos'     => 'nullable|array',
            'entornos.*'   => 'integer',
            'etiquetas'    => 'nullable|array',
            'etiquetas.*'  => 'integer',
            'tipo_viajero' => 'nullable|integer',
            'dias'         => 'nullable|integer|min:1|max:14',
        ]);

        $dias       = (int) ($datos['dias'] ?? 2);
        $categorias = $datos['categorias'] ?? [];
        $entornos   = $datos['entornos'] ?? [];
        $etiquetas  = $datos['etiquetas'] ?? [];
        $viajero    = $datos['tipo_viajero'] ?? null;

        // ~3 destinos por día, entre 4 y 21 en total
        $limite = min(max($dias * 3, 4), 21);

        try {
            $destinos = DB::table('destinos as d')
                ->leftJoin('categorias as c', 'd.categoria_id', '=', 'c.id')
                ->leftJoin('municipios as m', 'd.municipio_id', '=', 'm.id')
                ->where('d.estado', 1)
                ->select(
                    'd.id',
                    'd.nombre',
                    'd.descripcion',
                    'd.imagen',
                    'd.latitud',
                    'd.longitud',
                    'd.categoria_id',
                    'd.entorno_id',
                    'c.nombre as categoria',
                    'm.nombre as municipio'
                )
                ->get();

            if ($destinos->isEmpty()) {
                return response()->json(['itinerario' => [], 'total' => 0]);
            }

            $etiquetasPorDestino = $this->pivote('destinos_etiquetas', 'etiqueta_id');
            $viajeroPorDestino   = $this->pivote('destinos_tipos_viajero', 'tipo_viajero_id');

            $puntuados = $destinos->map(function ($d) use ($categorias, $entornos, $etiquetas, $viajero, $etiquetasPorDestino, $viajeroPorDestino) {
                $puntos = 0;
                if (in_array($d->categoria_id, $categorias)) {
                    $puntos += self::PESO_CATEGORIA;
                }
                if (in_array($d->entorno_id, $entornos)) {
                    $puntos += self::PESO_ENTORNO;
                }
                $comunes = array_intersect($etiquetasPorDestino[$d->id] ?? [], $etiquetas);
                $puntos += count($comunes) * self::PESO_ETIQUETA;
                if ($viajero && in_array($viajero, $viajeroPorDestino[$d->id] ?? [])) {
                    $puntos += self::PESO_VIAJERO;
                }
                $d->puntuacion = $puntos;
                $d->desempate  = mt_rand();
                return $d;
            });

            $elegidos = $puntuados
                ->sortBy([['puntuacion', 'desc'], ['desempate', 'asc']])
                ->take($limite)
                ->map(function ($d) {
                    unset($d->desempate, $d->categoria_id, $d->entorno_id);
                    $d->imagen = Destino::urlImagen($d->imagen);
                    return $d;
                })
                ->values();

            // Repartir los destinos entre los días
            $porDia = (int) ceil($elegidos->count() / $dias);
            $itinerario = [];
            for ($i = 0; $i < $dias; $i++) {
                $slice = $elegidos->slice($i * $porDia, $porDia)->values();
                if ($slice->isNotEmpty()) {
                    $itinerario[] = ['dia' => $i + 1, 'destinos' => $slice];
                }
            }

            return response()->json([
                'itinerario' => $itinerario,
                'total'      => $elegidos->count(),
            ]);
        } catch (\Throwable $e) {
            Log::error('Error en recomendador: ' . $e->getMessage());
            return response()->json([
                'itinerario' => [],
                'total'      => 0,
                'message'    => 'No se pudo generar la recomendación.',
            ], 500);
        }
    }

    /**
     * Devuelve [destino_id => [ids relacionados]] de una tabla pivote.
     * Si la tabla no existe o está vacía, devuelve [] y simplemente no suma puntos.
     */
    private function pivote(string $tabla, string $columna): array
    {
        try {
            return DB::table($tabla)
                ->get(['destino_id', $columna])
                ->groupBy('destino_id')
                ->map(fn ($filas) => $filas->pluck($columna)->all())
                ->all();
        } catch (\Throwable $e) {
            return [];
        }
    }
}
