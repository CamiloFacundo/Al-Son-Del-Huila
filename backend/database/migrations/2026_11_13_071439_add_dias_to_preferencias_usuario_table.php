<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Días de viaje elegidos en el quiz, para recalcular la ruta recomendada desde el perfil */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('preferencias_usuario', function (Blueprint $table) {
            $table->unsignedTinyInteger('dias')->nullable()->after('accesibilidad_requerida');
        });
    }

    public function down(): void
    {
        Schema::table('preferencias_usuario', function (Blueprint $table) {
            $table->dropColumn('dias');
        });
    }
};
