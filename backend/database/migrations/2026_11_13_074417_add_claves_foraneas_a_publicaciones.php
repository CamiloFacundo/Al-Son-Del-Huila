<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Las tablas del muro no tenían claves foráneas (publicaciones.user_id era int UNSIGNED y
 * usuarios.id es int con signo, así que la FK original nunca se creó). Sin ellas, borrar una
 * publicación dejaba sus likes huérfanos y borrar un usuario dejaba sus publicaciones.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Quitar huérfanos que impedirían crear las claves
        DB::table('publicacion_likes')->whereNotIn('publicacion_id', DB::table('publicaciones')->select('id'))->delete();
        DB::table('publicacion_likes')->whereNotIn('usuario_id', DB::table('usuarios')->select('id'))->delete();
        DB::table('publicaciones')->whereNotIn('user_id', DB::table('usuarios')->select('id'))->delete();

        Schema::table('publicaciones', function (Blueprint $table) {
            $table->integer('user_id')->change(); // mismo tipo que usuarios.id
            $table->foreign('user_id')->references('id')->on('usuarios')->cascadeOnDelete();
        });

        Schema::table('publicacion_likes', function (Blueprint $table) {
            $table->foreign('publicacion_id')->references('id')->on('publicaciones')->cascadeOnDelete();
            $table->foreign('usuario_id')->references('id')->on('usuarios')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('publicacion_likes', function (Blueprint $table) {
            $table->dropForeign(['publicacion_id']);
            $table->dropForeign(['usuario_id']);
        });
        Schema::table('publicaciones', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->unsignedInteger('user_id')->change();
        });
    }
};
