<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class CatalogoTest extends TestCase
{
    use RefreshDatabase;

    public function test_listado_y_detalle_de_destinos(): void
    {
        $total = DB::table('destinos')->where('estado', 1)->count();
        $this->getJson('/api/destinos')->assertOk()->assertJsonCount($total);

        // El detalle incluye etiquetas y tipos de viajero (antes daba error 500 por la tabla pivote)
        $this->getJson('/api/destinos/1')->assertOk()
            ->assertJsonStructure(['id', 'nombre', 'categoria', 'municipio', 'etiquetas', 'tipos_viajero']);
    }

    public function test_filtro_por_etiqueta(): void
    {
        $esperados = DB::table('destinos_etiquetas')->where('etiqueta_id', 7)->distinct()->count('destino_id');
        $this->assertGreaterThan(0, $esperados);

        $this->getJson('/api/destinos?etiquetas=7')->assertOk()->assertJsonCount($esperados);
    }

    public function test_recomendador_prioriza_lo_elegido_en_el_quiz(): void
    {
        $res = $this->postJson('/api/recomendar', ['categorias' => [8], 'entornos' => [5], 'dias' => 2])->assertOk();

        $this->assertSame('Astronómico', $res->json('itinerario.0.destinos.0.categoria'));
        $this->assertCount(2, $res->json('itinerario'));
    }

    public function test_recomendador_valida_los_datos(): void
    {
        $this->postJson('/api/recomendar', ['dias' => 99])->assertStatus(422);
    }
}
