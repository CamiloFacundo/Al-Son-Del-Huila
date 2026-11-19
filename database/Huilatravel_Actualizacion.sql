-- =====================================================
-- ACTUALIZACIÓN DE DESTINOS — FUENTE: huilatravel.com
-- =====================================================
-- Origen: https://www.huilatravel.com/inicio/  (extraído 2026-11-13)
--
-- Contenido:
--   1) INSERT  → Cueva de los Guácharos (no existía en la BD)
--   2) UPDATE  → San Agustín, Tatacoa y Rivera: copy + imagen
--
-- Fuentes complementarias (huilatravel NO publica estos datos):
--   · Coordenadas y trazado del parque → OpenStreetMap, relación
--     4844755 "Guacharos Cave National Natural Park" (centroid
--     1.5915455, -76.1161815 dentro de Acevedo, Huila)
--   · Horario, ruta de acceso y datos del parque →
--     parquesnacionales.gov.co (fuente oficial)
--
-- Imágenes:
--   · Copiadas desde frontend/src/assets/images/ a
--     backend/public/images/Destinos/ (convención ya existente
--     en el proyecto, ver backend/public/images/Destinos/Mohan.JPG)
--   · Se guardan como URL completa vía CONCAT(@base_url, ...),
--     igual que PublicacionController hace con publicaciones.
--
-- Ejecutar con: mysql -u <usuario> -p < database/Huilatravel_Actualizacion.sql
-- =====================================================

USE al_son_del_huila;

-- Base de la URL del backend. Coincide con APP_URL de backend/.env.
-- Si cambias de entorno, modifica SOLO esta línea.
SET @base_url = 'http://localhost:8000';

-- =====================================================
-- 1. NUEVO DESTINO: CUEVA DE LOS GUÁCHAROS
-- =====================================================
-- Categoría 1 = Naturaleza | Municipio 1 = Acevedo | Entorno 4 = Montañoso
-- Municipio: OSM ubica el parque, la localidad "Cueva De Los Guacharos"
-- y la Escuela La Mensura (inicio del sendero) en Acevedo.
-- La puerta turística de acceso es Palestina (Pitalito → Palestina →
-- La Mensura → Cascajosa → Los Cedros); queda registrado en `direccion`.
INSERT INTO destinos
  (nombre, descripcion, imagen, latitud, longitud,
   categoria_id, municipio_id, entorno_id, direccion, horario)
VALUES
(
  'Cueva de los Guácharos',
  'Primera área protegida de Colombia, declarada el 9 de noviembre de 1960. Bosques andinos y subandinos en buen estado de conservación y una de las colonias de guácharo más grandes y accesibles del mundo. Espeleísmo, senderismo y observación de aves.',
  NULL,
  1.5915, -76.1162,
  1, 1, 4,
  'Acceso: Pitalito - Palestina - Vereda La Mensura - Quebrada La Cascajosa - Sector Los Cedros, Huila',
  'Ingreso 8:00 am - 2:00 pm. Senderos 8:00 am y 3:00 pm'
);

-- =====================================================
-- 2. ACTUALIZAR LOS 3 DESTINOS QUE YA EXISTÍAN
-- =====================================================
-- Descripción: se antepone el copy de huilatravel a la descripción
-- original, para no perder los datos factuales (Patrimonio UNESCO,
-- temperatura de las aguas, etc.).
--
-- ¿Prefieres reemplazar del todo?  Cambia el valor de `descripcion`
-- por el texto de la columna "Copy huilatravel" de este comentario:
--
--   San Agustín → 'Arqueología, paisaje y legado ancestral.'
--   Tatacoa     → 'Horizontes rojizos y noches bajo las estrellas.'
--   Rivera      → 'Termales, agua y descanso en el paisaje huilense.'
-- =====================================================

-- 2.1 San Agustín  (copy huilatravel: "Arqueología, paisaje y legado ancestral.")
UPDATE destinos
SET descripcion = 'Arqueología, paisaje y legado ancestral. Patrimonio de la Humanidad, con esculturas y tumbas prehispánicas de culturas milenarias.',
    imagen      = CONCAT(@base_url, '/images/Destinos/san-agustin.jpg')
WHERE nombre = 'Parque Arqueológico de San Agustín';

-- 2.2 Desierto de la Tatacoa  (copy huilatravel: "Horizontes rojizos y noches bajo las estrellas.")
UPDATE destinos
SET descripcion = 'Horizontes rojizos y noches bajo las estrellas. Segunda zona árida más extensa de Colombia, bosque seco tropical, destino Starlight UNESCO.',
    imagen      = CONCAT(@base_url, '/images/Destinos/tatacoa.jpg')
WHERE nombre = 'Desierto de la Tatacoa (Sector El Cardón, El Cuzco, Los Hoyos)';

-- 2.3 Rivera y Betania  (copy huilatravel: "Termales, agua y descanso en el paisaje huilense.")
-- ⚠️  AVISO: en huilatravel.com "Rivera y Betania" es una tarjeta
-- compuesta que cubre DOS atractivos (termales de Rivera + embalse de
-- Betania). En tu BD no existe una fila única con ese nombre, así que
-- se aplica al atractivo insignia de Rivera.
-- Si prefieres otra fila, solo cambia el valor de `WHERE nombre = ...`
-- (alternativas: 'Embalse de Betania', 'Embalse y Represa de Betania').
UPDATE destinos
SET descripcion = 'Termales, agua y descanso en el paisaje huilense. Reconocido centro termal con aguas que brotan a 70°C. Piscina termal, restaurante, bar. Propiedades medicinales.',
    imagen      = CONCAT(@base_url, '/images/Destinos/rivera.jpg')
WHERE nombre = 'Termales Tierra de Promisión';

-- =====================================================
-- 3. VERIFICACIÓN
-- =====================================================
SELECT id, nombre, categoria_id, municipio_id, entorno_id, imagen
FROM destinos
WHERE nombre IN (
  'Cueva de los Guácharos',
  'Parque Arqueológico de San Agustín',
  'Desierto de la Tatacoa (Sector El Cardón, El Cuzco, Los Hoyos)',
  'Termales Tierra de Promisión'
)
ORDER BY id;

-- =====================================================
-- 4. OPCIONAL (comentado): destinos sin imagen que ya tienen
--    un archivo en public/images/Destinos/ pero no se usan.
--    Descomenta solo si quieres activarlo.
-- =====================================================
-- UPDATE destinos
-- SET imagen = CONCAT(@base_url, '/images/Destinos/Mohan.JPG')
-- WHERE nombre = 'Parque Isla del Mohán';
