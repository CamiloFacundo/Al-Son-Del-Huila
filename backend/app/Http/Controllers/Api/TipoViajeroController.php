<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TipoViajero;

class TipoViajeroController extends Controller
{
    public function index()
    {
        return response()->json(TipoViajero::orderBy('id')->get());
    }
}
