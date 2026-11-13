<?php

namespace Tests\Feature;

use App\Models\Publicacion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PublicacionTest extends TestCase
{
    use RefreshDatabase;

    private function crearPublicacion(int $userId, array $extra = []): Publicacion
    {
        return Publicacion::create(['user_id' => $userId, 'imagen' => 'storage/publicaciones/x.webp'] + $extra);
    }

    public function test_liked_by_user_se_calcula_con_token(): void
    {
        [$autor] = $this->usuarioConToken();
        [, $token] = $this->usuarioConToken();
        $pub = $this->crearPublicacion($autor->id);

        $this->withToken($token)->postJson("/api/publicaciones/{$pub->id}/like")
            ->assertOk()->assertJson(['liked' => true, 'likes' => 1]);

        $this->withToken($token)->getJson('/api/publicaciones')->assertOk()
            ->assertJsonPath('data.0.liked_by_user', true)
            ->assertJsonPath('data.0.likes_count', 1);
    }

    public function test_liked_by_user_es_false_sin_token(): void
    {
        [$autor] = $this->usuarioConToken();
        $this->crearPublicacion($autor->id);

        $this->getJson('/api/publicaciones')->assertOk()->assertJsonPath('data.0.liked_by_user', false);
    }

    public function test_like_es_un_interruptor_y_requiere_sesion(): void
    {
        [$autor, $token] = $this->usuarioConToken();
        $pub = $this->crearPublicacion($autor->id);

        $this->postJson("/api/publicaciones/{$pub->id}/like")->assertStatus(401);
        $this->withToken($token)->postJson("/api/publicaciones/{$pub->id}/like")->assertJson(['liked' => true]);
        $this->withToken($token)->postJson("/api/publicaciones/{$pub->id}/like")->assertJson(['liked' => false, 'likes' => 0]);
    }

    public function test_feed_paginado_de_10_en_10(): void
    {
        [$autor] = $this->usuarioConToken();
        for ($i = 1; $i <= 12; $i++) {
            $this->crearPublicacion($autor->id, ['descripcion' => "p{$i}", 'created_at' => now()->subMinutes(20 - $i)]);
        }

        $this->getJson('/api/publicaciones')->assertOk()
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('data.0.descripcion', 'p12') // lo más nuevo primero
            ->assertJsonPath('pagina_siguiente', 2);

        $this->getJson('/api/publicaciones?page=2')->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('pagina_siguiente', null);
    }

    public function test_crear_publicacion_optimiza_la_foto_y_devuelve_url_completa(): void
    {
        Storage::fake('public');
        [, $token] = $this->usuarioConToken();

        $res = $this->withToken($token)->post('/api/publicaciones', [
            'imagen' => UploadedFile::fake()->image('foto.jpg', 3000, 2000),
            'descripcion' => 'Atardecer',
        ], ['Accept' => 'application/json'])->assertCreated()
            ->assertJsonPath('likes_count', 0)
            ->assertJsonPath('comentarios_count', 0);

        $this->assertStringStartsWith(url('storage/publicaciones/'), $res->json('imagen'));
        $archivo = 'publicaciones/' . basename($res->json('imagen'));
        Storage::disk('public')->assertExists($archivo);
        $this->assertStringEndsWith('.webp', $archivo);
        $this->assertSame(1400, getimagesizefromstring(Storage::disk('public')->get($archivo))[0]);

        // En la BD queda la ruta relativa, no http://localhost...
        $this->assertSame('storage/' . $archivo, Publicacion::find($res->json('id'))->getRawOriginal('imagen'));

        $this->withToken($token)->deleteJson('/api/publicaciones/' . $res->json('id'))->assertOk();
        Storage::disk('public')->assertMissing($archivo);
    }

    public function test_publicar_valida_la_imagen(): void
    {
        [, $token] = $this->usuarioConToken();

        $this->withToken($token)->post('/api/publicaciones', [
            'imagen' => UploadedFile::fake()->create('doc.pdf', 10, 'application/pdf'),
        ], ['Accept' => 'application/json'])->assertStatus(422)->assertJsonValidationErrors('imagen');
    }

    public function test_solo_el_autor_edita_y_el_autor_o_un_admin_borra(): void
    {
        [$autor, $tokenAutor] = $this->usuarioConToken();
        [, $otroToken] = $this->usuarioConToken();
        [, $adminToken] = $this->usuarioConToken(['rol' => 'admin']);
        $pub = $this->crearPublicacion($autor->id, ['descripcion' => 'Hola', 'ubicacion' => 'Neiva']);

        $this->withToken($otroToken)->putJson("/api/publicaciones/{$pub->id}", ['descripcion' => 'hack'])->assertStatus(403);
        $this->withToken($otroToken)->deleteJson("/api/publicaciones/{$pub->id}")->assertStatus(403);

        $this->app['auth']->forgetGuards();
        $this->withToken($tokenAutor)->putJson("/api/publicaciones/{$pub->id}", ['descripcion' => 'Editada', 'ubicacion' => null])
            ->assertOk()->assertJsonPath('descripcion', 'Editada')->assertJsonPath('ubicacion', null);

        $this->app['auth']->forgetGuards();
        $this->withToken($adminToken)->deleteJson("/api/publicaciones/{$pub->id}")->assertOk();
        $this->assertNull(Publicacion::find($pub->id));
    }

    public function test_comentarios_crear_listar_y_borrar(): void
    {
        [$autor, $tokenAutor] = $this->usuarioConToken();
        [, $tokenAna] = $this->usuarioConToken(['nombre' => 'Ana']);
        [, $tokenLuis] = $this->usuarioConToken();
        $pub = $this->crearPublicacion($autor->id);

        $this->postJson("/api/publicaciones/{$pub->id}/comentarios", ['texto' => 'Hola'])->assertStatus(401);

        $c1 = $this->withToken($tokenAna)->postJson("/api/publicaciones/{$pub->id}/comentarios", ['texto' => '  ¡Qué lindo!  '])
            ->assertCreated()->assertJsonPath('texto', '¡Qué lindo!')->assertJsonPath('user.nombre', 'Ana')->json('id');
        $this->withToken($tokenAna)->postJson("/api/publicaciones/{$pub->id}/comentarios", ['texto' => ''])
            ->assertStatus(422)->assertJsonValidationErrors('texto');

        $this->getJson("/api/publicaciones/{$pub->id}/comentarios")->assertOk()->assertJsonCount(1);
        $this->getJson('/api/publicaciones')->assertJsonPath('data.0.comentarios_count', 1);

        // Un tercero no puede borrarlo; el autor de la publicación sí
        $this->app['auth']->forgetGuards();
        $this->withToken($tokenLuis)->deleteJson("/api/comentarios/{$c1}")->assertStatus(403);
        $this->app['auth']->forgetGuards();
        $this->withToken($tokenAutor)->deleteJson("/api/comentarios/{$c1}")->assertOk();
        $this->getJson("/api/publicaciones/{$pub->id}/comentarios")->assertJsonCount(0);
    }

    public function test_borrar_publicacion_borra_sus_comentarios_y_likes(): void
    {
        [$autor, $token] = $this->usuarioConToken();
        $pub = $this->crearPublicacion($autor->id);
        $this->withToken($token)->postJson("/api/publicaciones/{$pub->id}/comentarios", ['texto' => 'x'])->assertCreated();
        $this->withToken($token)->postJson("/api/publicaciones/{$pub->id}/like")->assertOk();

        $this->withToken($token)->deleteJson("/api/publicaciones/{$pub->id}")->assertOk();
        $this->assertDatabaseCount('publicacion_comentarios', 0);
        $this->assertDatabaseCount('publicacion_likes', 0);
    }
}
