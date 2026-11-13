<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Destino;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Proxy hacia Groq para el asistente Huily.
 * La API key vive solo en el backend (GROQ_API_KEY), nunca en el navegador.
 *
 * POST /api/chat
 * { mensajes: [{rol, texto, imagen?}], contexto?: {rutaActiva, destinos: [nombre]} }
 */
class ChatController extends Controller
{
    private const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

    public function enviar(Request $request)
    {
        $datos = $request->validate([
            'mensajes'                   => 'required|array|min:1|max:30',
            'mensajes.*.rol'             => 'required|in:user,assistant',
            'mensajes.*.texto'           => 'nullable|string|max:4000',
            // Imagen en data URL (máx. ~4 MB de imagen real)
            'mensajes.*.imagen'          => ['nullable', 'string', 'max:5600000', 'regex:/^data:image\/(png|jpe?g|webp|gif);base64,/'],
            'contexto'                   => 'nullable|array',
            'contexto.rutaActiva'        => 'nullable|string|max:150',
            'contexto.destinos'          => 'nullable|array|max:50',
            'contexto.destinos.*'        => 'string|max:150',
        ]);

        $apiKey = config('services.groq.key');
        if (empty($apiKey)) {
            return response()->json(['message' => 'El asistente no está configurado.'], 503);
        }

        $mensajes = $datos['mensajes'];

        // 1. Última pregunta de texto del usuario → búsqueda de destinos (RAG)
        $consulta = collect($mensajes)
            ->reverse()
            ->first(fn ($m) => $m['rol'] === 'user' && empty($m['imagen']))['texto'] ?? '';

        $destinos = $this->buscarDestinos($consulta);
        $hayFoto = collect($mensajes)->contains(fn ($m) => !empty($m['imagen']));
        if ($hayFoto) {
            // Con una foto no hay texto que buscar: se pasa una lista amplia de destinos representativos
            // (los que tienen foto) para que la IA pueda relacionar la imagen con lugares reales
            $destinos = $destinos->concat(
                Destino::with(['categoria', 'municipio'])->where('estado', true)->whereNotNull('imagen')->get()
            )->unique('id')->take(100)->values();
        } elseif ($destinos->isEmpty()) {
            $destinos = $this->destinosBase();
        }

        // 2. Mensajes en formato OpenAI/Groq
        $tieneImagen = false;
        $formateados = [];
        foreach ($mensajes as $m) {
            if (!empty($m['imagen'])) {
                $tieneImagen = true;
                $formateados[] = [
                    'role'    => 'user',
                    'content' => [
                        ['type' => 'image_url', 'image_url' => ['url' => $m['imagen']]],
                        ['type' => 'text', 'text' => $m['texto'] ?: '¿Qué destino del Huila se parece a esta imagen?'],
                    ],
                ];
            } else {
                $formateados[] = [
                    'role'    => $m['rol'],
                    'content' => (string) ($m['texto'] ?? ''),
                ];
            }
        }

        $payload = [
            'model'       => $tieneImagen ? config('services.groq.vision_model') : config('services.groq.model'),
            'temperature' => 0.7,
            'max_tokens'  => 1024,
            'messages'    => array_merge(
                [['role' => 'system', 'content' => $this->promptSistema($destinos, $datos['contexto'] ?? null)]],
                $formateados
            ),
        ];

        try {
            $respuesta = Http::withToken($apiKey)
                ->withOptions(['verify' => config('services.groq.verify_ssl')])
                ->timeout(30)
                ->post(self::GROQ_URL, $payload);

            if ($respuesta->failed()) {
                Log::error('Groq API error', ['status' => $respuesta->status(), 'body' => $respuesta->json()]);
                return response()->json(['message' => 'El asistente no está disponible en este momento.'], 502);
            }

            return response()->json([
                'respuesta' => $respuesta->json('choices.0.message.content', ''),
            ]);
        } catch (\Throwable $e) {
            Log::error('Groq request failed: ' . $e->getMessage());
            return response()->json(['message' => 'El asistente no está disponible en este momento.'], 502);
        }
    }

