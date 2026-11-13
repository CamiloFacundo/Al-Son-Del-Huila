<?php

namespace App\Support;

use App\Models\Destino;
use Illuminate\Support\Facades\File;

/**
 * Guarda la foto de un destino en public/images/Destinos/{id}.webp (máx. 1200 px, rotación corregida)
 * y actualiza la ruta y los créditos. La usan destinos:importar-fotos y el panel de administración.
 */
class ImagenDestino
{
    /** Devuelve false si los bytes no son una imagen válida. */
    public static function guardar(Destino $destino, string $bytes, array $creditos = []): bool
    {
        $webp = Imagenes::webp($bytes);
        if ($webp === null) {
            return false;
        }

        $relativa = "images/Destinos/{$destino->id}.webp";
        File::ensureDirectoryExists(public_path('images/Destinos'));
        File::put(public_path($relativa), $webp);

        $destino->forceFill(['imagen' => $relativa] + array_merge([
            'imagen_autor' => null,
            'imagen_licencia' => null,
            'imagen_fuente' => null,
        ], $creditos))->save();

        return true;
    }
}
