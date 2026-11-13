<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Destino extends Model
{
    protected $table    = 'destinos';
    public    $timestamps = false;

    protected $fillable = [
        'nombre', 'descripcion', 'imagen',
        'latitud', 'longitud',
        'categoria_id', 'municipio_id', 'entorno_id',
        'direccion', 'horario', 'estado'
    ];

    // Relaciones
    public function categoria() {
        return $this->belongsTo(Categoria::class);
    }

    public function municipio() {
        return $this->belongsTo(Municipio::class);
    }

    public function entorno() {
        return $this->belongsTo(Entorno::class);
    }

    public function etiquetas() {
        // Tabla real del esquema: destinos_etiquetas (destino_etiquetas era una tabla de prueba)
        return $this->belongsToMany(Etiqueta::class, 'destinos_etiquetas', 'destino_id', 'etiqueta_id');
    }

    public function tiposViajero() {
        // Tabla real: destinos_tipos_viajero (antes apuntaba a destino_tipo_viajero, que no existe → error 500)
        return $this->belongsToMany(TipoViajero::class, 'destinos_tipos_viajero', 'destino_id', 'tipo_viajero_id');
    }
}