-- =====================================================
-- SCRIPT DE VALIDACIÓN - MOTOR DE RECOMENDACIÓN (CORREGIDO)
-- =====================================================
-- Ajusta el nombre de la base de datos si es diferente
USE al_son_del_huila;

-- =====================================================
-- 1. CREAR USUARIO DE PRUEBA (si no existe)
-- =====================================================
INSERT IGNORE INTO usuarios (nombre, email, password, rol, activo, email_verificado, fecha_registro)
VALUES ('Usuario Test', 'test@recomendacion.com', 'hash_dummy', 'turista', TRUE, TRUE, NOW());

-- Obtener el ID del usuario recién creado
SET @test_user_id = (SELECT id FROM usuarios WHERE email = 'test@recomendacion.com');

-- =====================================================
-- 2. PREFERENCIAS GLOBALES DEL USUARIO (accesibilidad)
-- =====================================================
INSERT IGNORE INTO preferencias_usuario (usuario_id, accesibilidad_requerida)
VALUES (@test_user_id, FALSE);

-- =====================================================
-- 3. INTERESES DEL USUARIO (gustos con pesos 1-5)
-- =====================================================
-- Interés por categorías (1 = Naturaleza, 4 = Aventura)
INSERT IGNORE INTO usuarios_categorias (usuario_id, categoria_id, peso) VALUES
(@test_user_id, 1, 5),
(@test_user_id, 4, 4);

-- Interés por etiquetas (3 = Caminatas, 4 = Fotografía)
INSERT IGNORE INTO usuarios_etiquetas (usuario_id, etiqueta_id, peso) VALUES
(@test_user_id, 3, 5),
(@test_user_id, 4, 4);

-- Interés por tipos de viajero (3 = Amigos, 4 = Viaje solo)
INSERT IGNORE INTO usuarios_tipos_viajero (usuario_id, tipo_viajero_id, peso) VALUES
(@test_user_id, 3, 4),
(@test_user_id, 4, 3);

-- Interés por entornos (3 = Natural, 4 = Montañoso)
INSERT IGNORE INTO usuarios_entornos (usuario_id, entorno_id, peso) VALUES
(@test_user_id, 3, 5),
(@test_user_id, 4, 4);

-- =====================================================
-- 4. RECOMENDACIÓN POR GUSTOS (FILTRADO DE CONTENIDO)
-- =====================================================
SELECT '========================================' AS '';
SELECT 'RECOMENDACIÓN POR GUSTOS (TOP 10 DESTINOS)' AS '';

SELECT 
    d.id,
    d.nombre,
    d.categoria_id,
    d.rating_promedio,
    d.accesibilidad,
    -- Score total
    (CASE WHEN d.accesibilidad = (SELECT accesibilidad_requerida FROM preferencias_usuario WHERE usuario_id = @test_user_id) 
                AND (SELECT accesibilidad_requerida FROM preferencias_usuario WHERE usuario_id = @test_user_id) = 1 
           THEN 5 ELSE 0 END) 
    + COALESCE((SELECT SUM(uc.peso) FROM usuarios_categorias uc WHERE uc.usuario_id = @test_user_id AND uc.categoria_id = d.categoria_id), 0)
    + COALESCE((SELECT SUM(ue.peso) 
                FROM usuarios_etiquetas ue 
                JOIN destinos_etiquetas de ON ue.etiqueta_id = de.etiqueta_id 
                WHERE ue.usuario_id = @test_user_id AND de.destino_id = d.id), 0)
    + COALESCE((SELECT SUM(ut.peso) 
                FROM usuarios_tipos_viajero ut 
                JOIN destinos_tipos_viajero dt ON ut.tipo_viajero_id = dt.tipo_viajero_id 
                WHERE ut.usuario_id = @test_user_id AND dt.destino_id = d.id), 0)
    + COALESCE((SELECT SUM(uen.peso) 
                FROM usuarios_entornos uen 
                WHERE uen.usuario_id = @test_user_id AND uen.entorno_id = d.entorno_id), 0) AS score_total
FROM destinos d
WHERE d.estado = 1
ORDER BY score_total DESC, d.rating_promedio DESC
LIMIT 10;

-- =====================================================
-- 5. RECOMENDACIÓN POR UBICACIÓN (DESTINOS CERCA DE NEIVA)
-- =====================================================
SELECT '========================================' AS '';
SELECT 'RECOMENDACIÓN POR UBICACIÓN (CERCA DE NEIVA, RADIO 10 KM)' AS '';

