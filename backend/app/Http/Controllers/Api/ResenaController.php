<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Destino;
use App\Models\Resena;
use Illuminate\Http\Request;

class ResenaController extends Controller
{
    /** GET /api/destinos/{id}/resenas — públicas; si hay sesión devuelve aparte la del usuario */
    public function index(int $id)
    {
        $destino = Destino::findOrFail($id);
        $userId = auth('sanctum')->id();

        $resenas = Resena::with('user:id,nombre,foto')
            ->where('destino_id', $destino->id)
            ->orderByDesc('fecha')
            ->limit(50)
            ->get();

        return response()->json([
            'promedio'  => (float) $destino->rating_promedio,
            'total'     => (int) $destino->getAttribute('total_reseñas'),
            'mi_resena' => $userId ? $resenas->firstWhere('usuario_id', $userId) : null,
            'resenas'   => $resenas,
        ]);
    }

    /** POST /api/destinos/{id}/resenas — crea o actualiza la reseña del usuario (una por destino) */
    public function store(Request $request, int $id)
    {
        $destino = Destino::findOrFail($id);
        $datos = $request->validate([
            'rating'     => 'required|integer|between:1,5',
            'comentario' => 'nullable|string|max:1000',
        ]);

        $resena = Resena::updateOrCreate(
            ['usuario_id' => $request->user()->id, 'destino_id' => $destino->id],
            ['rating' => $datos['rating'], 'comentario' => $datos['comentario'] ?? null]
        );
        Resena::recalcular($destino->id);

        return response()->json(
            Resena::with('user:id,nombre,foto')->find($resena->id),
            $resena->wasRecentlyCreated ? 201 : 200
        );
    }

    /** DELETE /api/destinos/{id}/resenas — borra la reseña propia */
    public function destroy(Request $request, int $id)
    {
        $borradas = Resena::where('usuario_id', $request->user()->id)->where('destino_id', $id)->delete();
        abort_if($borradas === 0, 404);
        Resena::recalcular($id);

        return response()->json(['message' => 'Reseña eliminada']);
    }
}
