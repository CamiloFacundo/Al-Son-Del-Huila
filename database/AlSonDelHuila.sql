-- =====================================================
-- BASE DE DATOS: AL SON DEL HUILA 
-- =====================================================
DROP DATABASE IF EXISTS al_son_del_huila;
CREATE DATABASE al_son_del_huila CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE al_son_del_huila;

-- =====================================================
-- 1. TABLAS BASE
-- =====================================================
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE municipios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE entornos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE tipos_viajero (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE etiquetas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

-- =====================================================
-- 2. USUARIOS
-- =====================================================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('turista','admin') DEFAULT 'turista',
    bio VARCHAR(255),
    ubicacion_texto VARCHAR(100),
    foto VARCHAR(255),
    foto_portada VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    email_verificado BOOLEAN DEFAULT FALSE,
    ultimo_acceso DATETIME,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE preferencias_usuario (
    usuario_id INT PRIMARY KEY,
    accesibilidad_requerida BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Intereses del usuario
CREATE TABLE usuarios_categorias (
    usuario_id INT NOT NULL,
    categoria_id INT NOT NULL,
    peso TINYINT DEFAULT 3 CHECK (peso BETWEEN 1 AND 5),
    PRIMARY KEY (usuario_id, categoria_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
);

CREATE TABLE usuarios_tipos_viajero (
    usuario_id INT NOT NULL,
    tipo_viajero_id INT NOT NULL,
    peso TINYINT DEFAULT 3 CHECK (peso BETWEEN 1 AND 5),
    PRIMARY KEY (usuario_id, tipo_viajero_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (tipo_viajero_id) REFERENCES tipos_viajero(id) ON DELETE CASCADE
);

CREATE TABLE usuarios_etiquetas (
    usuario_id INT NOT NULL,
    etiqueta_id INT NOT NULL,
    peso TINYINT DEFAULT 3 CHECK (peso BETWEEN 1 AND 5),
    PRIMARY KEY (usuario_id, etiqueta_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (etiqueta_id) REFERENCES etiquetas(id) ON DELETE CASCADE
);

CREATE TABLE usuarios_entornos (
    usuario_id INT NOT NULL,
    entorno_id INT NOT NULL,
    peso TINYINT DEFAULT 3 CHECK (peso BETWEEN 1 AND 5),
    PRIMARY KEY (usuario_id, entorno_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (entorno_id) REFERENCES entornos(id) ON DELETE CASCADE
);

-- =====================================================
-- 3. DESTINOS (con latitud y longitud separadas)
-- =====================================================
CREATE TABLE destinos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    imagen VARCHAR(255),
    latitud DECIMAL(10,8) NOT NULL,
    longitud DECIMAL(11,8) NOT NULL,
    categoria_id INT NOT NULL,
    municipio_id INT NOT NULL,
    entorno_id INT,
    direccion VARCHAR(255),
    horario VARCHAR(100),
    accesibilidad BOOLEAN NOT NULL DEFAULT FALSE,
    rating_promedio DECIMAL(3,2) DEFAULT 0.00,
    total_reseñas INT DEFAULT 0,
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (municipio_id) REFERENCES municipios(id),
    FOREIGN KEY (entorno_id) REFERENCES entornos(id),
    INDEX idx_lat_lon (latitud, longitud),
    INDEX idx_categoria (categoria_id),
    INDEX idx_municipio (municipio_id),
    INDEX idx_accesibilidad (accesibilidad)
);

-- Tablas puente (opcionales, por si quieres múltiples categorías, etc.)
CREATE TABLE destinos_categorias (
    destino_id INT NOT NULL,
    categoria_id INT NOT NULL,
    PRIMARY KEY (destino_id, categoria_id),
    FOREIGN KEY (destino_id) REFERENCES destinos(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
);

CREATE TABLE destinos_entornos (
    destino_id INT NOT NULL,
    entorno_id INT NOT NULL,
    PRIMARY KEY (destino_id, entorno_id),
    FOREIGN KEY (destino_id) REFERENCES destinos(id) ON DELETE CASCADE,
    FOREIGN KEY (entorno_id) REFERENCES entornos(id) ON DELETE CASCADE
);

CREATE TABLE destinos_tipos_viajero (
    destino_id INT NOT NULL,
    tipo_viajero_id INT NOT NULL,
    PRIMARY KEY (destino_id, tipo_viajero_id),
    FOREIGN KEY (destino_id) REFERENCES destinos(id) ON DELETE CASCADE,
    FOREIGN KEY (tipo_viajero_id) REFERENCES tipos_viajero(id) ON DELETE CASCADE
);

CREATE TABLE destinos_etiquetas (
    destino_id INT NOT NULL,
    etiqueta_id INT NOT NULL,
    PRIMARY KEY (destino_id, etiqueta_id),
    FOREIGN KEY (destino_id) REFERENCES destinos(id) ON DELETE CASCADE,
    FOREIGN KEY (etiqueta_id) REFERENCES etiquetas(id) ON DELETE CASCADE
);

CREATE TABLE imagenes_destino (
    id INT AUTO_INCREMENT PRIMARY KEY,
    destino_id INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    tipo ENUM('principal','secundaria') DEFAULT 'secundaria',
    FOREIGN KEY (destino_id) REFERENCES destinos(id) ON DELETE CASCADE
);

-- =====================================================
-- 4. RESEÑAS
-- =====================================================
CREATE TABLE reseñas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    destino_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comentario TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (destino_id) REFERENCES destinos(id) ON DELETE CASCADE,
    UNIQUE KEY uq_usuario_destino (usuario_id, destino_id)
);

DELIMITER $$
CREATE TRIGGER after_reseña_insert_update
AFTER INSERT ON reseñas
FOR EACH ROW
BEGIN
    UPDATE destinos d
    SET 
        total_reseñas = (SELECT COUNT(*) FROM reseñas WHERE destino_id = NEW.destino_id),
        rating_promedio = (SELECT AVG(rating) FROM reseñas WHERE destino_id = NEW.destino_id)
    WHERE d.id = NEW.destino_id;
END$$

CREATE TRIGGER after_reseña_delete
AFTER DELETE ON reseñas
FOR EACH ROW
BEGIN
    UPDATE destinos d
    SET 
        total_reseñas = (SELECT COUNT(*) FROM reseñas WHERE destino_id = OLD.destino_id),
        rating_promedio = (SELECT AVG(rating) FROM reseñas WHERE destino_id = OLD.destino_id)
    WHERE d.id = OLD.destino_id;
END$$
DELIMITER ;

-- =====================================================
-- 5. ACTIVIDADES, COMENTARIOS, LIKES, FAVORITOS
-- =====================================================
CREATE TABLE actividades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    destino_id INT NOT NULL,
    usuario_id INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    imagen VARCHAR(255),
    calificacion TINYINT CHECK (calificacion BETWEEN 1 AND 5),
    total_likes INT DEFAULT 0,
    total_vistas INT DEFAULT 0,
    publicado BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_edicion DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (destino_id) REFERENCES destinos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_destino (destino_id),
    INDEX idx_usuario (usuario_id)
);

CREATE TABLE comentarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    actividad_id INT NOT NULL,
    usuario_id INT NOT NULL,
    comentario_padre_id INT DEFAULT NULL,
    texto TEXT NOT NULL,
    total_likes INT DEFAULT 0,
    editado BOOLEAN DEFAULT FALSE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (comentario_padre_id) REFERENCES comentarios(id) ON DELETE CASCADE
);

CREATE TABLE actividad_likes (
    usuario_id INT NOT NULL,
    actividad_id INT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, actividad_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE CASCADE
);

CREATE TABLE comentario_likes (
    usuario_id INT NOT NULL,
    comentario_id INT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, comentario_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (comentario_id) REFERENCES comentarios(id) ON DELETE CASCADE
);

CREATE TABLE favoritos (
    usuario_id INT NOT NULL,
    destino_id INT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, destino_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (destino_id) REFERENCES destinos(id) ON DELETE CASCADE
);