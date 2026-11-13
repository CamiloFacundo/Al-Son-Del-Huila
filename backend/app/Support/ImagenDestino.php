<?php

namespace App\Support;

use App\Models\Destino;
use Illuminate\Support\Facades\File;

/**
 * Guarda la foto de un destino: corrige la rotación EXIF, la reduce a máx. 1200 px de ancho,
 * la convierte a WebP en public/images/Destinos/{id}.webp y guarda la ruta y los créditos.
 * La usan el comando destinos:importar-fotos y el panel de administración.
 */
class ImagenDestino
{
    private const ANCHO_MAX = 1200;
    private const CALIDAD = 72;

    /** Devuelve false si los bytes no son una imagen válida. */
    public static function guardar(Destino $destino, string $bytes, array $creditos = []): bool
    {
        $img = @imagecreatefromstring($bytes);
        if (!$img) {
            return false;
        }

        $img = self::corregirOrientacion($img, $bytes);

        if (imagesx($img) > self::ANCHO_MAX) {
            $reducida = imagescale($img, self::ANCHO_MAX, -1, IMG_BICUBIC);
            imagedestroy($img);
            $img = $reducida;
        }

        File::ensureDirectoryExists(public_path('images/Destinos'));
        $relativa = "images/Destinos/{$destino->id}.webp";
        imagewebp($img, public_path($relativa), self::CALIDAD);
        imagedestroy($img);

        $destino->forceFill(['imagen' => $relativa] + array_merge([
            'imagen_autor' => null,
            'imagen_licencia' => null,
            'imagen_fuente' => null,
        ], $creditos))->save();

        return true;
    }

    /** Las fotos de móvil guardan la rotación en EXIF; GD no la aplica, así que se gira a mano. */
    private static function corregirOrientacion(\GdImage $img, string $bytes): \GdImage
    {
        if (!function_exists('exif_read_data') || !str_starts_with($bytes, "\xFF\xD8")) {
            return $img; // solo JPEG y si la extensión exif está activa
        }
        $exif = @exif_read_data('data://image/jpeg;base64,' . base64_encode($bytes));
        $angulo = match ($exif['Orientation'] ?? 1) {
            3 => 180,
            6 => -90,
            8 => 90,
            default => 0,
        };
        if ($angulo === 0) {
            return $img;
        }
        $girada = imagerotate($img, $angulo, 0);
        imagedestroy($img);
        return $girada;
    }
}
