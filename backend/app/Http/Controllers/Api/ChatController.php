<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Destino;
use App\Support\Regiones;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Huily, el asistente de rutas (proxy hacia Groq; la API key vive solo en el backend).
 *
 * POST /api/chat
 *   { mensajes: [{rol, texto, imagen?}], contexto?: {rutaActiva: "nombre", destinos: [ids]} }
 * Respuesta:
 *   { respuesta: "texto limpio", destinos: [destino], ruta: {nombre, dias, destinos: [destino]} | null }
 *
 * - Contexto compacto (la cuenta de Groq tiene ~8.000 tokens/minuto): hasta 14 destinos elegidos por
 *   palabras clave, región ("ruta por el sur") y municipio, con una descripción corta.
 * - La IA marca destinos y rutas con etiquetas; aquí se validan contra la BD (no se aceptan IDs inventados),
 *   se quitan del texto.
 */
class ChatController extends Controller
{
    private const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
    private const MAX_CONTEXTO = 14;
    private const MAX_HISTORIAL = 10;

    // Palabras de la pregunta que no ayudan a buscar
    private const VACIAS = ['quiero', 'quisiera', 'busco', 'buscar', 'donde', 'puedo', 'puede', 'para', 'como', 'cual', 'cuales',
        'que', 'una', 'unos', 'unas', 'algo', 'algun', 'alguna', 'sitio', 'sitios', 'lugar', 'lugares', 'recomiendas', 'recomienda',
        'recomendar', 'recomendacion', 'visitar', 'conocer', 'hacer', 'huila', 'cerca', 'mejor', 'mejores', 'tiene', 'hay',
        'esta', 'este', 'estos', 'esas', 'esos', 'con', 'sin', 'por', 'los', 'las', 'del', 'mas', 'muy', 'dias', 'dia', 'plan',
        'ruta', 'rutas', 'crea', 'crear', 'arma', 'armar', 'haz', 'dame', 'sur', 'norte', 'centro', 'occidente', 'sobre', 'mismo'];

    // Palabras habituales que no aparecen tal cual en el catálogo → términos que sí aparecen
    private const SINONIMOS = [
        'estrellas' => ['astronom', 'observatorio', 'tatacoa'], 'estrella' => ['astronom', 'observatorio'],
        'cielo' => ['astronom', 'observatorio'], 'noche' => ['astronom', 'observatorio'],
        'desierto' => ['desierto', 'tatacoa'], 'piscina' => ['piscina', 'balneario'], 'banarse' => ['balneario', 'charco', 'piscina'],
        'termales' => ['termal'], 'relajarme' => ['termal', 'descanso'], 'descansar' => ['descanso', 'termal'],
        'comer' => ['gastronom', 'restaurante'], 'comida' => ['gastronom', 'restaurante'], 'cafe' => ['cafe', 'cafetero'],
        'arqueologia' => ['arqueolog'], 'estatuas' => ['arqueolog', 'estatua'], 'historia' => ['historic', 'museo'],
        'aventura' => ['aventura', 'rafting', 'parapente'], 'cascada' => ['cascada', 'salto'], 'cascadas' => ['cascada', 'salto'],
        'rio' => ['rio', 'magdalena'], 'iglesia' => ['iglesia', 'catedral', 'religios'], 'senderismo' => ['sender', 'caminata'],
        'ninos' => ['familiar', 'parque', 'piscina'], 'familia' => ['familiar', 'parque', 'recreac'], 'pareja' => ['mirador', 'termal'],
    ];

