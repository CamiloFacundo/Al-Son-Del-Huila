<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Destino;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * POST /api/recomendar
 * Recibe las respuestas del quiz:
 * { categorias: [ids], entornos: [ids], etiquetas: [ids], tipo_viajero: id, dias: n }
 * y devuelve { itinerario: [{ dia, distancia_km, destinos: [...] }], total }.
 *
 * 1) Ranking: cada destino recibe puntos según cuánto coincide con el quiz
 *    (categoría 3, entorno 2, cada etiqueta 1, tipo de viajero 1). Los empates se desordenan.
 * 2) Ruta: cada día se arma alrededor del destino mejor puntuado que queda libre, con paradas
 *    a menos de RADIO_DIA_KM, para no proponer 200 km en un día. Las paradas de cada día van en
 *    orden de cercanía y los días se encadenan empezando cerca de Neiva.
 */
class RecomendadorController extends Controller
{
    private const PESO_CATEGORIA = 3;
    private const PESO_ENTORNO   = 2;
    private const PESO_ETIQUETA  = 1;
    private const PESO_VIAJERO   = 1;

    private const PARADAS_POR_DIA = 3;
    private const RADIO_DIA_KM    = 35;  // paradas de un mismo día: como mucho a esta distancia del destino principal
    private const RADIO_EXTRA_KM  = 60;  // si no hay suficientes cerca, se admite algo más lejos antes de dejar el día corto
    private const NEIVA = [2.9273, -75.2819];

    public function recomendar(Request $request)
    {
        $datos = $request->validate([
            'categorias'   => 'nullable|array',
            'categorias.*' => 'integer',
            'entornos'     => 'nullable|array',
            'entornos.*'   => 'integer',
            'etiquetas'    => 'nullable|array',
            'etiquetas.*'  => 'integer',
            'tipo_viajero' => 'nullable|integer',
            'dias'         => 'nullable|integer|min:1|max:14',
        ]);

        $dias = (int) ($datos['dias'] ?? 2);

        try {
            $destinos = DB::table('destinos as d')
                ->leftJoin('categorias as c', 'd.categoria_id', '=', 'c.id')
                ->leftJoin('municipios as m', 'd.municipio_id', '=', 'm.id')
                ->where('d.estado', 1)
                ->whereNotNull('d.latitud')
                ->whereNotNull('d.longitud')
                ->select('d.id', 'd.nombre', 'd.descripcion', 'd.imagen', 'd.latitud', 'd.longitud',
                    'd.categoria_id', 'd.entorno_id', 'c.nombre as categoria', 'm.nombre as municipio')
                ->get();

            if ($destinos->isEmpty()) {
                return response()->json(['itinerario' => [], 'total' => 0]);
            }

            $candidatos = $this->sinDuplicados($this->puntuar($destinos, $datos));
            $itinerario = $this->armarDias($candidatos, $dias);

            return response()->json([
                'itinerario' => $itinerario,
                'total'      => collect($itinerario)->sum(fn ($d) => count($d['destinos'])),
            ]);
        } catch (\Throwable $e) {
            Log::error('Error en recomendador: ' . $e->getMessage());
            return response()->json([
                'itinerario' => [],
                'total'      => 0,
                'message'    => 'No se pudo generar la recomendación.',
            ], 500);
        }
    }

    /** Ranking: puntos por coincidencias con el quiz, de mayor a menor (empates al azar) */
    private function puntuar(Collection $destinos, array $q): Collection
    {
        $categorias = $q['categorias'] ?? [];
        $entornos   = $q['entornos'] ?? [];
        $etiquetas  = $q['etiquetas'] ?? [];
        $viajero    = $q['tipo_viajero'] ?? null;

        $etiquetasPorDestino = $this->pivote('destinos_etiquetas', 'etiqueta_id');
        $viajeroPorDestino   = $this->pivote('destinos_tipos_viajero', 'tipo_viajero_id');

        return $destinos->map(function ($d) use ($categorias, $entornos, $etiquetas, $viajero, $etiquetasPorDestino, $viajeroPorDestino) {
            $puntos = 0;
            if (in_array($d->categoria_id, $categorias)) {
                $puntos += self::PESO_CATEGORIA;
            }
            if (in_array($d->entorno_id, $entornos)) {
                $puntos += self::PESO_ENTORNO;
            }
            $puntos += count(array_intersect($etiquetasPorDestino[$d->id] ?? [], $etiquetas)) * self::PESO_ETIQUETA;
            if ($viajero && in_array($viajero, $viajeroPorDestino[$d->id] ?? [])) {
                $puntos += self::PESO_VIAJERO;
            }
            $d->puntuacion = $puntos;
            $d->latitud = (float) $d->latitud;
            $d->longitud = (float) $d->longitud;
            $d->desempate = mt_rand();
            return $d;
        })->sortBy([['puntuacion', 'desc'], ['desempate', 'asc']])->values();
    }

    /**
     * El catálogo tiene algunos destinos repetidos con nombres casi iguales
     * (p. ej. "Mano del Gigante" y "Mano del Gigante - Gigante"). Se queda el mejor puntuado.
     */
    private function sinDuplicados(Collection $ordenados): Collection
    {
        $vistos = [];
        return $ordenados->filter(function ($d) use (&$vistos) {
            $clave = Str::of($d->nombre)->before(' - ')->before('(')->ascii()->lower()->squish()->value();
            foreach ($vistos[$clave] ?? [] as $otro) {
                if ($this->km($d, $otro) < 15) {
                    return false;
                }
            }
            $vistos[$clave][] = $d;
            return true;
        })->values();
    }

