<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_registro_devuelve_token_y_usuario(): void
    {
        $res = $this->postJson('/api/auth/register', [
            'nombre' => 'Ana', 'email' => 'ana@test.local', 'password' => 'secreto123', 'acepta_terminos' => true,
        ]);

        $res->assertCreated()->assertJsonStructure(['token', 'user' => ['id', 'nombre', 'email']]);
        $this->assertArrayNotHasKey('password', $res->json('user'));
    }

    public function test_registro_rechaza_email_repetido(): void
    {
        $this->usuarioConToken(['email' => 'repe@test.local']);

        $this->postJson('/api/auth/register', [
            'nombre' => 'Otro', 'email' => 'repe@test.local', 'password' => 'secreto123', 'acepta_terminos' => true,
        ])->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_login_correcto_e_incorrecto(): void
    {
        $this->usuarioConToken(['email' => 'luis@test.local']); // contraseña de la factory: "password"

        $this->postJson('/api/auth/login', ['email' => 'luis@test.local', 'password' => 'mala'])->assertStatus(401);
        $this->postJson('/api/auth/login', ['email' => 'luis@test.local', 'password' => 'password'])
            ->assertOk()->assertJsonStructure(['token']);
    }

    public function test_login_bloquea_tras_5_intentos(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/auth/login', ['email' => 'x@test.local', 'password' => 'mala'])->assertStatus(401);
        }
        $this->postJson('/api/auth/login', ['email' => 'x@test.local', 'password' => 'mala'])->assertStatus(429);
    }

    public function test_perfil_requiere_token_y_responde_json(): void
    {
        // Sin "Accept: application/json" también debe ser 401 en JSON (no un 500 por redirigir a "login")
        $this->get('/api/perfil')->assertStatus(401)->assertJson(['message' => 'Unauthenticated.']);

        [, $token] = $this->usuarioConToken();
        $this->withToken($token)->getJson('/api/perfil')->assertOk()->assertJsonStructure(['id', 'nombre', 'email']);
    }

    public function test_token_caducado_es_rechazado(): void
    {
        [, $token] = $this->usuarioConToken();
        PersonalAccessToken::query()->update(['created_at' => now()->subDays(8)]);

        $this->withToken($token)->getJson('/api/perfil')->assertStatus(401);
    }

    public function test_logout_revoca_el_token(): void
    {
        [, $token] = $this->usuarioConToken();

        $this->withToken($token)->postJson('/api/auth/logout')->assertOk();
        $this->assertSame(0, PersonalAccessToken::count());
    }

    public function test_perfil_permite_vaciar_bio(): void
    {
        [, $token] = $this->usuarioConToken(['bio' => 'Hola']);

        $this->withToken($token)->putJson('/api/perfil', ['bio' => ''])->assertOk()->assertJson(['bio' => null]);
    }

    public function test_intercambio_de_codigo_google_es_de_un_solo_uso(): void
    {
        [$user, $token] = $this->usuarioConToken();
        $code = str_repeat('a', 64);
        cache()->put('google_auth:' . $code, $token, 60);

        $this->postJson('/api/auth/google/exchange', ['code' => $code])
            ->assertOk()->assertJson(['token' => $token, 'user' => ['id' => $user->id]]);

        $this->postJson('/api/auth/google/exchange', ['code' => $code])->assertStatus(401);
    }
}
