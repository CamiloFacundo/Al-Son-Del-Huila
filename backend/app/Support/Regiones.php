<?php

namespace App\Support;

use Illuminate\Support\Str;

/** Subregiones del Huila según el municipio, para que Huily arme rutas coherentes ("ruta por el sur") */
class Regiones
{
    private const MUNICIPIOS = [
        'Norte'     => ['neiva', 'aipe', 'villavieja', 'tello', 'baraya', 'colombia', 'rivera', 'palermo', 'santa maria',
                        'teruel', 'iquira', 'yaguara', 'campoalegre', 'algeciras', 'hobo'],
        'Centro'    => ['garzon', 'gigante', 'el agrado', 'agrado', 'pital', 'tarqui', 'altamira', 'suaza', 'guadalupe'],
        'Sur'       => ['pitalito', 'san agustin', 'isnos', 'acevedo', 'palestina', 'oporapa', 'saladoblanco', 'elias', 'timana'],
        'Occidente' => ['la plata', 'la argentina', 'nataga', 'paicol', 'tesalia'],
    ];

    public static function de(?string $municipio): ?string
    {
        $m = self::normalizar($municipio);
        foreach (self::MUNICIPIOS as $region => $lista) {
            if (in_array($m, $lista, true)) {
                return $region;
            }
        }
        return null;
    }

    /** Región mencionada en un texto ("por el sur", "occidente del Huila"...), o null */
    public static function mencionada(string $texto): ?string
    {
        $t = ' ' . self::normalizar($texto) . ' ';
        foreach (['Norte' => 'norte', 'Centro' => 'centro', 'Sur' => 'sur', 'Occidente' => 'occidente'] as $region => $palabra) {
            if (preg_match('/\b' . $palabra . '\b/u', $t)) {
                return $region;
            }
        }
        return null;
    }

    public static function normalizar(?string $texto): string
    {
        return Str::of((string) $texto)->ascii()->lower()->squish()->value();
    }
}