    /** Arma los días agrupando destinos cercanos alrededor del mejor puntuado libre */
    private function armarDias(Collection $candidatos, int $dias): array
    {
        // Preferir destinos que coinciden con el quiz; si no hay suficientes, completar con el resto
        $conPuntos = $candidatos->filter(fn ($d) => $d->puntuacion > 0)->values();
        $libres = ($conPuntos->count() >= $dias * self::PARADAS_POR_DIA ? $conPuntos : $candidatos)->all();

        $grupos = [];
        for ($i = 0; $i < $dias && $libres; $i++) {
            // El destino principal del día es el que, con sus mejores vecinos cercanos, suma más puntos
            // (así no se ancla un día en un destino aislado dejando fuera grupos mejores)
            $kPrincipal = $this->mejorAncla($libres);
            $principal = $libres[$kPrincipal];
            unset($libres[$kPrincipal]);
            $grupo = [$principal];

            // Cercanos: primero los de más puntos; a igualdad, el más cercano
            foreach ([self::RADIO_DIA_KM, self::RADIO_EXTRA_KM] as $radio) {
                $cerca = array_filter($libres, fn ($d) => $this->km($principal, $d) <= $radio);
                uasort($cerca, fn ($a, $b) => [$b->puntuacion, $this->km($principal, $a)] <=> [$a->puntuacion, $this->km($principal, $b)]);
                foreach (array_keys($cerca) as $k) {
                    if (count($grupo) >= self::PARADAS_POR_DIA) {
                        break 2;
                    }
                    // Cerca de todas las paradas del día, no solo de la principal
                    // (evita juntar dos sitios en lados opuestos del ancla)
                    $cercaDeTodas = collect($grupo)->every(fn ($p) => $this->km($p, $libres[$k]) <= $radio);
                    if ($cercaDeTodas) {
                        $grupo[] = $libres[$k];
                        unset($libres[$k]);
                    }
                }
            }
            $libres = array_values($libres);
            $grupos[] = $grupo;
        }

        // Encadenar los días: empezar por el grupo más cercano a Neiva y seguir por el más próximo
        $orden = [];
        $punto = (object) ['latitud' => self::NEIVA[0], 'longitud' => self::NEIVA[1]];
        while ($grupos) {
            $k = collect($grupos)->keys()->sortBy(fn ($k) => $this->km($punto, $this->centro($grupos[$k])))->first();
            $paradas = $this->ordenarPorCercania($grupos[$k], $punto);
            $orden[] = $paradas;
            $punto = end($paradas);
            unset($grupos[$k]);
        }

        return collect($orden)->values()->map(function ($paradas, $i) {
            $km = 0;
            for ($j = 1; $j < count($paradas); $j++) {
                $km += $this->km($paradas[$j - 1], $paradas[$j]);
            }
            return [
                'dia' => $i + 1,
                'distancia_km' => (int) round($km),
                'destinos' => collect($paradas)->map(function ($d) {
                    $d = clone $d;
                    unset($d->desempate, $d->categoria_id, $d->entorno_id);
                    $d->imagen = Destino::urlImagen($d->imagen);
                    return $d;
                })->values(),
            ];
        })->all();
    }

    /** Clave del destino libre cuyo grupo (él + sus mejores vecinos a menos de RADIO_DIA_KM) suma más puntos */
    private function mejorAncla(array $libres): int|string
    {
        $mejor = null;
        $mejorValor = -1;
        foreach ($libres as $k => $d) {
            $vecinos = [];
            foreach ($libres as $k2 => $otro) {
                if ($k2 !== $k && $this->km($d, $otro) <= self::RADIO_DIA_KM) {
                    $vecinos[] = $otro->puntuacion;
                }
            }
            rsort($vecinos);
            $valor = $d->puntuacion + array_sum(array_slice($vecinos, 0, self::PARADAS_POR_DIA - 1));
            // A igual valor, gana el que va antes en el ranking (más puntos propios)
            if ($valor > $mejorValor) {
                $mejor = $k;
                $mejorValor = $valor;
            }
        }
        return $mejor;
    }

    /** Ordena las paradas de un día empezando por la más cercana al punto de partida */
    private function ordenarPorCercania(array $paradas, object $desde): array
    {
        $orden = [];
        $actual = $desde;
        while ($paradas) {
            $k = collect($paradas)->keys()->sortBy(fn ($k) => $this->km($actual, $paradas[$k]))->first();
            $orden[] = $actual = $paradas[$k];
            unset($paradas[$k]);
        }
        return $orden;
    }

    private function centro(array $paradas): object
    {
        return (object) [
            'latitud'  => array_sum(array_column($paradas, 'latitud')) / count($paradas),
            'longitud' => array_sum(array_column($paradas, 'longitud')) / count($paradas),
        ];
    }

    /** Distancia en línea recta (km) entre dos puntos con latitud/longitud */
    private function km(object $a, object $b): float
    {
        $rad = M_PI / 180;
        $dLat = ($b->latitud - $a->latitud) * $rad;
        $dLon = ($b->longitud - $a->longitud) * $rad;
        $h = sin($dLat / 2) ** 2 + cos($a->latitud * $rad) * cos($b->latitud * $rad) * sin($dLon / 2) ** 2;
        return 2 * 6371 * asin(min(1, sqrt($h)));
    }

    /**
     * Devuelve [destino_id => [ids relacionados]] de una tabla pivote.
     * Si la tabla no existe o está vacía, devuelve [] y simplemente no suma puntos.
     */
    private function pivote(string $tabla, string $columna): array
    {
        try {
            return DB::table($tabla)
                ->get(['destino_id', $columna])
                ->groupBy('destino_id')
                ->map(fn ($filas) => $filas->pluck($columna)->all())
                ->all();
        } catch (\Throwable $e) {
            return [];
        }
    }
}
