<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RutaTest extends TestCase
{
    use RefreshDatabase;

    public function test_crear_ruta_valida_los_datos(): void
    {
        [, $token] = $this->usuarioConToken();

        $this->withToken($token)->postJson('/api/rutas', ['destinos' => [999999]])
            ->assertStatus(422)->assertJsonValidationErrors(['nombre', 'destinos.0']);

        $this->withToken($token)->postJson('/api/rutas', ['nombre' => 'Sur del Huila', 'dias' => 2, 'destinos' => [1, 2]])
            ->assertCreated()->assertJson(['nombre' => 'Sur del Huila', 'destinos' => [1, 2]]);
    }

    public function test_ruta_privada_solo_la_ve_su_dueno(): void
    {
        [, $token] = $this->usuarioConToken();
        [, $otroToken] = $this->usuarioConToken();

        $id = $this->withToken($token)->postJson('/api/rutas', ['nombre' => 'Secreta', 'publica' => false])->json('id');

        $this->withToken($token)->getJson('/api/rutas')->assertJsonFragment(['id' => $id]);

        $this->app['auth']->forgetGuards();
        $this->withToken($otroToken)->getJson('/api/rutas')->assertJsonMissing(['id' => $id]);
    }

    public function test_no_se_puede_borrar_la_ruta_de_otro(): void
    {
        [, $token] = $this->usuarioConToken();
        [, $otroToken] = $this->usuarioConToken();
        $id = $this->withToken($token)->postJson('/api/rutas', ['nombre' => 'Mía'])->json('id');

        $this->app['auth']->forgetGuards();
        $this->withToken($otroToken)->deleteJson("/api/rutas/{$id}")->assertNotFound();
    }
}