    public function enviar(Request $request)
    {
        $datos = $request->validate([
            'mensajes'            => 'required|array|min:1|max:30',
            'mensajes.*.rol'      => 'required|in:user,assistant',
            'mensajes.*.texto'    => 'nullable|string|max:4000',
            // Imagen en data URL (el frontend la reduce antes de enviarla)
            'mensajes.*.imagen'   => ['nullable', 'string', 'max:5600000', 'regex:/^data:image\/(png|jpe?g|webp|gif);base64,/'],
            'contexto'            => 'nullable|array',
            'contexto.rutaActiva' => 'nullable|string|max:150',
            'contexto.destinos'   => 'nullable|array|max:50',
            'contexto.destinos.*' => 'integer',
        ]);

        $apiKey = config('services.groq.key');
        if (empty($apiKey)) {
            return response()->json(['message' => 'Huily no está configurado en este servidor.'], 503);
        }

        // Solo los últimos mensajes (ahorra tokens); solo la foto más reciente
        $mensajes = array_slice($datos['mensajes'], -self::MAX_HISTORIAL);
        $ultimaFoto = collect($mensajes)->keys()->filter(fn ($k) => !empty($mensajes[$k]['imagen']))->last();
        $pregunta = collect($mensajes)->reverse()->first(fn ($m) => $m['rol'] === 'user')['texto'] ?? '';

        $catalogo = $this->catalogo();
        $idsRuta = $datos['contexto']['destinos'] ?? [];
        $contexto = $this->seleccionarContexto($catalogo, $pregunta, $ultimaFoto !== null, $idsRuta);

        $formateados = [];
        foreach ($mensajes as $k => $m) {
            $texto = (string) ($m['texto'] ?? '');
            if ($m['rol'] === 'assistant') {
                $formateados[] = ['role' => 'assistant', 'content' => Str::limit($texto, 700)];
            } elseif ($k === $ultimaFoto) {
                $formateados[] = ['role' => 'user', 'content' => [
                    ['type' => 'image_url', 'image_url' => ['url' => $m['imagen']]],
                    ['type' => 'text', 'text' => $texto ?: '¿Qué destino del Huila se parece a esta foto?'],
                ]];
            } else {
                $formateados[] = ['role' => 'user', 'content' => $texto . (!empty($m['imagen']) ? ' [el usuario envió una foto]' : '')];
            }
        }

        $modelo = $ultimaFoto !== null ? config('services.groq.vision_model') : config('services.groq.model');
        $payload = [
            'model'       => $modelo,
            'temperature' => 0.5,
            'max_tokens'  => 900,
            'messages'    => array_merge(
                [['role' => 'system', 'content' => $this->promptSistema($contexto, $datos['contexto'] ?? null)]],
                $formateados
            ),
        ];
        if (str_starts_with((string) $modelo, 'openai/gpt-oss')) {
            $payload['reasoning_effort'] = 'low'; // menos tokens de razonamiento interno: más rápido y dentro del límite
        }

        try {
            $res = Http::withToken($apiKey)
                ->withOptions(['verify' => config('services.groq.verify_ssl')])
                ->timeout(40)
                ->post(self::GROQ_URL, $payload);
        } catch (\Throwable $e) {
            Log::error('Groq request failed: ' . $e->getMessage());
            return response()->json(['message' => 'No pude conectar con Huily. Revisa tu conexión e inténtalo de nuevo.'], 502);
        }

        if ($res->status() === 429) {
            $espera = (int) ceil((float) ($res->header('retry-after') ?: 20));
            return response()->json([
                'message' => 'Huily está atendiendo muchas preguntas a la vez. Espera unos segundos y vuelve a intentarlo.',
                'reintentar_en' => $espera,
            ], 429);
        }
        if ($res->failed()) {
            Log::error('Groq API error', ['status' => $res->status(), 'body' => $res->json()]);
            return response()->json(['message' => 'Huily no está disponible en este momento. Inténtalo de nuevo en un rato.'], 502);
        }

        $bruto = (string) $res->json('choices.0.message.content', '');
        return response()->json($this->interpretar($bruto, $catalogo, $contexto));
    }

    /** Todos los destinos activos con su región (son ~185: la consulta tarda milisegundos) */
    private function catalogo(): Collection
    {
        return Destino::with(['categoria:id,nombre', 'municipio:id,nombre'])
            ->where('estado', true)
            ->get(['id', 'nombre', 'descripcion', 'imagen', 'imagen_autor', 'imagen_licencia', 'imagen_fuente',
                'latitud', 'longitud', 'categoria_id', 'municipio_id', 'entorno_id', 'rating_promedio'])
            ->each(fn ($d) => $d->region = Regiones::de($d->municipio->nombre ?? null));
    }

