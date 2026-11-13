<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PublicacionComentario extends Model
{
    protected $table = 'publicacion_comentarios';

    protected $fillable = ['publicacion_id', 'usuario_id', 'texto'];

    public function user()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function publicacion()
    {
        return $this->belongsTo(Publicacion::class, 'publicacion_id');
    }
}
