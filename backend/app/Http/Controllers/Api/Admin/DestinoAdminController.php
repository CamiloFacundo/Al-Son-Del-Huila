<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Destino;
use App\Support\ImagenDestino;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Gestión del catálogo para usuarios con rol "admin" (middleware `admin`).
 * Tras cambiar el catálogo, ejecuta `php artisan catalogo:exportar` para que los demás reciban los cambios.
 */
class DestinoAdminController extends Controller
{
    /** GET /api/admin/destinos — todos, también los desactivados */
    public function index()
    {
        return response()->json(
            Destino::with(['categoria', 'municipio', 'entorno', 'etiquetas:id', 'tiposViajero:id'])
                ->orderBy('nombre')
                ->get()
        );
    }

    /** POST /api/admin/destinos */
    public function store(Request $request)
    {
        $datos = $this->validar($request);

        $destino = DB::transaction(function () use ($datos) {
            $destino = Destino::create($this->campos($datos));
            $this->sincronizar($destino, $datos);
            return $destino;
        });

        return response()->json($this->cargar($destino->id), 201);
    }

    /** PUT /api/admin/destinos/{id} */
    public function update(Request $request, int $id)
    {
        $destino = Destino::findOrFail($id);
        $datos = $this->validar($request);

        DB::transaction(function () use ($destino, $datos) {
            $destino->update($this->campos($datos));
            $this->sincronizar($destino, $datos);
        });

        return response()->json($this->cargar($destino->id));
    }

    /** DELETE /api/admin/destinos/{id} — lo desactiva (no se borra: tiene reseñas, rutas y favoritos) */
    public function destroy(int $id)
    {
        Destino::findOrFail($id)->update(['estado' => false]);

        return response()->json(['message' => 'Destino desactivado']);
    }

    /** POST /api/admin/destinos/{id}/imagen (multipart: imagen, autor?, licencia?, fuente?) */
    public function subirImagen(Request $request, int $id)
    {
        $destino = Destino::findOrFail($id);
        $datos = $request->validate([
            'imagen'   => 'required|image|max:8192',
            'autor'    => 'nullable|string|max:255',
            'licencia' => 'nullable|string|max:100',
            'fuente'   => 'nullable|url|max:500',
        ]);

        $ok = ImagenDestino::guardar($destino, $request->file('imagen')->get(), [
            'imagen_autor'    => $datos['autor'] ?? null,
            'imagen_licencia' => $datos['licencia'] ?? null,
            'imagen_fuente'   => $datos['fuente'] ?? null,
        ]);
        abort_unless($ok, 422, 'La imagen no se pudo procesar.');

        return response()->json($this->cargar($destino->id));
    }

    private function validar(Request $request): array
    {
        return $request->validate([
            'nombre'         => 'required|string|max:150',
            'descripcion'    => 'nullable|string|max:5000',
            'categoria_id'   => 'required|integer|exists:categorias,id',
            'municipio_id'   => 'required|integer|exists:municipios,id',
            'entorno_id'     => 'nullable|integer|exists:entornos,id',
            'latitud'        => 'required|numeric|between:-90,90',
            'longitud'       => 'required|numeric|between:-180,180',
            'direccion'      => 'nullable|string|max:255',
            'horario'        => 'nullable|string|max:100',
            'estado'         => 'boolean',
            'etiquetas'      => 'array',
            'etiquetas.*'    => 'integer|exists:etiquetas,id',
            'tipos_viajero'   => 'array',
            'tipos_viajero.*' => 'integer|exists:tipos_viajero,id',
        ]);
    }

    private function campos(array $datos): array
    {
        return collect($datos)->except(['etiquetas', 'tipos_viajero'])->all() + ['estado' => true];
    }

    private function sincronizar(Destino $destino, array $datos): void
    {
        if (array_key_exists('etiquetas', $datos)) {
            $destino->etiquetas()->sync($datos['etiquetas']);
        }
        if (array_key_exists('tipos_viajero', $datos)) {
            $destino->tiposViajero()->sync($datos['tipos_viajero']);
        }
    }

    private function cargar(int $id): Destino
    {
        return Destino::with(['categoria', 'municipio', 'entorno', 'etiquetas:id', 'tiposViajero:id'])->findOrFail($id);
    }
}
