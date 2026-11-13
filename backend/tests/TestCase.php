<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Con RefreshDatabase la BD de tests se crea una sola vez por ejecución;
     * se carga el catálogo (DatabaseSeeder) en ese momento para todos los tests.
     */
    protected $seed = true;

    /** Crea un usuario y devuelve [usuario, token] para llamar a la API autenticado. */
    protected function usuarioConToken(array $datos = []): array
    {
        $user = User::factory()->create($datos);
        return [$user, $user->createToken('test')->plainTextToken];
    }
}
