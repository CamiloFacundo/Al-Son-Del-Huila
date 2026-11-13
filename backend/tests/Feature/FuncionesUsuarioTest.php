<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

/** Reseñas, favoritos, preferencias del quiz, recuperar contraseña y panel de administración */
class FuncionesUsuarioTest extends TestCase
{
    use RefreshDatabase;

    // ── Reseñas ──

    public function test_resena_crea_edita_y_borra_actualizando_la_media(): void
    {
        [, $ana] = $this->usuarioConToken();
        [, $luis] = $this->usuarioConToken();

        $this->withToken($ana)->postJson('/api/destinos/1/resenas', ['rating' => 5, 'comentario' => 'Precioso'])->assertCreated();
        $this->app['auth']->forgetGuards();
        $this->withToken($luis)->postJson('/api/destinos/1/resenas', ['rating' => 3])->assertCreated();
        $this->assertDestino(1, 4.0, 2);

        // Editar la propia (no crea otra): la media se recalcula aunque el trigger de la BD solo cubra INSERT/DELETE
        $this->withToken($luis)->postJson('/api/destinos/1/resenas', ['rating' => 1])->assertOk();
        $this->assertDestino(1, 3.0, 2);

        $this->withToken($luis)->getJson('/api/destinos/1/resenas')->assertOk()
            ->assertJsonPath('total', 2)->assertJsonPath('mi_resena.rating', 1)
            ->assertJsonCount(2, 'resenas');

        $this->withToken($luis)->deleteJson('/api/destinos/1/resenas')->assertOk();
        $this->assertDestino(1, 5.0, 1);
    }

    public function test_resena_valida_y_requiere_sesion(): void
    {
        $this->postJson('/api/destinos/1/resenas', ['rating' => 5])->assertStatus(401);

        [, $token] = $this->usuarioConToken();
        $this->withToken($token)->postJson('/api/destinos/1/resenas', ['rating' => 6])
            ->assertStatus(422)->assertJsonValidationErrors('rating');
        $this->withToken($token)->deleteJson('/api/destinos/1/resenas')->assertNotFound();
    }

    private function assertDestino(int $id, float $media, int $total): void
    {
        $d = DB::table('destinos')->where('id', $id)->first();
        $this->assertEqualsWithDelta($media, (float) $d->rating_promedio, 0.01);
        $this->assertSame($total, (int) $d->{'total_reseñas'});
    }

    // ── Favoritos ──

    public function test_favoritos_se_guardan_y_se_marcan_en_los_destinos(): void
    {
        [, $token] = $this->usuarioConToken();

        $this->withToken($token)->postJson('/api/destinos/2/favorito')->assertOk()->assertJson(['favorito' => true]);
        $this->withToken($token)->getJson('/api/perfil/favoritos')->assertOk()
            ->assertJsonCount(1)->assertJsonPath('0.id', 2);
        $this->withToken($token)->getJson('/api/destinos/2')->assertJsonPath('es_favorito', true);

        $this->withToken($token)->postJson('/api/destinos/2/favorito')->assertJson(['favorito' => false]);
        $this->withToken($token)->getJson('/api/perfil/favoritos')->assertJsonCount(0);
    }

    public function test_sin_sesion_ningun_destino_es_favorito(): void
    {
        $this->getJson('/api/destinos/2')->assertOk()->assertJsonPath('es_favorito', false);
    }

    // ── Preferencias del quiz ──

    public function test_preferencias_se_guardan_y_se_leen(): void
    {
        [, $token] = $this->usuarioConToken();

        $this->withToken($token)->getJson('/api/perfil/preferencias')->assertOk()->assertExactJson([]);

        $prefs = ['categorias' => [1, 8], 'entornos' => [5], 'etiquetas' => [4], 'tipo_viajero' => 2, 'dias' => 3];
        $this->withToken($token)->putJson('/api/perfil/preferencias', $prefs)->assertOk()->assertJson($prefs);

        // Guardar de nuevo reemplaza (no acumula)
        $this->withToken($token)->putJson('/api/perfil/preferencias', ['categorias' => [3], 'entornos' => [], 'etiquetas' => []])
            ->assertOk()->assertJson(['categorias' => [3], 'entornos' => [], 'tipo_viajero' => null]);
    }

    public function test_preferencias_validan_ids(): void
    {
        [, $token] = $this->usuarioConToken();

        $this->withToken($token)->putJson('/api/perfil/preferencias', ['categorias' => [999], 'entornos' => [], 'etiquetas' => []])
            ->assertStatus(422)->assertJsonValidationErrors('categorias.0');
    }

    // ── Recuperar contraseña ──

