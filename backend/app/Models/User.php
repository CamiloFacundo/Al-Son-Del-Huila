<?php

namespace App\Models;

use App\Support\Imagenes;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuarios';   // ← aquí

    protected $fillable = [
        'nombre',        // ← no 'name'
        'email',
        'password',
        'bio',
        'ubicacion_texto',
        'foto',
        'foto_portada',
        'google_id',
        'provider',
        'google_token',
        'terminos_aceptados_at',
    ];

    protected $hidden = [
        'password', 'remember_token', 'google_token',
    ];

    /** Fotos de perfil y portada: ruta relativa en la BD, URL completa en la API (las de Google ya son URL) */
    protected function foto(): Attribute
    {
        return Attribute::get(fn (?string $valor) => Imagenes::url($valor));
    }

    protected function fotoPortada(): Attribute
    {
        return Attribute::get(fn (?string $valor) => Imagenes::url($valor));
    }

    /** Destinos guardados como favoritos (tabla favoritos) */
    public function favoritos()
    {
        return $this->belongsToMany(Destino::class, 'favoritos', 'usuario_id', 'destino_id')->withPivot('fecha');
    }

    public function esAdmin(): bool
    {
        return $this->rol === 'admin';
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}