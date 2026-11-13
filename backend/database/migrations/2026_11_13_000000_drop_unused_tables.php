<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Borra tablas que la aplicación no usa (revisado: ni código, ni frontend, ni vistas/triggers).
 *  - users: la de Laravel por defecto; la app usa `usuarios`.
 *  - actividades, actividad_likes, comentarios, comentario_likes: diseño antiguo del muro
 *    (ahora se usa publicaciones / publicacion_likes).
 *  - destinos_categorias, destinos_entornos: duplican destinos.categoria_id / entorno_id.
 *  - destino_etiquetas: tabla de prueba; la buena es destinos_etiquetas.
 *
 * down() vuelve a crear la estructura (sin datos).
 */
return new class extends Migration
{
    public function up(): void
    {
        // Primero las tablas hijas (tienen claves foráneas hacia las otras)
        Schema::dropIfExists('comentario_likes');
        Schema::dropIfExists('actividad_likes');
        Schema::dropIfExists('comentarios');
        Schema::dropIfExists('actividades');
        Schema::dropIfExists('destinos_categorias');
        Schema::dropIfExists('destinos_entornos');
        Schema::dropIfExists('destino_etiquetas');
        Schema::dropIfExists('users');
    }

    public function down(): void
    {
        DB::unprepared(<<<'SQL'
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bio` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ubicacion` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto_portada` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `google_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provider` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'local',
  `google_token` text COLLATE utf8mb4_unicode_ci,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_google_id_unique` (`google_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL);
        DB::unprepared(<<<'SQL'
CREATE TABLE `destinos_categorias` (
  `destino_id` int NOT NULL,
  `categoria_id` int NOT NULL,
  PRIMARY KEY (`destino_id`,`categoria_id`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `destinos_categorias_ibfk_1` FOREIGN KEY (`destino_id`) REFERENCES `destinos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `destinos_categorias_ibfk_2` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL);
        DB::unprepared(<<<'SQL'
CREATE TABLE `destinos_entornos` (
  `destino_id` int NOT NULL,
  `entorno_id` int NOT NULL,
  PRIMARY KEY (`destino_id`,`entorno_id`),
  KEY `entorno_id` (`entorno_id`),
  CONSTRAINT `destinos_entornos_ibfk_1` FOREIGN KEY (`destino_id`) REFERENCES `destinos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `destinos_entornos_ibfk_2` FOREIGN KEY (`entorno_id`) REFERENCES `entornos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL);
        DB::unprepared(<<<'SQL'
CREATE TABLE `destino_etiquetas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `destino_id` bigint unsigned DEFAULT NULL,
  `etiqueta_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL);
        DB::unprepared(<<<'SQL'
CREATE TABLE `actividades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `destino_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `titulo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `imagen` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `calificacion` tinyint DEFAULT NULL,
  `total_likes` int DEFAULT '0',
  `total_vistas` int DEFAULT '0',
  `publicado` tinyint(1) DEFAULT '1',
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_edicion` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_destino` (`destino_id`),
  KEY `idx_usuario` (`usuario_id`),
  CONSTRAINT `actividades_ibfk_1` FOREIGN KEY (`destino_id`) REFERENCES `destinos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `actividades_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `actividades_chk_1` CHECK ((`calificacion` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL);
        DB::unprepared(<<<'SQL'
CREATE TABLE `comentarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `actividad_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `comentario_padre_id` int DEFAULT NULL,
  `texto` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_likes` int DEFAULT '0',
  `editado` tinyint(1) DEFAULT '0',
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `actividad_id` (`actividad_id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `comentario_padre_id` (`comentario_padre_id`),
  CONSTRAINT `comentarios_ibfk_1` FOREIGN KEY (`actividad_id`) REFERENCES `actividades` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comentarios_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comentarios_ibfk_3` FOREIGN KEY (`comentario_padre_id`) REFERENCES `comentarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL);
        DB::unprepared(<<<'SQL'
CREATE TABLE `actividad_likes` (
  `usuario_id` int NOT NULL,
  `actividad_id` int NOT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`usuario_id`,`actividad_id`),
  KEY `actividad_id` (`actividad_id`),
  CONSTRAINT `actividad_likes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `actividad_likes_ibfk_2` FOREIGN KEY (`actividad_id`) REFERENCES `actividades` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL);
        DB::unprepared(<<<'SQL'
CREATE TABLE `comentario_likes` (
  `usuario_id` int NOT NULL,
  `comentario_id` int NOT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`usuario_id`,`comentario_id`),
  KEY `comentario_id` (`comentario_id`),
  CONSTRAINT `comentario_likes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comentario_likes_ibfk_2` FOREIGN KEY (`comentario_id`) REFERENCES `comentarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL);
    }
};
