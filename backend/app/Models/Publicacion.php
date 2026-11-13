<?php

namespace App\Models;

use App\Support\Imagenes;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Publicacion extends Model
{
    use HasFactory;

    protected $table = 'publicaciones';

    protected $fillable = ['user_id', 'imagen', 'descripcion', 'ubicacion'];

    /** En la BD se guarda la ruta relativa; la API devuelve la URL completa */
    protected function imagen(): Attribute
    {
        return Attribute::get(fn (?string $valor) => Imagenes::url($valor));
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function likes()
    {
        return $this->hasMany(PublicacionLike::class, 'publicacion_id');
    }

    public function comentarios()
    {
        return $this->hasMany(PublicacionComentario::class, 'publicacion_id');
    }
}
