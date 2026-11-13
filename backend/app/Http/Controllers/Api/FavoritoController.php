<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Destino;
use Illuminate\Http\Request;

class FavoritoController extends Controller
{
    /** GET /api/perfil/favoritos — destinos guardados por el usuario, el último primero */
    public function index(Request $request)
    {
        $destinos = $request->user()->favoritos()
            ->with(['categoria', 'municipio', 'entorno'])
            ->orderByPivot('fecha', 'desc')
            ->get()
            ->each(fn ($d) => $d->es_favorito = true);

        return response()->json($destinos);
    }

    /** POST /api/destinos/{id}/favorito — añade o quita de favoritos */
    public function toggle(Request $request, int $id)
    {
        $destino = Destino::findOrFail($id);
        $cambios = $request->user()->favoritos()->toggle($destino->id);

        return response()->json(['favorito' => in_array($destino->id, $cambios['attached'])]);
    }
}
