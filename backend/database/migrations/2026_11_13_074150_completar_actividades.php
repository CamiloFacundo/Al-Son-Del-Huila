<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Muro de Actividades:
 * - Comentarios en las publicaciones.
 * - Las imágenes de publicaciones y fotos de perfil pasan a guardarse como ruta relativa
 *   (storage/publicaciones/x.jpg). Antes se guardaba http://localhost:8000/..., que no funciona
 *   en otro servidor. Las URLs externas (fotos de Google) no se tocan.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('publicacion_comentarios', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('publicacion_id');
            $table->integer('usuario_id'); // usuarios.id es int con signo
            $table->string('texto', 500);
            $table->timestamps();

            $table->foreign('publicacion_id')->references('id')->on('publicaciones')->cascadeOnDelete();
            $table->foreign('usuario_id')->references('id')->on('usuarios')->cascadeOnDelete();
            $table->index(['publicacion_id', 'created_at']);
        });

        // http://localhost:8000/imagenes/publicaciones/x.jpg  →  storage/publicaciones/x.jpg
        // http://localhost:8000/storage/publicaciones/x.jpg   →  storage/publicaciones/x.jpg
        foreach (['/imagenes/publicaciones/', '/storage/publicaciones/'] as $marca) {
            DB::table('publicaciones')->where('imagen', 'like', "http%{$marca}%")->update([
                'imagen' => DB::raw("CONCAT('storage/publicaciones/', SUBSTRING_INDEX(imagen, '/', -1))"),
            ]);
        }
        foreach (['foto', 'foto_portada'] as $col) {
            DB::table('usuarios')->where($col, 'like', 'http%/storage/fotos/%')->update([
                $col => DB::raw("CONCAT('storage/fotos/', SUBSTRING_INDEX({$col}, '/', -1))"),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('publicacion_comentarios');
    }
};
