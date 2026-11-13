<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

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

<<<<<<< Updated upstream
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
=======
    protected $appends = ['imagen_url', 'imagenes'];
>>>>>>> Stashed changes

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

    public function imagenesDestino()
    {
        return $this->hasMany(ImagenDestino::class, 'destino_id');
    }

    public function getImagenAttribute($value)
    {
        // Si ya hay imagen en la tabla
        if (!empty($value)) {
            if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
                return $value;
            }
            // Intentar construir URL
            if (file_exists(public_path($value))) {
                return asset($value);
            }
            if (file_exists(public_path('images/' . $value))) {
                return asset('images/' . $value);
            }
            if (file_exists(public_path('images/Destinos/' . $value))) {
                return asset('images/Destinos/' . $value);
            }
            if (Storage::disk('public')->exists($value)) {
                return asset('storage/' . $value);
            }
            // Por defecto, asumir está en images/Destinos
            return asset('images/Destinos/' . ltrim($value, '/'));
        }

        // Buscar en tabla relacionada
        $imagenRelacionada = $this->imagenesDestino()->where('tipo', 'principal')->first()
            ?? $this->imagenesDestino()->first();

        if ($imagenRelacionada && !empty($imagenRelacionada->url)) {
            $url = $imagenRelacionada->url;
            if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
                return $url;
            }
            if (file_exists(public_path($url))) {
                return asset($url);
            }
            if (file_exists(public_path('images/' . $url))) {
                return asset('images/' . $url);
            }
            if (file_exists(public_path('images/Destinos/' . $url))) {
                return asset('images/Destinos/' . $url);
            }
            if (Storage::disk('public')->exists($url)) {
                return asset('storage/' . $url);
            }
            return asset('images/Destinos/' . ltrim($url, '/'));
        }

        // Buscar archivo físico por nombre del destino
        $nombreLimpio = str_replace([' ', '�'], ['_', 'n'], $this->nombre);
        $posibles = [
            $this->nombre . '.jpg', $this->nombre . '.JPG', $this->nombre . '.jpeg', $this->nombre . '.png',
            str_replace(' ', '_', $this->nombre) . '.jpg', str_replace(' ', '_', $this->nombre) . '.JPG',
        ];
        foreach ($posibles as $pos) {
            if (file_exists(public_path('images/Destinos/' . $pos))) {
                return asset('images/Destinos/' . $pos);
            }
        }

        // Imagen representativa según la categoría del destino
        $categoriaId = $this->categoria_id;
        if (!empty($categoriaId)) {
            foreach (['jpg', 'jpeg', 'png', 'webp'] as $ext) {
                $archivoCategoria = 'images/Destinos/_categoria_' . $categoriaId . '.' . $ext;
                if (file_exists(public_path($archivoCategoria))) {
                    return asset($archivoCategoria);
                }
            }
        }

        return null;
    }

    public function getImagenUrlAttribute()
    {
        return $this->getImagenAttribute($this->attributes['imagen'] ?? null);
    }

    public function getImagenesAttribute()
    {
        $imagenes = [];
        foreach ($this->imagenesDestino as $img) {
            $url = $img->url;
            if (empty($url)) continue;
            if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
                $imagenes[] = $url;
                continue;
            }
            if (file_exists(public_path('images/Destinos/' . $url))) {
                $imagenes[] = asset('images/Destinos/' . $url);
                continue;
            }
            if (file_exists(public_path('images/' . $url))) {
                $imagenes[] = asset('images/' . $url);
                continue;
            }
            if (Storage::disk('public')->exists($url)) {
                $imagenes[] = asset('storage/' . $url);
                continue;
            }
            $imagenes[] = asset('images/Destinos/' . ltrim($url, '/'));
        }
        if (empty($imagenes) && $this->imagen) {
            $imagenes[] = $this->imagen;
        }
        return $imagenes;
    }
}