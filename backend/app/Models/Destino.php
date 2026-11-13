<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class Destino extends Model
{
    protected $table    = 'destinos';
    public    $timestamps = false;

    protected $fillable = [
        'nombre', 'descripcion', 'imagen', 'imagen_autor', 'imagen_licencia', 'imagen_fuente',
        'latitud', 'longitud',
        'categoria_id', 'municipio_id', 'entorno_id',
        'direccion', 'horario', 'estado'
    ];

    /**
     * En la BD `imagen` guarda una ruta relativa (images/Destinos/12.webp);
     * la API la devuelve como URL completa según APP_URL.
     */
    public static function urlImagen(?string $ruta): ?string
    {
        if (!$ruta) {
            return null;
        }
        return preg_match('#^https?://#', $ruta) ? $ruta : asset($ruta);
    }

    protected function imagen(): Attribute
    {
        return Attribute::get(fn (?string $valor) => self::urlImagen($valor));
    }

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