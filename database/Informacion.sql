-- =====================================================
-- DATOS BÁSICOS PARA AL SON DEL HUILA (CORREGIDO)
-- =====================================================
USE al_son_del_huila;

-- Categorías
INSERT INTO categorias (nombre) VALUES
('Naturaleza'),
('Cultural'),
('Arqueológico'),
('Aventura'),
('Gastronómico'),
('Religioso'),
('Histórico'),
('Astronómico'),
('Eventos y festivales'),
('Bienestar y descanso');

-- Entornos
INSERT INTO entornos (nombre) VALUES
('Rural'),
('Urbano'),
('Natural'),
('Montañoso'),
('Desierto'),
('Río'),
('Cascadas');

-- Etiquetas
INSERT INTO etiquetas (nombre) VALUES
('Parejas'),
('Familia'),
('Caminatas'),
('Fotografía'),
('Historia'),
('Tranquilo'),
('Extremo');

-- Municipios
INSERT INTO municipios (nombre) VALUES
('Acevedo'),
('Aipe'),
('Algeciras'),
('Altamira'),
('Baraya'),
('Campoalegre'),
('Colombia'),
('Elías'),
('El Agrado'),
('Garzón'),
('Gigante'),
('Guadalupe'),
('Hobo'),
('Íquira'),
('Isnos'),
('La Argentina'),
('La Plata'),
('Nátaga'),
('Neiva'),
('Oporapa'),
('Paicol'),
('Palermo'),
('Palestina'),
('Pital'),
('Pitalito'),
('Rivera'),
('Saladoblanco'),
('Santa María'),
('San Agustín'),
('Suaza'),
('Tarqui'),
('Tello'),
('Teruel'),
('Tesalia'),
('Timaná'),
('Villavieja'),
('Yaguará');

-- Tipos de viajero (importante: el nombre de la tabla es 'tipos_viajero', no 'tipo_viajero')
INSERT INTO tipos_viajero (nombre) VALUES
('Familiar'),
('Parejas'),
('Amigos'),
('Viaje solo'),
('Niños'),
('Adultos mayores');

