<?php

namespace App\Support;

/**
 * Tablas del catálogo turístico (datos fijos de la app, no de usuarios),
 * en orden de dependencia, con las columnas por las que se ordenan al exportar.
 */
class Catalogo
{
    public const TABLAS = [
        'categorias'             => ['id'],
        'municipios'             => ['id'],
        'entornos'               => ['id'],
        'etiquetas'              => ['id'],
        'tipos_viajero'          => ['id'],
        'destinos'               => ['id'],
        'destinos_etiquetas'     => ['destino_id', 'etiqueta_id'],
        'destinos_tipos_viajero' => ['destino_id', 'tipo_viajero_id'],
        'imagenes_destino'       => ['id'],
    ];
}
