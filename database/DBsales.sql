CREATE DATABASE al_son_del_huila;
USE al_son_del_huila;

-- TABLAS PRINCIPALES

CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE municipios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE entornos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE tipos_viajero (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE etiquetas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE destinos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    imagen VARCHAR(255),
    latitud DECIMAL(10,8),
    longitud DECIMAL(11,8),
    categoria_id INT,
    municipio_id INT,
    entorno_id INT,
    estado BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (municipio_id) REFERENCES municipios(id),
    FOREIGN KEY (entorno_id) REFERENCES entornos(id)
);

-- TABLAS RELACIONALES

CREATE TABLE usuario_preferencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    categoria_id INT,
    tipo_viajero_id INT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (tipo_viajero_id) REFERENCES tipos_viajero(id)
);

CREATE TABLE destino_tipo_viajero (
    id INT AUTO_INCREMENT PRIMARY KEY,
    destino_id INT,
    tipo_viajero_id INT,
    FOREIGN KEY (destino_id) REFERENCES destinos(id),
    FOREIGN KEY (tipo_viajero_id) REFERENCES tipos_viajero(id)
);

CREATE TABLE destino_etiquetas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    destino_id INT,
    etiqueta_id INT,
    FOREIGN KEY (destino_id) REFERENCES destinos(id),
    FOREIGN KEY (etiqueta_id) REFERENCES etiquetas(id)
);