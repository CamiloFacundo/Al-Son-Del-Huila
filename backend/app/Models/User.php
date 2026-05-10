<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

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
    ];

    protected $hidden = [
        'password', 'remember_token', 'google_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}