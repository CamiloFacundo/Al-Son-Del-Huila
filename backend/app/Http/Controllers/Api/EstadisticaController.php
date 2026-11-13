<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/** GET /api/estadisticas — cifras reales para la portada (en caché 10 minutos) */
class EstadisticaController extends Controller
{
    public function index()
    {
        $datos = Cache::remember('estadisticas_portada', now()->addMinutes(10), fn () => [
            'destinos'   => DB::table('destinos')->where('estado', 1)->count(),
            'municipios' => DB::table('destinos')->where('estado', 1)->distinct()->count('municipio_id'),
            'categorias' => DB::table('categorias')->count(),
            'resenas'    => DB::table('reseñas')->count(),
        ]);

        return response()->json($datos);
    }
}
