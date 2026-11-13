<?php

namespace App\Console\Commands;

use App\Models\Destino;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;

/**
 * Asigna fotos a los destinos, reducidas a WebP (máx. 1200 px) en public/images/Destinos/{id}.webp
 *
 * Dos fuentes:
 *  1) Wikimedia Commons: las "elegida" de storage/app/fotos-commons/candidatos.json
 *     (generado por destinos:buscar-fotos), guardando autor, licencia y enlace.
 *  2) Fotos propias: storage/app/fotos-propias/{id_destino}.jpg|png|webp
 *     (opcional --autor="Nombre" para el crédito).
 *
 * Al terminar actualiza los seeders (catalogo:exportar).
 */
class ImportarFotosDestinos extends Command
{
    protected $signature = 'destinos:importar-fotos {--solo-propias} {--solo-commons} {--autor= : crédito para las fotos propias} {--sobrescribir : reemplaza fotos ya asignadas}';

    protected $description = 'Descarga/convierte las fotos elegidas y las asigna a los destinos';

    private const ANCHO_MAX = 1200;
    private const CALIDAD = 72;

    public function handle(): int
    {
        File::ensureDirectoryExists(public_path('images/Destinos'));
        $hechas = 0;

        if (!$this->option('solo-commons')) {
            $hechas += $this->importarPropias();
        }
        if (!$this->option('solo-propias')) {
            $hechas += $this->importarCommons();
        }

        $this->info("Fotos asignadas: {$hechas}");
        if ($hechas > 0) {
            $this->call('catalogo:exportar');
        }
        return self::SUCCESS;
    }

    private function importarPropias(): int
    {
        $dir = storage_path('app/fotos-propias');
        if (!File::isDirectory($dir)) {
            return 0;
        }
        $n = 0;
        foreach (File::files($dir) as $archivo) {
            if (!preg_match('/^(\d+)\.(jpe?g|png|webp)$/i', $archivo->getFilename(), $m)) {
                continue;
            }
            $destino = Destino::find((int) $m[1]);
            if (!$destino) {
                $this->warn("  {$archivo->getFilename()}: no existe el destino {$m[1]}");
                continue;
            }
            if ($this->guardar($destino, File::get($archivo->getPathname()), [
                'imagen_autor' => $this->option('autor'),
                'imagen_licencia' => null,
                'imagen_fuente' => null,
            ])) {
                $this->line("  #{$destino->id} {$destino->nombre} ← {$archivo->getFilename()}");
                $n++;
            }
        }
        return $n;
    }

    private function importarCommons(): int
    {
        $archivo = storage_path('app/fotos-commons/candidatos.json');
        if (!File::exists($archivo)) {
            $this->warn('No hay candidatos de Commons. Ejecuta antes: php artisan destinos:buscar-fotos');
            return 0;
        }

        $n = 0;
        foreach (json_decode(File::get($archivo), true) as $r) {
            $i = $r['elegida'] ?? null;
            if ($i === null || !isset($r['candidatas'][$i])) {
                continue;
            }
            $destino = Destino::find($r['destino_id']);
            if (!$destino || ($destino->getRawOriginal('imagen') && !$this->option('sobrescribir'))) {
                continue;
            }
            $c = $r['candidatas'][$i];

            // Pedir a Commons una miniatura en vez del original (que puede pesar varios MB).
            // Solo sirve miniaturas en tamaños estándar y limita las descargas de originales,
            // así que se usa el mayor tamaño estándar menor que el ancho real de la foto.
            $paso = collect([1280, 960, 500])->first(fn ($w) => $w < $c['ancho']);
            $url = $paso ? preg_replace('#/\d+px-#', "/{$paso}px-", $c['miniatura'], 1) : $c['url'];

            $res = $this->descargar($url);
            if (!$res) {
                $this->warn("  #{$destino->id}: no se pudo descargar");
                continue;
            }

            if ($this->guardar($destino, $res, [
                'imagen_autor' => $c['autor'],
                'imagen_licencia' => $c['licencia'],
                'imagen_fuente' => $c['fuente'],
            ])) {
                $this->line("  #{$destino->id} {$destino->nombre} ← Commons ({$c['licencia']})");
                $n++;
            }
        }
        return $n;
    }

    /** Descarga con pausas entre peticiones; si Commons responde 429, espera y reintenta. */
    private function descargar(string $url): ?string
    {
        for ($intento = 1; $intento <= 3; $intento++) {
            sleep($intento === 1 ? 1 : 10 * $intento);
            try {
                $res = Http::withHeaders(['User-Agent' => 'DestinosFotosBot/1.0 (proyecto educativo; usa la API de Commons)'])
                    ->timeout(60)->get($url);
            } catch (\Throwable $e) {
                continue;
            }
            if ($res->successful()) {
                return $res->body();
            }
            if ($res->status() !== 429) {
                return null;
            }
        }
        return null;
    }

    /** Reduce a máx. 1200 px de ancho, guarda en WebP y actualiza el destino. */
    private function guardar(Destino $destino, string $bytes, array $creditos): bool
    {
        $img = @imagecreatefromstring($bytes);
        if (!$img) {
            $this->warn("  #{$destino->id}: no es una imagen válida");
            return false;
        }

        $ancho = imagesx($img);
        if ($ancho > self::ANCHO_MAX) {
            $reducida = imagescale($img, self::ANCHO_MAX, -1, IMG_BICUBIC);
            imagedestroy($img);
            $img = $reducida;
        }

        $relativa = "images/Destinos/{$destino->id}.webp";
        imagewebp($img, public_path($relativa), self::CALIDAD);
        imagedestroy($img);

        $destino->forceFill(['imagen' => $relativa] + $creditos)->save();
        return true;
    }
}
