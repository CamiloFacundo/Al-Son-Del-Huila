<?php

namespace App\Console\Commands;

use App\Models\Destino;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

/**
 * Busca en Wikimedia Commons fotos con licencia libre para los destinos sin imagen.
 * No descarga nada: genera storage/app/fotos-commons/candidatos.json y una página
 * revision.html para revisar a ojo. Después: php artisan destinos:importar-fotos
 *
 *   php artisan destinos:buscar-fotos            (solo destinos sin foto)
 *   php artisan destinos:buscar-fotos --todos    (también los que ya tienen)
 *   php artisan destinos:buscar-fotos --id=111   (uno concreto)
 */
class BuscarFotosCommons extends Command
{
    protected $signature = 'destinos:buscar-fotos {--todos} {--id=*} {--radio=2000 : metros para buscar fotos geolocalizadas cerca}';

    protected $description = 'Busca fotos con licencia libre en Wikimedia Commons para los destinos';

    private const API = 'https://commons.wikimedia.org/w/api.php';

    // Licencias que permiten usar la foto citando al autor
    private const LICENCIAS = '/^(CC0|CC[ -]BY(-SA)?( \d(\.\d)?)?|Public domain|PD\b)/i';

    public function handle(): int
    {
        $query = Destino::with('municipio')->where('estado', true)->orderBy('id');
        if ($ids = $this->option('id')) {
            $query->whereIn('id', $ids);
        } elseif (!$this->option('todos')) {
            $query->where(fn ($q) => $q->whereNull('imagen')->orWhere('imagen', ''));
        }
        $destinos = $query->get();

        $resultados = [];
        $barra = $this->output->createProgressBar($destinos->count());
        foreach ($destinos as $d) {
            $candidatas = $this->candidatas($d);
            $resultados[] = [
                'destino_id' => $d->id,
                'destino'    => $d->nombre,
                'municipio'  => $d->municipio->nombre ?? null,
                // Se aprueba por defecto la mejor encontrada por nombre; las de "cercanía" hay que revisarlas
                'elegida'    => ($candidatas[0]['encontrada_por'] ?? null) === 'nombre' ? 0 : null,
                'candidatas' => $candidatas,
            ];
            $barra->advance();
        }
        $barra->finish();
        $this->newLine(2);

        $dir = storage_path('app/fotos-commons');
        File::ensureDirectoryExists($dir);
        File::put("{$dir}/candidatos.json", json_encode($resultados, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        File::put("{$dir}/revision.html", $this->html($resultados));

        $conFoto = collect($resultados)->filter(fn ($r) => $r['candidatas'])->count();
        $porNombre = collect($resultados)->filter(fn ($r) => $r['elegida'] !== null)->count();
        $this->info("Destinos revisados: " . count($resultados));
        $this->info("Con alguna candidata: {$conFoto} (por nombre: {$porNombre}, solo por cercanía: " . ($conFoto - $porNombre) . ")");
        $this->line("Revisa: {$dir}/revision.html");
        $this->line("Ajusta \"elegida\" en candidatos.json (índice de la candidata o null) y ejecuta: php artisan destinos:importar-fotos");

        return self::SUCCESS;
    }

    private function candidatas(Destino $d): array
    {
        $nombre = trim(preg_replace('/\s*[\(\-–].*$/u', '', $d->nombre)) ?: $d->nombre;
        $municipio = $d->municipio->nombre ?? '';

        $porNombre = $this->buscar([
            'generator' => 'search',
            'gsrsearch' => "{$nombre} {$municipio} Huila",
            'gsrnamespace' => 6,
            'gsrlimit' => 8,
        ]);
        if (!$porNombre) {
            $porNombre = $this->buscar([
                'generator' => 'search',
                'gsrsearch' => "\"{$nombre}\"",
                'gsrnamespace' => 6,
                'gsrlimit' => 8,
            ]);
        }
        // Quedarse con las que comparten alguna palabra significativa del nombre
        $palabras = collect(preg_split('/\s+/u', Str::lower(Str::ascii($nombre))))
            ->filter(fn ($p) => mb_strlen($p) > 3 && !in_array($p, ['parque', 'centro', 'sector', 'municipio', 'huila']))
            ->values();
        $porNombre = array_values(array_filter($porNombre, function ($c) use ($palabras) {
            $titulo = Str::lower(Str::ascii($c['titulo'] . ' ' . $c['descripcion']));
            return $palabras->isEmpty() || $palabras->contains(fn ($p) => str_contains($titulo, $p));
        }));
        foreach ($porNombre as &$c) {
            $c['encontrada_por'] = 'nombre';
        }
        unset($c);

        $cerca = [];
        if ($d->latitud && $d->longitud) {
            $cerca = $this->buscar([
                'generator' => 'geosearch',
                'ggscoord' => "{$d->latitud}|{$d->longitud}",
                'ggsradius' => (int) $this->option('radio'),
                'ggsnamespace' => 6,
                'ggslimit' => 8,
            ]);
            foreach ($cerca as &$c) {
                $c['encontrada_por'] = 'cercanía';
            }
            unset($c);
        }

        return collect($porNombre)->concat($cerca)->unique('titulo')->take(4)->values()->all();
    }

    private function buscar(array $params): array
    {
        usleep(250_000); // ser amables con la API de Wikimedia

        try {
            $res = Http::withHeaders(['User-Agent' => 'DestinosFotosBot/1.0 (proyecto educativo; usa la API de Commons)'])
                ->timeout(20)
                ->retry(2, 1000)
                ->get(self::API, $params + [
                    'action' => 'query',
                    'format' => 'json',
                    'prop' => 'imageinfo',
                    'iiprop' => 'url|size|mime|extmetadata',
                    'iiurlwidth' => 480,
                    'iiextmetadatafilter' => 'Artist|LicenseShortName|ImageDescription',
                ]);
        } catch (\Throwable $e) {
            $this->warn(' Error consultando Commons: ' . $e->getMessage());
            return [];
        }

        $paginas = $res->json('query.pages') ?? [];
        uasort($paginas, fn ($a, $b) => ($a['index'] ?? 0) <=> ($b['index'] ?? 0));

        $salida = [];
        foreach ($paginas as $p) {
            $info = $p['imageinfo'][0] ?? null;
            if (!$info || !in_array($info['mime'] ?? '', ['image/jpeg', 'image/png', 'image/webp'])) {
                continue;
            }
            if (($info['width'] ?? 0) < 800 || ($info['height'] ?? 0) < 500) {
                continue;
            }
            $meta = $info['extmetadata'] ?? [];
            $licencia = trim(strip_tags($meta['LicenseShortName']['value'] ?? ''));
            if (!preg_match(self::LICENCIAS, $licencia)) {
                continue;
            }
            $salida[] = [
                'titulo'      => $p['title'],
                'autor'       => Str::limit(trim(preg_replace('/\s+/', ' ', strip_tags($meta['Artist']['value'] ?? 'Desconocido'))), 120, ''),
                'licencia'    => $licencia,
                'fuente'      => $info['descriptionurl'],
                'url'         => $info['url'],
                'miniatura'   => $info['thumburl'] ?? $info['url'],
                'ancho'       => $info['width'],
                'alto'        => $info['height'],
                'descripcion' => Str::limit(trim(strip_tags($meta['ImageDescription']['value'] ?? '')), 160),
            ];
        }
        return $salida;
    }

    private function html(array $resultados): string
    {
        $e = fn ($s) => htmlspecialchars((string) $s, ENT_QUOTES);
        $filas = '';
        foreach ($resultados as $r) {
            $celdas = '';
            foreach ($r['candidatas'] as $i => $c) {
                $marcada = $r['elegida'] === $i ? ' elegida' : '';
                $celdas .= "<figure class=\"cand{$marcada}\"><img loading=\"lazy\" src=\"{$e($c['miniatura'])}\">"
                    . "<figcaption><b>[{$i}]</b> {$e($c['encontrada_por'])} · {$e($c['licencia'])}<br>"
                    . "<a href=\"{$e($c['fuente'])}\" target=\"_blank\">{$e(Str::limit($c['titulo'], 60))}</a></figcaption></figure>";
            }
            $celdas = $celdas ?: '<p class="vacio">Sin candidatas</p>';
            $filas .= "<section><h2>#{$r['destino_id']} {$e($r['destino'])} <small>{$e($r['municipio'])}</small></h2><div class=\"fila\">{$celdas}</div></section>";
        }

        return <<<HTML
<!doctype html><html lang="es"><meta charset="utf-8"><title>Revisión de fotos de destinos</title>
<style>
body{font-family:system-ui;background:#111;color:#eee;margin:2rem}h1{font-size:1.4rem}
section{border-bottom:1px solid #333;padding:.8rem 0}h2{font-size:1rem;margin:.2rem 0}small{color:#999;font-weight:400}
.fila{display:flex;gap:.8rem;flex-wrap:wrap}.cand{margin:0;width:240px;border:3px solid transparent;border-radius:8px;overflow:hidden;background:#1c1c1c}
.cand.elegida{border-color:#4caf50}.cand img{width:100%;height:150px;object-fit:cover;display:block}
figcaption{font-size:.72rem;padding:.4rem;color:#bbb}a{color:#9cf}.vacio{color:#777;font-size:.85rem}
</style>
<h1>Fotos candidatas de Wikimedia Commons</h1>
<p>Borde verde = elegida por defecto (encontrada por nombre). Las de "cercanía" son fotos tomadas a menos de 2 km y hay que revisarlas.</p>
{$filas}
</html>
HTML;
    }
}
