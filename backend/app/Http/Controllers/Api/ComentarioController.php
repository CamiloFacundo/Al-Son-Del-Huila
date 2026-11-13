<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Publicacion;
use App\Models\PublicacionComentario;
use Illuminate\Http\Request;

/** Comentarios de las publicaciones del muro de Actividades */
class ComentarioController extends Controller
{
    /** GET /api/publicaciones/{id}/comentarios — públicos, del más antiguo al más nuevo */
    public function index(int $id)
    {
        $publicacion = Publicacion::findOrFail($id);

        return response()->json(
            $publicacion->comentarios()->with('user:id,nombre,foto')->orderBy('created_at')->orderBy('id')->limit(200)->get()
        );
    }

    /** POST /api/publicaciones/{id}/comentarios { texto } */
    public function store(Request $request, int $id)
    {
        $publicacion = Publicacion::findOrFail($id);
        $datos = $request->validate(['texto' => 'required|string|max:500'], [
            'texto.required' => 'Escribe un comentario.',
            'texto.max'      => 'El comentario no puede pasar de 500 caracteres.',
        ]);

        $comentario = $publicacion->comentarios()->create([
            'usuario_id' => $request->user()->id,
            'texto'      => trim($datos['texto']),
        ]);

        return response()->json($comentario->load('user:id,nombre,foto'), 201);
    }

    /** DELETE /api/comentarios/{id} — su autor, el autor de la publicación o un administrador */
    public function destroy(Request $request, int $id)
    {
        $comentario = PublicacionComentario::with('publicacion:id,user_id')->findOrFail($id);
        $user = $request->user();

        abort_unless(
            $comentario->usuario_id === $user->id || $comentario->publicacion->user_id === $user->id || $user->esAdmin(),
            403,
            'No autorizado'
        );
        $comentario->delete();

        return response()->json(['message' => 'Comentario eliminado']);
    }
}
