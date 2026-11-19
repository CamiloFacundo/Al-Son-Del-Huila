-- =====================================================
-- REVERSIÓN de Huilatravel_Actualizacion.sql
-- =====================================================
-- Deshace los cambios aplicados sobre la BD viva.
-- Respeta la fecha de creación original de cada fila.
--
-- Ejecutar con: mysql -u <usuario> -p < database/Huilatravel_Rollback.sql
-- =====================================================

USE al_son_del_huila;

-- 1) Restaurar descripciones originales y vaciar imagen
UPDATE destinos
SET descripcion = 'Patrimonio de la Humanidad, con esculturas y tumbas prehispánicas de culturas milenarias.',
    imagen      = NULL
WHERE id = 180;   -- Parque Arqueológico de San Agustín

UPDATE destinos
SET descripcion = 'Segunda zona árida más extensa de Colombia, bosque seco tropical, destino Starlight UNESCO.',
    imagen      = NULL
WHERE id = 111;   -- Desierto de la Tatacoa (Sector El Cardón, El Cuzco, Los Hoyos)

UPDATE destinos
SET descripcion = 'Reconocido centro termal con aguas que brotan a 70°C. Piscina termal, restaurante, bar. Propiedades medicinales.',
    imagen      = NULL
WHERE id = 22;    -- Termales Tierra de Promisión

-- 2) Eliminar el destino agregado
DELETE FROM destinos WHERE nombre = 'Cueva de los Guácharos';

-- 3) Verificación
SELECT id, nombre, LEFT(descripcion, 50) AS desc_corta, IFNULL(imagen, 'NULL') AS imagen
FROM destinos
WHERE id IN (22, 111, 180) OR nombre = 'Cueva de los Guácharos'
ORDER BY id;
