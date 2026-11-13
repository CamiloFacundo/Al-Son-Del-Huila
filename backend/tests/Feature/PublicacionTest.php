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

    private function crearPublicacion(int $userId): Publicacion
    {
        return Publicacion::create(['user_id' => $userId, 'imagen' => 'http://localhost/storage/publicaciones/x.jpg']);
    }

    public function test_liked_by_user_se_calcula_con_token(): void
    {
        [$autor] = $this->usuarioConToken();
        [, $token] = $this->usuarioConToken();
        $pub = $this->crearPublicacion($autor->id);

        $this->withToken($token)->postJson("/api/publicaciones/{$pub->id}/like")
            ->assertOk()->assertJson(['liked' => true, 'likes' => 1]);

        $this->withToken($token)->getJson('/api/publicaciones')->assertOk()
            ->assertJsonPath('0.liked_by_user', true)
            ->assertJsonPath('0.likes_count', 1);
    }

    public function test_liked_by_user_es_false_sin_token(): void
    {
        [$autor] = $this->usuarioConToken();
        $this->crearPublicacion($autor->id);

        $this->getJson('/api/publicaciones')->assertOk()->assertJsonPath('0.liked_by_user', false);
    }

    public function test_like_es_un_interruptor(): void
    {
        [$autor, $token] = $this->usuarioConToken();
        $pub = $this->crearPublicacion($autor->id);

        $this->withToken($token)->postJson("/api/publicaciones/{$pub->id}/like")->assertJson(['liked' => true]);
        $this->withToken($token)->postJson("/api/publicaciones/{$pub->id}/like")->assertJson(['liked' => false, 'likes' => 0]);
    }

    public function test_crear_y_borrar_publicacion_borra_la_imagen(): void
    {
        Storage::fake('public');
        [, $token] = $this->usuarioConToken();

        $res = $this->withToken($token)->post('/api/publicaciones', [
            'imagen' => UploadedFile::fake()->image('foto.jpg'),
            'descripcion' => 'Atardecer',
        ], ['Accept' => 'application/json'])->assertCreated();

        $archivo = 'publicaciones/' . basename($res->json('imagen'));
        Storage::disk('public')->assertExists($archivo);

        $this->withToken($token)->deleteJson('/api/publicaciones/' . $res->json('id'))->assertOk();
        Storage::disk('public')->assertMissing($archivo);
    }

    public function test_solo_el_autor_puede_editar_o_borrar(): void
    {
        [$autor] = $this->usuarioConToken();
        [, $otroToken] = $this->usuarioConToken();
        $pub = $this->crearPublicacion($autor->id);

        $this->withToken($otroToken)->putJson("/api/publicaciones/{$pub->id}", ['descripcion' => 'hack'])->assertStatus(403);
        $this->withToken($otroToken)->deleteJson("/api/publicaciones/{$pub->id}")->assertStatus(403);
    }
}
