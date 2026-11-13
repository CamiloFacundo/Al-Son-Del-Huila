<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

/*
 * Imágenes subidas por los usuarios (storage/app/public/{carpeta}/{archivo}).
 * Se sirven con estas rutas en vez del enlace simbólico de `php artisan storage:link`.
 * basename() deja solo el nombre del archivo: impide pedir rutas como "../../.env".
 */
$servirImagen = function (string $carpeta, string $archivo) {
    $ruta = storage_path("app/public/{$carpeta}/" . basename($archivo));
    abort_unless(is_file($ruta), 404);
    return response()->file($ruta);
};

Route::get('/imagenes/publicaciones/{archivo}', fn (string $archivo) => $servirImagen('publicaciones', $archivo))
    ->where('archivo', '[A-Za-z0-9._-]+');

Route::get('/storage/publicaciones/{archivo}', fn (string $archivo) => $servirImagen('publicaciones', $archivo))
    ->where('archivo', '[A-Za-z0-9._-]+');

Route::get('/storage/fotos/{archivo}', fn (string $archivo) => $servirImagen('fotos', $archivo))
    ->where('archivo', '[A-Za-z0-9._-]+');
