<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * php artisan migrate:fresh --seed
     * Crea el esquema (database/schema/mysql-schema.sql), carga el catálogo y las publicaciones
     * de bienvenida de Actividades (firmadas por la cuenta del equipo; regístrate desde la app).
     */
    public function run(): void
    {
        $this->call(CatalogoSeeder::class);
        $this->call(PublicacionesSeeder::class);
    }
}
