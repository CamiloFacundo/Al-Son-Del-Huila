<?php

use Illuminate\Database\Migrations\Migration;

/**
 * Este archivo estaba vacío y hacía fallar `php artisan migrate`
 * (Class "RenameUsersToUsuarios" not found).
 * La tabla `usuarios` se creó a mano con el SQL del proyecto, así que esta
 * migración no hace nada; se mantiene para no romper el historial de migraciones.
 */
return new class extends Migration
{
    public function up(): void
    {
        //
    }

    public function down(): void
    {
        //
    }
};
