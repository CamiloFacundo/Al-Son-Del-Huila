<?php

namespace App\Console\Commands;

use App\Support\Catalogo;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

/**
 * Exporta las tablas del catálogo a database/seeders/data/*.json
 * para que CatalogoSeeder pueda reconstruirlas.
 *
 * Úsalo cada vez que cambies destinos, categorías, etc. en tu base de datos:
 *   php artisan catalogo:exportar
 */
class ExportarCatalogo extends Command
{
    protected $signature = 'catalogo:exportar';

    protected $description = 'Exporta el catálogo (destinos, categorías, municipios...) a JSON para los seeders';

    public function handle(): int
    {
        $dir = database_path('seeders/data');
        File::ensureDirectoryExists($dir);

        foreach (Catalogo::TABLAS as $tabla => $orden) {
            $filas = DB::table($tabla)->orderBy($orden[0])->when(isset($orden[1]), fn ($q) => $q->orderBy($orden[1]))->get();
            File::put(
                "{$dir}/{$tabla}.json",
                json_encode($filas, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n"
            );
            $this->line(sprintf('  %-24s %4d filas', $tabla, $filas->count()));
        }

        $this->info('Catálogo exportado en database/seeders/data/');
        return self::SUCCESS;
    }
}
