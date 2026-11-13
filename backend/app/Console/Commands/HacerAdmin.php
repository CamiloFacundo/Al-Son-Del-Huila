<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

/**
 *   php artisan usuarios:admin correo@ejemplo.com          → da el rol admin
 *   php artisan usuarios:admin correo@ejemplo.com --quitar → lo devuelve a turista
 */
class HacerAdmin extends Command
{
    protected $signature = 'usuarios:admin {email} {--quitar}';

    protected $description = 'Da (o quita) el rol de administrador a un usuario';

    public function handle(): int
    {
        $user = User::where('email', $this->argument('email'))->first();
        if (!$user) {
            $this->error('No existe ningún usuario con ese correo.');
            return self::FAILURE;
        }

        $user->forceFill(['rol' => $this->option('quitar') ? 'turista' : 'admin'])->save();
        $this->info("{$user->nombre} ahora tiene el rol: {$user->rol}");

        return self::SUCCESS;
    }
}
