<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Contador de visitas a la ficha de cada destino: alimenta la sección «Los más visitados». */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('destinos', function (Blueprint $table) {
            $table->unsignedInteger('visitas')->default(0)->after('total_reseñas');
            $table->index('visitas');
        });
    }

    public function down(): void
    {
        Schema::table('destinos', function (Blueprint $table) {
            $table->dropIndex(['visitas']);
            $table->dropColumn('visitas');
        });
    }
};
