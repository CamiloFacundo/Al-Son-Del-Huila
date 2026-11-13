<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * - Créditos de la foto de cada destino (las fotos de Wikimedia Commons exigen citar autor y licencia).
 * - `imagen` pasa a guardar solo la ruta relativa (images/Destinos/x.webp); el modelo Destino
 *   construye la URL completa con APP_URL. Antes se guardaba http://localhost:8000/..., que no
 *   funciona en otro servidor.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('destinos', function (Blueprint $table) {
            $table->string('imagen_autor', 255)->nullable()->after('imagen');
            $table->string('imagen_licencia', 100)->nullable()->after('imagen_autor');
            $table->string('imagen_fuente', 500)->nullable()->after('imagen_licencia');
        });

        // http://localhost:8000/images/Destinos/x.jpg  →  images/Destinos/x.jpg
        DB::table('destinos')
            ->where('imagen', 'like', 'http%/images/%')
            ->update(['imagen' => DB::raw("SUBSTRING(imagen, LOCATE('/images/', imagen) + 1)")]);
    }

    public function down(): void
    {
        Schema::table('destinos', function (Blueprint $table) {
            $table->dropColumn(['imagen_autor', 'imagen_licencia', 'imagen_fuente']);
        });
    }
};
