<?php

namespace Database\Seeders;

use App\Support\Imagenes;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Publicaciones de bienvenida del muro de Actividades, firmadas por la cuenta del equipo.
 * Las fotos salen de public/images/Destinos/{id}.webp (ya están en el repositorio).
 * Si la cuenta del equipo ya tiene publicaciones, no las duplica: solo regenera las fotos que falten.
 */
class PublicacionesSeeder extends Seeder
{
    private const EMAIL = 'equipo@alsondelhuila.local';

    /** [id del destino (foto), ubicación, texto] */
    private const PUBLICACIONES = [
        [180, 'San Agustín, Huila', 'Caminar entre las estatuas de San Agustín es entrar en el legado de culturas milenarias. Patrimonio de la Humanidad, con esculturas y tumbas prehispánicas entre montañas verdes. Abre de 8:00 a. m. a 5:00 p. m.: llega temprano.'],
        [111, 'Villavieja, Huila', 'Atardecer en la Tatacoa: cárcavas rojizas que parecen de otro planeta. Es la segunda zona árida más extensa de Colombia y destino Starlight, así que quédate a la noche a ver las estrellas. Lleva agua, sombrero y bloqueador.'],
        [22,  'Rivera, Huila', 'Aguas que brotan a 70 °C en Rivera. Termales Tierra de Promisión tiene piscina termal, restaurante y bar, y abre todos los días de 7:00 a. m. a 11:00 p. m. El plan perfecto para descansar después de un día de paseo.'],
        [140, 'Acevedo, Huila', 'Más de 400 metros de caída: la Cascada de Bordones es una de las más altas de Colombia. Se llega por sendero y con guía, entre montañas cubiertas de vegetación. Lleva calzado de caminata e impermeable.'],
        [4,   'Neiva, Huila', 'Tarde en el Malecón del río Magdalena, el corazón turístico de Neiva. Canoas de colores, artesanos, comidas típicas y ciclovía a la orilla del río. Abierto las 24 horas; el mejor momento es al caer el sol.'],
        [131, 'Yaguará, Huila', 'La represa de Betania: 7.400 hectáreas de agua entre montañas. Paseos en lancha, pesca deportiva y deportes náuticos para pasar el día en Yaguará. ¿Ya la conoces desde el agua?'],
        [55,  'Palermo, Huila', 'El río Tune esculpió en Palermo esta piscina natural entre rocas lisas y curvas. El Cañón de los Ídolos es un rincón poco conocido del Huila: ve con un guía local y deja el lugar como lo encontraste.'],
        [178, 'Pitalito, Huila', 'Laguna Guaitipán, en Pitalito: agua quieta rodeada de verde para caminar, pescar y desconectarse en el Valle de Laboyos. Foto: Mottenpriesterin (CC BY-SA 4.0, Wikimedia Commons).'],
        [163, 'Guadalupe, Huila', 'Senderos rurales que terminan en saltos de agua: así son las Cascadas de Guadalupe. Un plan de ecoturismo en el centro del Huila para caminar, refrescarse y tomar fotos. Ve con ropa cómoda.'],
        [170, 'La Plata, Huila', 'En la zona rural de La Plata, el agua cae entre bosque y helechos. Las Cascadas de La Plata son ideales para caminatas y fotografía en el occidente del Huila. ¿Cuál es tu cascada favorita del departamento?'],
    ];

    public function run(): void
    {
        $idUsuario = DB::table('usuarios')->where('email', self::EMAIL)->value('id') ?? DB::table('usuarios')->insertGetId([
            'nombre' => 'Al Son del Huila',
            'email' => self::EMAIL,
            'password' => Hash::make(Str::random(48)), // cuenta solo para firmar: nadie inicia sesión con ella
            'rol' => 'turista',
            'bio' => 'Equipo de Al Son del Huila: destinos, rutas y paisajes del Huila.',
            'ubicacion_texto' => 'Neiva, Huila',
            'activo' => 1,
            'email_verificado' => 1,
            'fecha_registro' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $existentes = DB::table('publicaciones')->where('user_id', $idUsuario)->get(['id', 'imagen', 'descripcion']);
        if ($existentes->isNotEmpty()) {
            $this->repararFotos($existentes);
            return;
        }

        foreach (self::PUBLICACIONES as $i => [$destinoId, $ubicacion, $texto]) {
            $webp = $this->foto($destinoId);
            if ($webp === null) {
                $this->command?->warn("  Sin foto para el destino {$destinoId}: se omite");
                continue;
            }

            $archivo = 'publicaciones/' . Str::uuid() . '.webp';
            Storage::disk('public')->put($archivo, $webp);

            // Repartidas en los últimos días; la primera de la lista queda como la más reciente
            $fecha = now()->subHours($i * 19 + 2);
            DB::table('publicaciones')->insert([
                'user_id' => $idUsuario,
                'imagen' => 'storage/' . $archivo,
                'descripcion' => $texto,
                'ubicacion' => $ubicacion,
                'likes' => 0,
                'created_at' => $fecha,
                'updated_at' => $fecha,
            ]);
        }

        $this->command?->info('  ' . count(self::PUBLICACIONES) . ' publicaciones del equipo creadas');
    }

    /**
     * Si la base se copió de otro equipo, las filas llegan sin sus fotos (storage no está en git).
     * Se regenera cada foto que falte con el mismo nombre de archivo: likes y comentarios se conservan.
     */
    private function repararFotos($existentes): void
    {
        $destinoPorTexto = collect(self::PUBLICACIONES)->mapWithKeys(fn ($p) => [$p[2] => $p[0]]);
        $reparadas = 0;

        foreach ($existentes as $pub) {
            $archivo = preg_replace('#^storage/#', '', (string) $pub->imagen);
            if (Storage::disk('public')->exists($archivo)) {
                continue;
            }
            $destinoId = $destinoPorTexto[$pub->descripcion] ?? null;
            $webp = $destinoId ? $this->foto($destinoId) : null;
            if ($webp === null || !str_starts_with($archivo, 'publicaciones/')) {
                $this->command?->warn("  La publicación {$pub->id} no tiene foto y no se pudo regenerar");
                continue;
            }
            Storage::disk('public')->put($archivo, $webp);
            $reparadas++;
        }

        $this->command?->info($reparadas
            ? "  Fotos regeneradas: {$reparadas} (las publicaciones del equipo ya existían)"
            : '  Las publicaciones del equipo ya existen y tienen sus fotos');
    }

    /** Foto del destino convertida a WebP para el muro (null si no se puede). */
    private function foto(int $destinoId): ?string
    {
        $origen = public_path("images/Destinos/{$destinoId}.webp");
        return is_file($origen) ? Imagenes::webp(file_get_contents($origen), 1400, 80) : null;
    }
}
