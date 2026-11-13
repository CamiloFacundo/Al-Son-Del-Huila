<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Resena extends Model
{
    protected $table = 'reseñas';
    public $timestamps = false; // la tabla usa `fecha` (DEFAULT CURRENT_TIMESTAMP)

    protected $fillable = ['usuario_id', 'destino_id', 'rating', 'comentario'];

    protected $casts = ['rating' => 'integer', 'fecha' => 'datetime'];

    public function user()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function destino()
    {
        return $this->belongsTo(Destino::class);
    }

    /**
     * Recalcula la media y el total de reseñas del destino.
     * Los triggers de la BD lo hacen al crear y al borrar, pero no al editar una reseña.
     */
    public static function recalcular(int $destinoId): void
    {
        $base = DB::table('reseñas')->where('destino_id', $destinoId);

        DB::table('destinos')->where('id', $destinoId)->update([
            'total_reseñas'   => (clone $base)->count(),
            'rating_promedio' => round((float) (clone $base)->avg('rating'), 2),
        ]);
    }
}
