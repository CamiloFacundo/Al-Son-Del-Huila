<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ChatTest extends TestCase
{
    use RefreshDatabase;

    public function test_sin_api_key_responde_503(): void
    {
        config(['services.groq.key' => null]);

        $this->postJson('/api/chat', ['mensajes' => [['rol' => 'user', 'texto' => 'hola']]])->assertStatus(503);
    }

    public function test_reenvia_a_groq_con_los_destinos_de_la_bd(): void
    {
        config(['services.groq.key' => 'clave-de-prueba']);
        Http::fake(['api.groq.com/*' => Http::response([
            'choices' => [['message' => ['content' => 'Visita la Tatacoa [DESTINOS: 1]']]],
        ])]);

        $this->postJson('/api/chat', ['mensajes' => [['rol' => 'user', 'texto' => 'desierto']]])
            ->assertOk()->assertJson(['respuesta' => 'Visita la Tatacoa [DESTINOS: 1]']);

        Http::assertSent(function ($req) {
            return $req->hasHeader('Authorization', 'Bearer clave-de-prueba')
                && str_contains($req['messages'][0]['content'], 'DESTINOS DISPONIBLES')
                && $req['messages'][1] === ['role' => 'user', 'content' => 'desierto'];
        });
    }

    public function test_error_de_groq_no_filtra_detalles(): void
    {
        config(['services.groq.key' => 'clave-de-prueba']);
        Http::fake(['api.groq.com/*' => Http::response(['error' => ['message' => 'Invalid API Key']], 401)]);

        $res = $this->postJson('/api/chat', ['mensajes' => [['rol' => 'user', 'texto' => 'hola']]])->assertStatus(502);
        $this->assertStringNotContainsString('Invalid API Key', $res->getContent());
    }

    public function test_rechaza_imagenes_que_no_son_data_url(): void
    {
        config(['services.groq.key' => 'clave-de-prueba']);

        $this->postJson('/api/chat', ['mensajes' => [['rol' => 'user', 'imagen' => 'http://evil.test/x.png']]])
            ->assertStatus(422)->assertJsonValidationErrors('mensajes.0.imagen');
    }
}