SET @user_lat = 2.9304;
SET @user_lon = -75.2816;
SET @radio_km = 10;

SELECT 
    d.id,
    d.nombre,
    d.latitud,
    d.longitud,
    ROUND(6371 * ACOS(
        COS(RADIANS(@user_lat)) * COS(RADIANS(d.latitud)) *
        COS(RADIANS(d.longitud) - RADIANS(@user_lon)) +
        SIN(RADIANS(@user_lat)) * SIN(RADIANS(d.latitud))
    ), 2) AS distancia_km,
    d.rating_promedio,
    d.categoria_id
FROM destinos d
WHERE d.estado = 1
HAVING distancia_km <= @radio_km
ORDER BY distancia_km ASC, d.rating_promedio DESC
LIMIT 10;

-- =====================================================
-- 6. RECOMENDACIÓN COMBINADA (GUSTOS + UBICACIÓN)
-- =====================================================
SELECT '========================================' AS '';
SELECT 'RECOMENDACIÓN COMBINADA (CERCA DE NEIVA + GUSTOS)' AS '';

SET @user_lat = 2.9304;
SET @user_lon = -75.2816;
SET @radio_km = 10;

SELECT 
    d.id,
    d.nombre,
    d.latitud,
    d.longitud,
    ROUND(6371 * ACOS(
        COS(RADIANS(@user_lat)) * COS(RADIANS(d.latitud)) *
        COS(RADIANS(d.longitud) - RADIANS(@user_lon)) +
        SIN(RADIANS(@user_lat)) * SIN(RADIANS(d.latitud))
    ), 2) AS distancia_km,
    d.rating_promedio,
    (CASE WHEN d.accesibilidad = (SELECT accesibilidad_requerida FROM preferencias_usuario WHERE usuario_id = @test_user_id) 
                AND (SELECT accesibilidad_requerida FROM preferencias_usuario WHERE usuario_id = @test_user_id) = 1 
           THEN 5 ELSE 0 END) 
    + COALESCE((SELECT SUM(uc.peso) FROM usuarios_categorias uc WHERE uc.usuario_id = @test_user_id AND uc.categoria_id = d.categoria_id), 0)
    + COALESCE((SELECT SUM(ue.peso) 
                FROM usuarios_etiquetas ue 
                JOIN destinos_etiquetas de ON ue.etiqueta_id = de.etiqueta_id 
                WHERE ue.usuario_id = @test_user_id AND de.destino_id = d.id), 0)
    + COALESCE((SELECT SUM(ut.peso) 
                FROM usuarios_tipos_viajero ut 
                JOIN destinos_tipos_viajero dt ON ut.tipo_viajero_id = dt.tipo_viajero_id 
                WHERE ut.usuario_id = @test_user_id AND dt.destino_id = d.id), 0)
    + COALESCE((SELECT SUM(uen.peso) 
                FROM usuarios_entornos uen 
                WHERE uen.usuario_id = @test_user_id AND uen.entorno_id = d.entorno_id), 0) AS score_gustos
FROM destinos d
WHERE d.estado = 1
HAVING distancia_km <= @radio_km
ORDER BY score_gustos DESC, distancia_km ASC, d.rating_promedio DESC
LIMIT 10;

-- =====================================================
-- 7. LIMPIEZA OPCIONAL (borrar usuario de prueba)
-- =====================================================
-- Si quieres eliminar el usuario de prueba después de validar, descomenta las siguientes líneas:
/*
DELETE FROM usuarios_entornos WHERE usuario_id = @test_user_id;
DELETE FROM usuarios_tipos_viajero WHERE usuario_id = @test_user_id;
DELETE FROM usuarios_etiquetas WHERE usuario_id = @test_user_id;
DELETE FROM usuarios_categorias WHERE usuario_id = @test_user_id;
DELETE FROM preferencias_usuario WHERE usuario_id = @test_user_id;
DELETE FROM usuarios WHERE id = @test_user_id;
SELECT 'Usuario de prueba eliminado correctamente' AS '';
*/

SELECT '========================================' AS '';
SELECT 'VALIDACIÓN COMPLETADA. REVISA LOS RESULTADOS DE LAS CONSULTAS.' AS '';