    /**
     * Elige hasta MAX_CONTEXTO destinos para el prompt: los de la ruta activa, los que coinciden con la
     * pregunta (palabras y sinónimos), los del municipio o región que se nombra y, si faltan, una muestra variada.
     */
    private function seleccionarContexto(Collection $catalogo, string $pregunta, bool $hayFoto, array $idsRuta): Collection
    {
        $texto = Regiones::normalizar($pregunta);
        $region = Regiones::mencionada($pregunta);
        $palabras = collect(preg_split('/[^a-z0-9ñ]+/u', $texto))
            ->filter(fn ($p) => mb_strlen($p) >= 3 && !in_array($p, self::VACIAS))
            ->flatMap(fn ($p) => array_merge([rtrim($p, 's')], self::SINONIMOS[$p] ?? []))
            ->unique()->values();

        $puntuados = $catalogo->map(function ($d) use ($palabras, $texto, $region) {
            $nombre = Regiones::normalizar($d->nombre);
            $todo = Regiones::normalizar($d->nombre . ' ' . $d->descripcion . ' ' . ($d->categoria->nombre ?? ''));
            $municipio = Regiones::normalizar($d->municipio->nombre ?? '');
            $p = $palabras->sum(fn ($w) => (str_contains($nombre, $w) ? 3 : 0) + (str_contains($todo, $w) ? 1 : 0));
            if ($municipio && preg_match('/\b' . preg_quote($municipio, '/') . '\b/u', $texto)) {
                $p += 5; // nombra el municipio
            }
            if ($region && $d->region !== $region) {
                $p = -1; // pidió una región concreta
            }
            return [$d, $p];
        });

        $elegidos = $catalogo->whereIn('id', $idsRuta)->values();

        $coinciden = $puntuados->filter(fn ($x) => $x[1] > 0)->sortByDesc(fn ($x) => $x[1])->map(fn ($x) => $x[0]);
        $elegidos = $elegidos->concat($coinciden)->unique('id');

        // Rellenar con destinos de la región pedida (o de todo el Huila), variando categorías; con foto si es posible
        if ($elegidos->count() < self::MAX_CONTEXTO) {
            $resto = $puntuados->filter(fn ($x) => $x[1] >= 0)->map(fn ($x) => $x[0])
                ->whereNotIn('id', $elegidos->pluck('id'))
                ->when($hayFoto, fn ($c) => $c->sortByDesc(fn ($d) => $d->imagen ? 1 : 0))
                ->shuffle()
                ->sortByDesc(fn ($d) => ($d->imagen ? 1 : 0) + (float) $d->rating_promedio)
                ->groupBy('categoria_id')
                ->flatMap(fn ($g) => $g->take(3))
                ->shuffle();
            $elegidos = $elegidos->concat($resto);
        }

        return $elegidos->unique('id')->take(self::MAX_CONTEXTO)->values();
    }

    private function promptSistema(Collection $destinos, ?array $contexto): string
    {
        $lista = $destinos->map(function ($d) {
            $desc = Str::words(trim(preg_replace('/\s+/', ' ', (string) $d->descripcion)), 16, '…');
            return "- [{$d->id}] {$d->nombre} — {$d->municipio?->nombre} ({$d->region}), {$d->categoria?->nombre}. {$desc}";
        })->implode("\n");

        $ruta = !empty($contexto['rutaActiva'])
            ? "\nEl usuario está viendo su ruta \"{$contexto['rutaActiva']}\" (sus destinos están al principio de la lista).\n"
            : '';

        return <<<PROMPT
Eres Huily, el asistente de viajes de la app "Al Son del Huila" (departamento del Huila, Colombia).
Hablas en español de Colombia, con calidez y precisión. Respuestas breves: máximo 150 palabras.

Reglas:
1. Recomienda SOLO destinos de la lista de abajo. Nunca inventes lugares, precios, horarios ni datos que no estén ahí.
2. Nunca escribas los números de ID en el texto visible: nombra los lugares por su nombre.
3. Si la lista no tiene algo que encaje con lo que pide, dilo con honestidad y ofrece la alternativa más parecida.
4. Para una ruta o itinerario: agrupa por días con 2 a 4 destinos cercanos entre sí (misma región o municipios vecinos),
   usa líneas "**Día 1:**", "**Día 2:**"… y no mezcles regiones lejanas en el mismo día.
   Al final añade en una línea aparte: [RUTA: {"nombre": "Nombre corto", "dias": N, "destinos": [ids en orden de visita]}]
5. Siempre que menciones destinos, termina con una línea aparte: [DESTINOS: id1, id2, ...]
6. Si te envían una foto, describe brevemente qué ves y relaciónala con los destinos de la lista que más se parezcan.
7. Si preguntan algo que no tiene que ver con viajar por el Huila, responde con amabilidad y vuelve al tema.
Puedes usar **negritas** y listas con "- ".
{$ruta}
Regiones: Norte (Neiva, Villavieja, Rivera, Yaguará…), Centro (Garzón, Gigante…), Sur (Pitalito, San Agustín, Isnos, Acevedo…), Occidente (La Plata, Paicol…).

Destinos disponibles ([ID] nombre — municipio (región), categoría. descripción):
{$lista}
PROMPT;
    }

