<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Fecha en que el usuario aceptó los Términos y la Política de Privacidad
 * (consentimiento informado, Leyes 1581 de 2012 y 527 de 1999).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->timestamp('terminos_aceptados_at')->nullable()->after('email_verificado');
        });
    }

    public function down(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropColumn('terminos_aceptados_at');
        });
    }
};
