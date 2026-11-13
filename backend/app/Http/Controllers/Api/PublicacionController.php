<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Publicacion;
use App\Models\PublicacionLike;
use App\Support\Imagenes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Muro de Actividades: publicaciones con foto, likes y comentarios.
 * Las fotos se guardan en storage/app/public/publicaciones/{uuid}.webp y en la BD como
 * "storage/publicaciones/{uuid}.webp" (las sirve routes/web.php).
 */
class PublicacionController extends Controller
{
    private const POR_PAGINA = 10;

    /**
     * GET /api/publicaciones?page=N — feed público paginado (10 por página, lo más nuevo primero).
     * Devuelve { data: [...], pagina_siguiente: N|null }. Con sesión marca liked_by_user.
     */
    public function index(Request $request)
    {
        // Ruta pública: hay que pedir el guard sanctum explícitamente para reconocer al usuario
        $user = auth('sanctum')->user();

        $pagina = Publicacion::with('user:id,nombre,foto')
            ->withCount(['likes', 'comentarios'])
            ->withExists(['likes as liked_by_user' => fn ($q) => $q->where('usuario_id', $user?->id ?? 0)])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->simplePaginate(self::POR_PAGINA);

        return response()->json([
            'data' => $pagina->items(),
            'pagina_siguiente' => $pagina->hasMorePages() ? $pagina->currentPage() + 1 : null,
        ]);
    }

    /** POST /api/publicaciones (multipart: imagen, descripcion?, ubicacion?) */
    public function store(Request $request)
    {
        $request->validate([
            'imagen'      => 'required|image|max:8192',
            'descripcion' => 'nullable|string|max:255',
            'ubicacion'   => 'nullable|string|max:100',
        ], [
            'imagen.required' => 'Elige una foto.',
            'imagen.image'    => 'El archivo debe ser una imagen (JPG, PNG o WebP).',
            'imagen.max'      => 'La foto no puede pesar más de 8 MB.',
        ]);

        // Reducir a 1400 px, corregir la rotación de las fotos de móvil y guardar en WebP
        $webp = Imagenes::webp($request->file('imagen')->get(), 1400, 75);
        abort_if($webp === null, 422, 'No se pudo procesar la imagen.');

        $archivo = 'publicaciones/' . Str::uuid() . '.webp';
        Storage::disk('public')->put($archivo, $webp);

        $publicacion = Publicacion::create([
            'user_id'     => $request->user()->id,
            'imagen'      => 'storage/' . $archivo,
            'descripcion' => $request->descripcion,
            'ubicacion'   => $request->ubicacion,
        ]);

        return response()->json($this->cargar($publicacion->id, $request->user()->id), 201);
    }

    /** POST /api/publicaciones/{id}/like — da o quita el like */
    public function like(Request $request, $id)
    {
        $user = $request->user();
        $publicacion = Publicacion::findOrFail($id);

        $borrados = PublicacionLike::where('usuario_id', $user->id)->where('publicacion_id', $publicacion->id)->delete();
        if (!$borrados) {
            PublicacionLike::create(['usuario_id' => $user->id, 'publicacion_id' => $publicacion->id]);
        }

        return response()->json(['likes' => $publicacion->likes()->count(), 'liked' => !$borrados]);
    }

    /** GET /api/perfil/mis-publicaciones */
    public function misPublicaciones(Request $request)
    {
        $user = $request->user();

        $publicaciones = Publicacion::where('user_id', $user->id)
            ->with('user:id,nombre,foto')
            ->withCount(['likes', 'comentarios'])
            ->withExists(['likes as liked_by_user' => fn ($q) => $q->where('usuario_id', $user->id)])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($publicaciones);
    }

    /** PUT /api/publicaciones/{id} — solo el autor */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $publicacion = Publicacion::findOrFail($id);
        abort_unless($publicacion->user_id === $user->id, 403, 'No autorizado');

        $request->validate([
            'descripcion' => 'nullable|string|max:255',
            'ubicacion'   => 'nullable|string|max:100',
        ]);

        // has() en vez de ??: así se puede vaciar la descripción o la ubicación
        if ($request->has('descripcion')) {
            $publicacion->descripcion = $request->descripcion;
        }
        if ($request->has('ubicacion')) {
            $publicacion->ubicacion = $request->ubicacion;
        }
        $publicacion->save();

        return response()->json($this->cargar($publicacion->id, $user->id));
    }

    /** DELETE /api/publicaciones/{id} — el autor o un administrador (moderación) */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $publicacion = Publicacion::findOrFail($id);
        abort_unless($publicacion->user_id === $user->id || $user->esAdmin(), 403, 'No autorizado');

        $this->borrarArchivo($publicacion->getRawOriginal('imagen'));
        $publicacion->delete(); // likes y comentarios se borran en cascada

        return response()->json(['message' => 'Publicación eliminada']);
    }

    /** Borra la foto del disco si es una de las subidas a storage/publicaciones */
    private function borrarArchivo(?string $ruta): void
    {
        if ($ruta && preg_match('#(?:^|/)storage/(publicaciones/[^/]+)$#', $ruta, $m)) {
            Storage::disk('public')->delete($m[1]);
        }
    }

    private function cargar(int $id, ?int $userId): Publicacion
    {
        return Publicacion::with('user:id,nombre,foto')
            ->withCount(['likes', 'comentarios'])
            ->withExists(['likes as liked_by_user' => fn ($q) => $q->where('usuario_id', $userId ?? 0)])
            ->findOrFail($id);
    }
}