    /** Separa el texto visible de las etiquetas [DESTINOS] y [RUTA], validando los IDs contra la BD */
    private function interpretar(string $bruto, Collection $catalogo, Collection $contexto): array
    {
        $porId = $catalogo->keyBy('id');

        $ruta = null;
        if (preg_match('/\[RUTA:\s*(\{[\s\S]*?\})\s*\]/u', $bruto, $m)) {
            $json = json_decode($m[1], true);
            if (is_array($json)) {
                $ids = collect($json['destinos'] ?? [])->map(fn ($x) => (int) $x)->filter(fn ($id) => $porId->has($id))->unique()->values();
                if ($ids->isNotEmpty()) {
                    $dias = max(1, min(14, (int) ($json['dias'] ?? 1)));
                    $ruta = [
                        'nombre'   => Str::limit(trim((string) ($json['nombre'] ?? 'Mi ruta por el Huila')) ?: 'Mi ruta por el Huila', 100, ''),
                        'dias'     => min($dias, $ids->count()),
                        // Se respeta el orden de la IA: coincide con los "Día 1 / Día 2" del texto
                        'destinos' => $ids->map(fn ($id) => $porId[$id])->all(),
                    ];
                }
            }
        }

        $ids = [];
        if (preg_match('/\[DESTINOS:\s*([^\]]*)\]/u', $bruto, $m)) {
            preg_match_all('/\d+/', $m[1], $nums);
            $ids = array_values(array_unique(array_filter(array_map('intval', $nums[0]), fn ($id) => $porId->has($id))));
        }
        if (!$ids && $ruta) {
            $ids = array_column($ruta['destinos'], 'id');
        }

        // Texto visible sin etiquetas ni "(ID 48)"
        $texto = preg_replace(['/\[RUTA:\s*\{[\s\S]*?\}\s*\]/u', '/\[DESTINOS:[^\]]*\]/u'], '', $bruto);
        $texto = preg_replace('/\s*\(\s*ID\s*:?\s*\d+\s*\)|\bID\s*:?\s*\d+\b|\[\d+\]/iu', '', $texto);
        $texto = trim(preg_replace("/\n{3,}/", "\n\n", $texto));

        // Sin etiqueta: detectar los destinos del contexto que se nombran en el texto
        if (!$ids) {
            $normal = Regiones::normalizar($texto);
            $ids = $contexto->filter(function ($d) use ($normal) {
                $base = Regiones::normalizar(Str::before(Str::before($d->nombre, ' - '), ' ('));
                return mb_strlen($base) >= 6 && str_contains($normal, $base);
            })->pluck('id')->all();
        }

        return [
            'respuesta' => $texto !== '' ? $texto : 'Mira estos destinos en el mapa.',
            'destinos'  => array_map(fn ($id) => $this->serializar($porId[$id]), $ids),
            'ruta'      => $ruta ? [
                'nombre'   => $ruta['nombre'],
                'dias'     => $ruta['dias'],
                'destinos' => array_map(fn ($d) => $this->serializar($d), $ruta['destinos']),
            ] : null,
        ];
    }

    private function serializar(Destino $d): array
    {
        return [
            'id'          => $d->id,
            'nombre'      => $d->nombre,
            'descripcion' => $d->descripcion,
            'imagen'      => $d->imagen,
            'imagen_autor'    => $d->imagen_autor,
            'imagen_licencia' => $d->imagen_licencia,
            'imagen_fuente'   => $d->imagen_fuente,
            'latitud'     => (float) $d->latitud,
            'longitud'    => (float) $d->longitud,
            'categoria_id'=> $d->categoria_id,
            'categoria'   => ['nombre' => $d->categoria?->nombre],
            'municipio'   => ['nombre' => $d->municipio?->nombre],
            'region'      => $d->region,
        ];
    }
}
