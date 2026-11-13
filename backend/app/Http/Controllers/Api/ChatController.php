<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Destino;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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
        if ($destinos->isEmpty()) {
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

    private function buscarDestinos(string $consulta): Collection
    {
        $consulta = trim($consulta);
        if (mb_strlen($consulta) < 3) {
            return collect();
        }

        return Destino::with(['categoria', 'municipio'])
            ->where('estado', true)
            ->where(function ($q) use ($consulta) {
                $q->where('nombre', 'like', "%{$consulta}%")
                  ->orWhere('descripcion', 'like', "%{$consulta}%")
                  ->orWhereHas('categoria', fn ($c) => $c->where('nombre', 'like', "%{$consulta}%"))
                  ->orWhereHas('municipio', fn ($m) => $m->where('nombre', 'like', "%{$consulta}%"));
            })
            ->limit(6)
            ->get();
    }

    private function destinosBase(): Collection
    {
        return Destino::with(['categoria', 'municipio'])
            ->where('estado', true)
            ->limit(6)
            ->get();
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
