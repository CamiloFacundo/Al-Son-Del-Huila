<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Destino;
use Illuminate\Http\Request;

class DestinoController extends Controller
{
    // GET /api/destinos
    public function index(Request $request)
    {
        // Eliminamos 'etiquetas' y 'tiposViajero' (causan error 500)
        $query = Destino::with(['categoria', 'municipio', 'entorno'])
            ->where('estado', true);

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

        // Filtro por etiquetas (comentado porque la tabla pivote no funciona)
        // if ($request->has('etiquetas')) {
        //     $etiquetas = explode(',', $request->etiquetas);
        //     $query->whereHas('etiquetas', function($q) use ($etiquetas) {
        //         $q->whereIn('etiquetas.id', $etiquetas);
        //     });
        // }

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

    // GET /api/destinos/{id}
    public function show($id)
    {
        // También eliminamos 'tiposViajero' (tabla no existe) y 'etiquetas' (opcional)
        $destino = Destino::with(['categoria', 'municipio', 'entorno'])
            ->findOrFail($id);

        return response()->json($destino);
    }

    // GET /api/destinos/buscar?q=aventura+rio
public function buscar(Request $request)
{
    $query = $request->input('q', '');
    if (strlen($query) < 2) {
        return response()->json([]);
    }

    // Búsqueda full-text en nombre, descripción, categoría, municipio
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