    public function test_recuperar_contrasena_envia_enlace_al_frontend_y_permite_cambiarla(): void
    {
        Notification::fake();
        [$user, $tokenViejo] = $this->usuarioConToken(['email' => 'olvido@test.local']);

        // Misma respuesta para un correo que no existe (no revela quién está registrado)
        $this->postJson('/api/auth/forgot-password', ['email' => 'nadie@test.local'])->assertOk();
        $this->postJson('/api/auth/forgot-password', ['email' => 'olvido@test.local'])->assertOk();

        $tokenReset = null;
        Notification::assertSentTo($user, ResetPassword::class, function ($n) use ($user, &$tokenReset) {
            $tokenReset = $n->token;
            $url = $n->toMail($user)->actionUrl;
            return str_starts_with($url, config('services.frontend_url') . '/restablecer?token=');
        });

        $this->postJson('/api/auth/reset-password', [
            'token' => 'malo', 'email' => 'olvido@test.local', 'password' => 'nueva12345', 'password_confirmation' => 'nueva12345',
        ])->assertStatus(422);

        $this->postJson('/api/auth/reset-password', [
            'token' => $tokenReset, 'email' => 'olvido@test.local', 'password' => 'nueva12345', 'password_confirmation' => 'nueva12345',
        ])->assertOk();

        $this->postJson('/api/auth/login', ['email' => 'olvido@test.local', 'password' => 'nueva12345'])->assertOk();
        // Las sesiones anteriores se cierran
        $this->app['auth']->forgetGuards();
        $this->withToken($tokenViejo)->getJson('/api/perfil')->assertStatus(401);
    }

    // ── Administración ──

    public function test_admin_solo_para_administradores(): void
    {
        [, $turista] = $this->usuarioConToken();
        $this->withToken($turista)->getJson('/api/admin/destinos')->assertStatus(403);

        [, $admin] = $this->usuarioConToken(['rol' => 'admin']);
        $this->app['auth']->forgetGuards();
        $this->withToken($admin)->getJson('/api/admin/destinos')->assertOk();
        $this->withToken($admin)->getJson('/api/perfil')->assertJsonPath('rol', 'admin');
    }

    public function test_admin_crea_edita_desactiva_y_sube_imagen(): void
    {
        [, $admin] = $this->usuarioConToken(['rol' => 'admin']);
        $datos = [
            'nombre' => 'Destino de prueba', 'descripcion' => 'Texto', 'categoria_id' => 1, 'municipio_id' => 1,
            'entorno_id' => 3, 'latitud' => 2.93, 'longitud' => -75.28, 'etiquetas' => [3, 4], 'tipos_viajero' => [1],
        ];

        $id = $this->withToken($admin)->postJson('/api/admin/destinos', $datos)->assertCreated()
            ->assertJsonCount(2, 'etiquetas')->json('id');

        $this->withToken($admin)->putJson("/api/admin/destinos/{$id}", ['nombre' => 'Renombrado', 'etiquetas' => [7]] + $datos)
            ->assertOk()->assertJsonPath('nombre', 'Renombrado')->assertJsonCount(1, 'etiquetas');

        $this->withToken($admin)->postJson('/api/admin/destinos', ['nombre' => ''])->assertStatus(422);

        $archivo = public_path("images/Destinos/{$id}.webp");
        try {
            $this->withToken($admin)->post("/api/admin/destinos/{$id}/imagen", [
                'imagen' => UploadedFile::fake()->image('foto.jpg', 1600, 900), 'autor' => 'Equipo',
            ], ['Accept' => 'application/json'])->assertOk()->assertJsonPath('imagen_autor', 'Equipo');
            $this->assertFileExists($archivo);
            $this->assertSame(1200, getimagesize($archivo)[0]);
        } finally {
            File::delete($archivo);
        }

        $this->withToken($admin)->deleteJson("/api/admin/destinos/{$id}")->assertOk();
        $this->assertSame(0, (int) DB::table('destinos')->where('id', $id)->value('estado'));
        $this->app['auth']->forgetGuards();
        $this->getJson('/api/destinos')->assertJsonMissing(['id' => $id]);
    }

    public function test_comando_para_dar_rol_admin(): void
    {
        $user = User::factory()->create(['email' => 'jefe@test.local']);

        $this->artisan('usuarios:admin', ['email' => 'jefe@test.local'])->assertSuccessful();
        $this->assertSame('admin', $user->fresh()->rol);

        $this->artisan('usuarios:admin', ['email' => 'jefe@test.local', '--quitar' => true])->assertSuccessful();
        $this->assertSame('turista', $user->fresh()->rol);
    }
}
