<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('rutas', function (Blueprint $table) {
            $table->id();
            // usuarios.id es int(11) con signo: foreignId() (bigint unsigned) no encaja y la FK falla
            $table->integer('user_id');
            $table->foreign('user_id')->references('id')->on('usuarios')->onDelete('cascade');
            $table->string('nombre');
            $table->integer('dias')->nullable();
            $table->json('destinos')->nullable();
            $table->boolean('publica')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('rutas');
    }
};