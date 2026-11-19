<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Comprueba la configuración de correo enviando un mensaje de prueba.
 * Uso: php artisan correo:probar tu@correo.com
 */
class ProbarCorreo extends Command
{
    protected $signature = 'correo:probar {destinatario : Correo al que se envía la prueba}';

    protected $description = 'Envía un correo de prueba para verificar MAIL_* en el .env (recuperación de contraseña)';

    public function handle(): int
    {
        $mailer = config('mail.default');

        if ($mailer === 'log') {
            $this->warn('MAIL_MAILER=log: los correos NO se envían, solo se escriben en storage/logs/laravel.log.');
            $this->line('Para enviarlos de verdad pon MAIL_MAILER=smtp y los datos del servidor en backend/.env (ver .env.example).');
        }

        try {
            Mail::raw(
                "Este es un correo de prueba de Al Son del Huila.\n\nSi lo recibiste, la recuperación de contraseña ya puede enviar correos.",
                fn ($m) => $m->to($this->argument('destinatario'))->subject('Prueba de correo · Al Son del Huila')
            );
        } catch (Throwable $e) {
            $this->error('No se pudo enviar: ' . $e->getMessage());
            $this->line('Revisa MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD y MAIL_ENCRYPTION en backend/.env.');
            return self::FAILURE;
        }

        $this->info($mailer === 'log'
            ? 'Correo escrito en storage/logs/laravel.log (no enviado).'
            : "Correo enviado a {$this->argument('destinatario')} con el mailer «{$mailer}». Revisa la bandeja (y el spam).");

        return self::SUCCESS;
    }
}
