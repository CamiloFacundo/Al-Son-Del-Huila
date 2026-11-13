<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * php artisan migrate:fresh --seed
     * Crea el esquema (database/schema/mysql-schema.sql) y carga el catálogo.
     * No crea usuarios: regístrate desde la app.
     */
    public function run(): void
    {
        $this->call(CatalogoSeeder::class);
    }
}
