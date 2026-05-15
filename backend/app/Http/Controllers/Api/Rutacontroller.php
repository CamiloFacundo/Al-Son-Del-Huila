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
        $rutas = Ruta::where('publica', true)
            ->orWhere('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($rutas);
    }

    public function store(Request $request)
    {
        $ruta = Ruta::create([
            'user_id' => Auth::id(),
            'nombre' => $request->nombre,
            'dias' => $request->dias,
            'destinos' => $request->destinos,
            'publica' => $request->publica ?? true,
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