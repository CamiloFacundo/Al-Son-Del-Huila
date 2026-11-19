<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** «Los más visitados»: contador de visitas a la ficha y listado de populares. */
class VisitasTest extends TestCase
{
    use RefreshDatabase;

    public function test_la_visita_cuenta_una_vez_por_persona(): void
    {
        $this->postJson('/api/destinos/5/visita')->assertOk()->assertJson(['visitas' => 1]);
        $this->postJson('/api/destinos/5/visita')->assertOk()->assertJson(['visitas' => 1]); // misma IP: no suma

        $this->withServerVariables(['REMOTE_ADDR' => '10.0.0.2'])
            ->postJson('/api/destinos/5/visita')->assertOk()->assertJson(['visitas' => 2]);
    }

    public function test_populares_ordena_por_visitas(): void
    {
        DB::table('destinos')->where('id', 7)->update(['visitas' => 50]);
        DB::table('destinos')->where('id', 3)->update(['visitas' => 20]);

        $ids = collect($this->getJson('/api/destinos/populares?limite=3')->assertOk()->json())->pluck('id');

        $this->assertCount(3, $ids);
        $this->assertSame([7, 3], $ids->take(2)->all());
    }

    public function test_visita_a_destino_inexistente_da_404(): void
    {
        $this->postJson('/api/destinos/999999/visita')->assertNotFound();
    }
}
