<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ruta extends Model
{
    protected $fillable = ['user_id', 'nombre', 'dias', 'destinos', 'publica'];
    protected $casts = ['destinos' => 'array'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}