    // Palabras de la pregunta que no ayudan a buscar
    private const VACIAS = ['quiero', 'quisiera', 'busco', 'buscar', 'donde', 'puedo', 'puede', 'para', 'como', 'cual', 'cuales',
        'que', 'una', 'unos', 'unas', 'algo', 'algun', 'alguna', 'sitio', 'sitios', 'lugar', 'lugares', 'recomiendas', 'recomienda',
        'recomendar', 'recomendacion', 'visitar', 'conocer', 'ir', 'hacer', 'huila', 'cerca', 'mejor', 'mejores', 'tiene', 'hay',
        'esta', 'este', 'estos', 'esas', 'esos', 'con', 'sin', 'por', 'los', 'las', 'del', 'mas', 'muy', 'dias', 'dia', 'plan'];

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
    ];

    /**
     * Busca los destinos relacionados con la pregunta: palabra por palabra (con sinónimos)
     * en nombre, descripción, categoría y municipio, ordenados por número de coincidencias.
     * Antes se buscaba la frase entera y casi nunca encontraba nada.
     */
    private function buscarDestinos(string $consulta): Collection
    {
        $palabras = collect(preg_split('/[^a-z0-9ñ]+/u', Str::lower(Str::ascii($consulta))))
            ->filter(fn ($p) => mb_strlen($p) >= 3 && !in_array($p, self::VACIAS))
            ->flatMap(fn ($p) => array_merge([rtrim($p, 's')], self::SINONIMOS[$p] ?? []))
            ->unique()->values();

        if ($palabras->isEmpty()) {
            return collect();
        }

        $destinos = Destino::with(['categoria', 'municipio'])->where('estado', true)->get();

        return $destinos
            ->map(function ($d) use ($palabras) {
                $texto = Str::lower(Str::ascii($d->nombre . ' ' . $d->descripcion . ' ' . ($d->categoria->nombre ?? '') . ' ' . ($d->municipio->nombre ?? '')));
                $nombre = Str::lower(Str::ascii($d->nombre));
                // Coincidir en el nombre vale más que en la descripción
                $d->relevancia = $palabras->sum(fn ($p) => (str_contains($nombre, $p) ? 3 : 0) + (str_contains($texto, $p) ? 1 : 0));
                return $d;
            })
            ->filter(fn ($d) => $d->relevancia > 0)
            ->sortByDesc('relevancia')
            ->take(8)
            ->values();
    }

    /** Sin coincidencias: una muestra variada (un destino de cada categoría) en vez de los primeros de la lista */
    private function destinosBase(): Collection
    {
        return Destino::with(['categoria', 'municipio'])
            ->where('estado', true)
            ->get()
            ->groupBy('categoria_id')
            ->map(fn ($grupo) => $grupo->random())
            ->take(8)
            ->values();
    }

    private function promptSistema(Collection $destinos, ?array $contexto): string
    {
        $lista = $destinos->map(function ($d) {
            $municipio = $d->municipio->nombre ?? 'Ubicación no especificada';
            $categoria = $d->categoria->nombre ?? 'Sin categoría';
            return "- ID {$d->id}: {$d->nombre} ({$municipio} - {$categoria})";
        })->implode("\n");

        $contextoStr = '';
        if (!empty($contexto['rutaActiva'])) {
            $nombres = implode(', ', $contexto['destinos'] ?? []) ?: 'ninguno';
            $contextoStr = "\nContexto: El usuario tiene seleccionada la ruta \"{$contexto['rutaActiva']}\". Destinos en esa ruta: {$nombres}\n";
        }

        $lista = $lista ?: 'No hay destinos disponibles temporalmente. Responde con disculpa y sugiere intentar más tarde.';

        return <<<PROMPT
Eres Huily, asistente experto en turismo del departamento del Huila (Colombia). Hablas español, eres cálido, entusiasta y preciso.

REGLAS ESTRICTAS:
- SOLO puedes recomendar los destinos que aparecen en la lista siguiente. NO inventes destinos fuera de esta lista.
- Si el usuario pregunta por algo que no está en la lista, sugiere el destino más cercano o pide más detalles.
- Cuando menciones uno o varios destinos, agrega al FINAL de tu respuesta: [DESTINOS: id1,id2,id3]
- Cuando generes una ruta personalizada, usa este formato exacto: [RUTA: {"nombre": "Nombre de la ruta", "destinos": [id1,id2], "dias": N}]
- Si el usuario sube una imagen, analízala y relaciónala con destinos de la lista (puedes sugerir destinos con características similares).
- Responde en máximo 3 párrafos. Sé conciso pero útil.
{$contextoStr}
DESTINOS DISPONIBLES PARA RECOMENDAR (solo estos):
{$lista}

Recuerda: SIEMPRE termina con la etiqueta [DESTINOS: ...] cuando recomiendes algún lugar.
PROMPT;
    }
}
