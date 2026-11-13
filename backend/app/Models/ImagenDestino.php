<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImagenDestino extends Model
{
    protected $table = 'imagenes_destino';
    public $timestamps = false;

    protected $fillable = [
        'destino_id',
        'url',
        'tipo',
    ];

    public function destino()
    {
        return $this->belongsTo(Destino::class);
    }
}
