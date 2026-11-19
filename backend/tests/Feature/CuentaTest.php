<?php

namespace Tests\Feature;

use App\Models\Publicacion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/** Consentimiento al registrarse y derecho a eliminar la cuenta (Ley 1581 de 2012). */
class CuentaTest extends TestCase
{
    use RefreshDatabase;

    public function test_registro_exige_aceptar_terminos_y_guarda_la_fecha(): void
    {
        $datos = ['nombre' => 'Ana', 'email' => 'ana@test.local', 'password' => 'secreto123'];

        $this->postJson('/api/auth/register', $datos)
            ->assertStatus(422)->assertJsonValidationErrors('acepta_terminos');

        $this->postJson('/api/auth/register', $datos + ['acepta_terminos' => true])->assertCreated();
        $this->assertNotNull(DB::table('usuarios')->where('email', 'ana@test.local')->value('terminos_aceptados_at'));
    }

    public function test_eliminar_cuenta_pide_la_contrasena(): void
    {
        [$user, $token] = $this->usuarioConToken();

        $this->withToken($token)->deleteJson('/api/perfil')->assertStatus(422);
        $this->withToken($token)->deleteJson('/api/perfil', ['password' => 'otra'])->assertStatus(422);
        $this->assertDatabaseHas('usuarios', ['id' => $user->id]);
    }

    public function test_eliminar_cuenta_borra_datos_fotos_y_recalcula_resenas(): void
    {
        Storage::fake('public');
        [$user, $token] = $this->usuarioConToken();
        [$otro] = $this->usuarioConToken();

        Storage::disk('public')->put('fotos/yo.webp', 'x');
        Storage::disk('public')->put('publicaciones/mia.webp', 'x');
        $user->forceFill(['foto' => 'storage/fotos/yo.webp'])->save();
        Publicacion::create(['user_id' => $user->id, 'imagen' => 'storage/publicaciones/mia.webp']);
        DB::table('favoritos')->insert(['usuario_id' => $user->id, 'destino_id' => 1]);

        // Dos reseñas en el destino 1: al borrar la cuenta el promedio debe quedar solo con la del otro usuario
        $this->withToken($token)->postJson('/api/destinos/1/resenas', ['rating' => 1])->assertCreated();
        $this->actingAs($otro)->postJson('/api/destinos/1/resenas', ['rating' => 5])->assertCreated();
        $this->app['auth']->forgetGuards();

        $this->withToken($token)->deleteJson('/api/perfil', ['password' => 'password'])->assertOk();

        $this->assertDatabaseMissing('usuarios', ['id' => $user->id]);
        $this->assertDatabaseMissing('favoritos', ['usuario_id' => $user->id]);
        $this->assertDatabaseMissing('publicaciones', ['user_id' => $user->id]);
        $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $user->id]);
        Storage::disk('public')->assertMissing(['fotos/yo.webp', 'publicaciones/mia.webp']);

        $destino = DB::table('destinos')->where('id', 1)->first();
        $this->assertSame(1, (int) $destino->{'total_reseñas'});
        $this->assertEquals(5.0, (float) $destino->rating_promedio);

        // El token ya no sirve
        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/perfil')->assertUnauthorized();
    }

    public function test_cuenta_de_google_confirma_escribiendo_eliminar(): void
    {
        [$user, $token] = $this->usuarioConToken(['provider' => 'google', 'password' => null]);

        $this->withToken($token)->deleteJson('/api/perfil', ['confirmacion' => 'no'])->assertStatus(422);
        $this->withToken($token)->deleteJson('/api/perfil', ['confirmacion' => 'eliminar'])->assertOk();
        $this->assertDatabaseMissing('usuarios', ['id' => $user->id]);
    }
}
