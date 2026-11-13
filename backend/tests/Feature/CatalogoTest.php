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

    public function test_imagen_se_devuelve_como_url_completa_con_creditos(): void
    {
        DB::table('destinos')->where('id', 1)->update([
            'imagen' => 'images/Destinos/1.webp',
            'imagen_autor' => 'Fotógrafa',
            'imagen_licencia' => 'CC BY-SA 4.0',
            'imagen_fuente' => 'https://commons.wikimedia.org/wiki/File:X.jpg',
        ]);

        $this->getJson('/api/destinos/1')->assertOk()->assertJson([
            'imagen' => url('images/Destinos/1.webp'),
            'imagen_autor' => 'Fotógrafa',
            'imagen_licencia' => 'CC BY-SA 4.0',
        ]);
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

        $destinos = collect($res->json('itinerario'))->flatMap(fn ($d) => $d['destinos']);
        $this->assertCount(2, $res->json('itinerario'));
        $this->assertCount(6, $destinos);
        // Los observatorios (astronómico + desierto) tienen la máxima puntuación y deben estar
        $this->assertSame(2, $destinos->where('categoria', 'Astronómico')->count());
        $this->assertSame(5, $destinos->max('puntuacion'));
    }

    public function test_cada_dia_agrupa_destinos_cercanos(): void
    {
        foreach ([
            ['categorias' => [3, 7], 'entornos' => [4], 'etiquetas' => [5], 'dias' => 3],
            ['categorias' => [4], 'entornos' => [7], 'etiquetas' => [7, 3], 'dias' => 2],
            ['categorias' => [1, 2, 3, 4, 5, 8, 9, 10], 'entornos' => [1, 2, 3, 4, 5, 6, 7], 'dias' => 7],
        ] as $quiz) {
            $itinerario = $this->postJson('/api/recomendar', $quiz)->assertOk()->json('itinerario');
            $this->assertCount($quiz['dias'], $itinerario);

            foreach ($itinerario as $dia) {
                $this->assertCount(3, $dia['destinos']);
                // Antes había días de más de 200 km entre paradas
                $this->assertLessThanOrEqual(130, $dia['distancia_km'], 'Día ' . $dia['dia'] . ' demasiado disperso');
            }

            // Sin destinos repetidos ni casi repetidos ("Mano del Gigante" y "Mano del Gigante - Gigante")
            $nombres = collect($itinerario)->flatMap(fn ($d) => $d['destinos'])
                ->map(fn ($d) => mb_strtolower(trim(explode(' - ', explode('(', $d['nombre'])[0])[0])));
            $this->assertSame($nombres->count(), $nombres->unique()->count());
        }
    }

    public function test_un_dia_son_tres_paradas(): void
    {
        $res = $this->postJson('/api/recomendar', ['categorias' => [10], 'dias' => 1])->assertOk();
        $this->assertCount(1, $res->json('itinerario'));
        $this->assertCount(3, $res->json('itinerario.0.destinos'));
    }

    public function test_recomendador_valida_los_datos(): void
    {
        $this->postJson('/api/recomendar', ['dias' => 99])->assertStatus(422);
    }
}
