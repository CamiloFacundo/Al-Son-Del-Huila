<?php

namespace App\Http\Controllers\Api;

use App\Models\Ruta;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class RutaController extends Controller
{
    public function index()
    {
        // Ruta pública: usar el guard sanctum para reconocer al usuario si manda token
        $userId = auth('sanctum')->id();

        $rutas = Ruta::where('publica', true)
            ->when($userId, fn ($q) => $q->orWhere('user_id', $userId))
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($rutas);
    }

    public function store(Request $request)
    {
        $datos = $request->validate([
            'nombre'     => 'required|string|max:150',
            'dias'       => 'nullable|integer|min:1|max:30',
            'destinos'   => 'nullable|array|max:50',
            'destinos.*' => 'integer|distinct|exists:destinos,id',
            'publica'    => 'sometimes|boolean',
        ]);

        $ruta = Ruta::create([
            'user_id'  => Auth::id(),
            'nombre'   => $datos['nombre'],
            'dias'     => $datos['dias'] ?? null,
            'destinos' => array_values($datos['destinos'] ?? []),
            'publica'  => $datos['publica'] ?? true,
        ]);
        return response()->json($ruta, 201);
    }

    public function destroy($id)
    {
        $ruta = Ruta::where('user_id', Auth::id())->findOrFail($id);
        $ruta->delete();
        return response()->json(['message' => 'Eliminada']);
    }
}