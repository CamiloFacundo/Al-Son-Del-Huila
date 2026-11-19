<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Destino;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DestinoController extends Controller
{
    // GET /api/destinos
    public function index(Request $request)
    {
        $query = Destino::with(['categoria', 'municipio', 'entorno'])
            ->where('estado', true);
        $this->marcarFavoritos($query);

        // Filtro por categoría
        if ($request->has('categoria')) {
            $query->where('categoria_id', $request->categoria);
        }

        // Filtro por entorno
        if ($request->has('entorno')) {
            $query->where('entorno_id', $request->entorno);
        }

        // Filtro por municipio
        if ($request->has('municipio')) {
            $query->where('municipio_id', $request->municipio);
        }

        // Filtro por etiquetas (?etiquetas=3,4)
        if ($request->filled('etiquetas')) {
            $etiquetas = array_filter(array_map('intval', explode(',', $request->etiquetas)));
            $query->whereHas('etiquetas', fn ($q) => $q->whereIn('etiquetas.id', $etiquetas));
        }

        // Búsqueda por texto
        if ($request->has('busqueda')) {
            $busqueda = $request->busqueda;
            $query->where(function($q) use ($busqueda) {
                $q->where('nombre',      'like', "%$busqueda%")
                  ->orWhere('descripcion','like', "%$busqueda%");
            });
        }

        return response()->json($query->get());
    }

    /** Añade es_favorito (true/false) a cada destino según el usuario con sesión, si lo hay */
    private function marcarFavoritos($query): void
    {
        $userId = auth('sanctum')->id() ?? 0;
        $query->withExists(['favoritoDe as es_favorito' => fn ($q) => $q->where('usuario_id', $userId)]);
    }

    /**
     * GET /api/destinos/populares?limite=6 — los destinos cuya ficha más se ha abierto.
     * Desempata con la valoración y luego con un orden diario, para que al empezar sin visitas haya variedad.
     */
    public function populares(Request $request)
    {
        $limite = min(max((int) $request->input('limite', 6), 1), 24);
        $query = Destino::with(['categoria', 'municipio', 'entorno'])->where('estado', true);
        $this->marcarFavoritos($query);

        return response()->json(
            $query->orderByDesc('visitas')
                ->orderByDesc('rating_promedio')
                ->orderByRaw('imagen IS NULL') // primero los que tienen foto
                // Empates (p. ej. al empezar sin visitas): orden al azar pero fijo durante el día,
                // así la portada muestra todo el departamento y no solo los primeros IDs (Neiva)
                ->orderByRaw('RAND(?)', [(int) now()->format('Ymd')])
                ->limit($limite)
                ->get()
        );
    }

    /**
     * POST /api/destinos/{id}/visita — suma una visita al abrir la ficha.
     * Cuenta una vez por persona (IP) y destino cada 6 horas para que recargar no infle el contador.
     */
    public function visita(Request $request, int $id)
    {
        $destino = Destino::where('estado', true)->findOrFail($id);
        $clave = 'visita:' . $destino->id . ':' . sha1((string) $request->ip());

        if (Cache::add($clave, true, now()->addHours(6))) {
            $destino->increment('visitas');
        }

        return response()->json(['visitas' => (int) $destino->fresh()->visitas]);
    }

    // GET /api/destinos/{id}
    public function show($id)
    {
        $query = Destino::with(['categoria', 'municipio', 'entorno', 'etiquetas', 'tiposViajero']);
        $this->marcarFavoritos($query);
        $destino = $query->findOrFail($id);

        return response()->json($destino);
    }

    // GET /api/destinos/buscar?q=aventura+rio
public function buscar(Request $request)
{
    $query = $request->input('q', '');
    if (strlen($query) < 2) {
        return response()->json([]);
    }

    $destinos = Destino::with(['categoria', 'municipio'])
        ->where('estado', true)
        ->where(function($q) use ($query) {
            $q->where('nombre', 'like', "%{$query}%")
              ->orWhere('descripcion', 'like', "%{$query}%")
              ->orWhereHas('categoria', function($cat) use ($query) {
                  $cat->where('nombre', 'like', "%{$query}%");
              })
              ->orWhereHas('municipio', function($mun) use ($query) {
                  $mun->where('nombre', 'like', "%{$query}%");
              });
        })
        ->limit(10)
        ->get();

    return response()->json($destinos);
}
}