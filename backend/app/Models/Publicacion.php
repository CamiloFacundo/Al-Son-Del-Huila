<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Publicacion extends Model
{
    use HasFactory;

    protected $table = 'publicaciones';
    protected $fillable = ['user_id', 'imagen', 'descripcion', 'ubicacion'];

    /**
     * Relación con el usuario que creó la publicación
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relación con los likes de la publicación
     */
    public function likes()
    {
        return $this->hasMany(PublicacionLike::class, 'publicacion_id');
    }

    /**
     * Verifica si un usuario específico ha dado like a esta publicación
     */
    public function isLikedByUser($userId)
    {
        return $this->likes()->where('usuario_id', $userId)->exists();
    }
}