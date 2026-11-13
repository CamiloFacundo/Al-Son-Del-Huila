<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Con RefreshDatabase la BD de tests se crea una sola vez por ejecución;
     * se carga solo el catálogo en ese momento para todos los tests
     * (sin las publicaciones de bienvenida, que escribirían fotos en storage).
     */
    protected $seed = true;

    protected $seeder = \Database\Seeders\CatalogoSeeder::class;

    /** Crea un usuario y devuelve [usuario, token] para llamar a la API autenticado. */
    protected function usuarioConToken(array $datos = []): array
    {
        $user = User::factory()->create($datos);
        return [$user, $user->createToken('test')->plainTextToken];
    }
}
