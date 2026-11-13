<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Borra de la BD los tokens caducados (más de 24 h después de caducar).
// Para que corra solo: `php artisan schedule:work` en desarrollo o un cron con `schedule:run` en producción.
Schedule::command('sanctum:prune-expired --hours=24')->daily();
