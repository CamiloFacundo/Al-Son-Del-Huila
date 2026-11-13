<?php

namespace App\Support;

/**
 * Utilidades para las imágenes que sube la gente (destinos, publicaciones):
 * corrige la rotación EXIF de las fotos de móvil, reduce el tamaño y convierte a WebP.
 */
class Imagenes
{
    /**
     * Devuelve los bytes de la imagen optimizada en WebP, o null si no es una imagen válida.
     */
    public static function webp(string $bytes, int $anchoMax = 1200, int $calidad = 72): ?string
    {
        $img = @imagecreatefromstring($bytes);
        if (!$img) {
            return null;
        }

        $img = self::corregirOrientacion($img, $bytes);

        if (imagesx($img) > $anchoMax) {
            $reducida = imagescale($img, $anchoMax, -1, IMG_BICUBIC);
            imagedestroy($img);
            $img = $reducida;
        }

        ob_start();
        imagewebp($img, null, $calidad);
        imagedestroy($img);

        return ob_get_clean() ?: null;
    }

    /**
     * En la BD se guardan rutas relativas (storage/publicaciones/x.webp); la API devuelve la URL
     * completa según APP_URL. Las URLs absolutas (p. ej. la foto de Google) se dejan igual.
     */
    public static function url(?string $ruta): ?string
    {
        if (!$ruta) {
            return null;
        }
        return preg_match('#^https?://#', $ruta) ? $ruta : asset($ruta);
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
