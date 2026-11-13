<?php

namespace Database\Seeders;

use App\Support\Catalogo;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

/**
 * Carga el catálogo turístico desde database/seeders/data/*.json.
 * Los JSON se generan con: php artisan catalogo:exportar
 */
class CatalogoSeeder extends Seeder
{
    public function run(): void
    {
        foreach (array_keys(Catalogo::TABLAS) as $tabla) {
            $archivo = database_path("seeders/data/{$tabla}.json");
            if (!File::exists($archivo)) {
                $this->command?->warn("  Falta {$archivo}, se omite {$tabla}");
                continue;
            }

            $filas = json_decode(File::get($archivo), true);
            foreach (array_chunk($filas, 100) as $lote) {
                DB::table($tabla)->insert($lote);
            }
            $this->command?->line(sprintf('  %-24s %4d filas', $tabla, count($filas)));
        }
    }
}
