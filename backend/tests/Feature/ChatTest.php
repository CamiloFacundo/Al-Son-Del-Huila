<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ChatTest extends TestCase
{
    use RefreshDatabase;

    private function groqResponde(string $contenido, int $status = 200, array $headers = []): void
    {
        config(['services.groq.key' => 'clave-de-prueba']);
        Http::fake(['api.groq.com/*' => Http::response(
            $status === 200 ? ['choices' => [['message' => ['content' => $contenido]]]] : ['error' => ['message' => $contenido]],
            $status,
            $headers
        )]);
    }

    private function preguntar(string $texto, array $extra = [])
    {
        return $this->postJson('/api/chat', ['mensajes' => [['rol' => 'user', 'texto' => $texto]]] + $extra);
    }

    public function test_sin_api_key_responde_503(): void
    {
        config(['services.groq.key' => null]);

        $this->preguntar('hola')->assertStatus(503);
    }

    public function test_devuelve_texto_limpio_y_destinos_validados(): void
    {
        $this->groqResponde("Visita la **Tatacoa** (ID 111) de noche.\n[DESTINOS: 111, 99999]");

        $res = $this->preguntar('desierto')->assertOk();

        // Sin la etiqueta ni el "(ID 111)", y el ID inventado 99999 se descarta
        $this->assertSame('Visita la **Tatacoa** de noche.', $res->json('respuesta'));
        $this->assertSame([111], array_column($res->json('destinos'), 'id'));
        $this->assertNotNull($res->json('destinos.0.latitud'));
        $this->assertNull($res->json('ruta'));

        Http::assertSent(fn ($req) => $req->hasHeader('Authorization', 'Bearer clave-de-prueba')
            && str_contains($req['messages'][0]['content'], 'Destinos disponibles')
            && $req['messages'][1] === ['role' => 'user', 'content' => 'desierto']);
    }

    public function test_interpreta_la_ruta_aunque_el_json_ocupe_varias_lineas(): void
    {
        $this->groqResponde("**Día 1:** San Agustín\n[RUTA: {\n \"nombre\": \"Sur arqueológico\",\n \"dias\": 2,\n \"destinos\": [180, 181, 99999]\n}]");

        $res = $this->preguntar('ruta por el sur')->assertOk();

        $this->assertSame('**Día 1:** San Agustín', $res->json('respuesta'));
        $this->assertSame('Sur arqueológico', $res->json('ruta.nombre'));
        $this->assertSame(2, $res->json('ruta.dias'));
        $this->assertSame([180, 181], array_column($res->json('ruta.destinos'), 'id'));
        // Sin [DESTINOS], los destinos son los de la ruta
        $this->assertSame([180, 181], array_column($res->json('destinos'), 'id'));
    }

    public function test_si_no_hay_etiquetas_detecta_los_destinos_nombrados(): void
    {
        $nombre = DB::table('destinos')->where('id', 180)->value('nombre'); // Parque Arqueológico de San Agustín
        $this->groqResponde("Te encantará el {$nombre}.");

        $res = $this->preguntar('estatuas en san agustin')->assertOk();
        $this->assertContains(180, array_column($res->json('destinos'), 'id'));
    }

    public function test_pedir_una_region_solo_da_contexto_de_esa_region(): void
    {
        $this->groqResponde('ok');

        $this->preguntar('Crea una ruta de 2 días por el sur del Huila')->assertOk();

        Http::assertSent(function ($req) {
            $prompt = $req['messages'][0]['content'];
            $lista = substr($prompt, strpos($prompt, 'Destinos disponibles'));
            preg_match_all('/\((Norte|Centro|Sur|Occidente)\),/', $lista, $m);
            return count($m[1]) > 0 && array_values(array_unique($m[1])) === ['Sur'];
        });
    }

    public function test_limite_de_groq_devuelve_429_con_mensaje_claro(): void
    {
        $this->groqResponde('Rate limit reached', 429, ['retry-after' => '12']);

        $this->preguntar('hola')->assertStatus(429)
            ->assertJsonPath('reintentar_en', 12)
            ->assertJsonPath('message', 'Huily está atendiendo muchas preguntas a la vez. Espera unos segundos y vuelve a intentarlo.');
    }

    public function test_error_de_groq_no_filtra_detalles(): void
    {
        $this->groqResponde('Invalid API Key', 401);

        $res = $this->preguntar('hola')->assertStatus(502);
        $this->assertStringNotContainsString('Invalid API Key', $res->getContent());
    }

    public function test_solo_envia_los_ultimos_mensajes_y_la_ultima_foto(): void
    {
        $this->groqResponde('ok');
        $foto = 'data:image/png;base64,' . base64_encode('x');
        $mensajes = [];
        for ($i = 0; $i < 14; $i++) {
            $mensajes[] = ['rol' => $i % 2 ? 'assistant' : 'user', 'texto' => "m{$i}"];
        }
        $mensajes[10]['imagen'] = $foto;   // foto antigua (dentro de los últimos 10)
        $mensajes[12]['imagen'] = $foto;   // foto más reciente

        $this->postJson('/api/chat', ['mensajes' => $mensajes])->assertOk();

        Http::assertSent(function ($req) {
            $msgs = array_slice($req['messages'], 1); // sin el system
            $conImagen = array_filter($msgs, fn ($m) => is_array($m['content']));
            return count($msgs) === 10 && count($conImagen) === 1 && $req['model'] === config('services.groq.vision_model');
        });
    }

    public function test_rechaza_imagenes_que_no_son_data_url(): void
    {
        config(['services.groq.key' => 'clave-de-prueba']);

        $this->postJson('/api/chat', ['mensajes' => [['rol' => 'user', 'imagen' => 'http://evil.test/x.png']]])
            ->assertStatus(422)->assertJsonValidationErrors('mensajes.0.imagen');
    }
}
