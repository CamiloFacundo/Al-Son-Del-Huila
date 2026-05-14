-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: al_son_del_huila
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `actividad_likes`
--

DROP TABLE IF EXISTS `actividad_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `actividad_likes` (
  `usuario_id` int(11) NOT NULL,
  `actividad_id` int(11) NOT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`usuario_id`,`actividad_id`),
  KEY `actividad_id` (`actividad_id`),
  CONSTRAINT `actividad_likes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `actividad_likes_ibfk_2` FOREIGN KEY (`actividad_id`) REFERENCES `actividades` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actividad_likes`
--

LOCK TABLES `actividad_likes` WRITE;
/*!40000 ALTER TABLE `actividad_likes` DISABLE KEYS */;
/*!40000 ALTER TABLE `actividad_likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `actividades`
--

DROP TABLE IF EXISTS `actividades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `actividades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `destino_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `calificacion` tinyint(4) DEFAULT NULL CHECK (`calificacion` between 1 and 5),
  `total_likes` int(11) DEFAULT 0,
  `total_vistas` int(11) DEFAULT 0,
  `publicado` tinyint(1) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_edicion` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_destino` (`destino_id`),
  KEY `idx_usuario` (`usuario_id`),
  CONSTRAINT `actividades_ibfk_1` FOREIGN KEY (`destino_id`) REFERENCES `destinos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `actividades_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actividades`
--

LOCK TABLES `actividades` WRITE;
/*!40000 ALTER TABLE `actividades` DISABLE KEYS */;
/*!40000 ALTER TABLE `actividades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categorias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (3,'Arqueológico'),(8,'Astronómico'),(4,'Aventura'),(10,'Bienestar y descanso'),(2,'Cultural'),(9,'Eventos y festivales'),(5,'Gastronómico'),(7,'Histórico'),(1,'Naturaleza'),(6,'Religioso');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comentario_likes`
--

DROP TABLE IF EXISTS `comentario_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comentario_likes` (
  `usuario_id` int(11) NOT NULL,
  `comentario_id` int(11) NOT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`usuario_id`,`comentario_id`),
  KEY `comentario_id` (`comentario_id`),
  CONSTRAINT `comentario_likes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comentario_likes_ibfk_2` FOREIGN KEY (`comentario_id`) REFERENCES `comentarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comentario_likes`
--

LOCK TABLES `comentario_likes` WRITE;
/*!40000 ALTER TABLE `comentario_likes` DISABLE KEYS */;
/*!40000 ALTER TABLE `comentario_likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comentarios`
--

DROP TABLE IF EXISTS `comentarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comentarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `actividad_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `comentario_padre_id` int(11) DEFAULT NULL,
  `texto` text NOT NULL,
  `total_likes` int(11) DEFAULT 0,
  `editado` tinyint(1) DEFAULT 0,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `actividad_id` (`actividad_id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `comentario_padre_id` (`comentario_padre_id`),
  CONSTRAINT `comentarios_ibfk_1` FOREIGN KEY (`actividad_id`) REFERENCES `actividades` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comentarios_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comentarios_ibfk_3` FOREIGN KEY (`comentario_padre_id`) REFERENCES `comentarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comentarios`
--

LOCK TABLES `comentarios` WRITE;
/*!40000 ALTER TABLE `comentarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `comentarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `destino_etiquetas`
--

DROP TABLE IF EXISTS `destino_etiquetas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `destino_etiquetas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `destino_id` bigint(20) unsigned DEFAULT NULL,
  `etiqueta_id` bigint(20) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `destino_etiquetas`
--

LOCK TABLES `destino_etiquetas` WRITE;
/*!40000 ALTER TABLE `destino_etiquetas` DISABLE KEYS */;
INSERT INTO `destino_etiquetas` VALUES (1,NULL,NULL,1,1),(2,NULL,NULL,2,1),(3,NULL,NULL,3,2);
/*!40000 ALTER TABLE `destino_etiquetas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `destinos`
--

DROP TABLE IF EXISTS `destinos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `destinos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `latitud` decimal(10,8) NOT NULL,
  `longitud` decimal(11,8) NOT NULL,
  `categoria_id` int(11) NOT NULL,
  `municipio_id` int(11) NOT NULL,
  `entorno_id` int(11) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `horario` varchar(100) DEFAULT NULL,
  `accesibilidad` tinyint(1) NOT NULL DEFAULT 0,
  `rating_promedio` decimal(3,2) DEFAULT 0.00,
  `total_reseñas` int(11) DEFAULT 0,
  `estado` tinyint(1) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `entorno_id` (`entorno_id`),
  KEY `idx_lat_lon` (`latitud`,`longitud`),
  KEY `idx_categoria` (`categoria_id`),
  KEY `idx_municipio` (`municipio_id`),
  KEY `idx_accesibilidad` (`accesibilidad`),
  CONSTRAINT `destinos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  CONSTRAINT `destinos_ibfk_2` FOREIGN KEY (`municipio_id`) REFERENCES `municipios` (`id`),
  CONSTRAINT `destinos_ibfk_3` FOREIGN KEY (`entorno_id`) REFERENCES `entornos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=185 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `destinos`
--

LOCK TABLES `destinos` WRITE;
/*!40000 ALTER TABLE `destinos` DISABLE KEYS */;
INSERT INTO `destinos` VALUES (1,'Parque Isla del Mohán','Parque natural ubicado en una isla artificial sobre el río Magdalena, con más de 68 hectáreas de bosque seco tropical. Ofrece caminatas ecológicas, paseos en canoa, avistamiento de aves y deportes náuticos.',NULL,2.93500000,-75.29800000,1,19,6,'Av. Circunvalar con Calle 10, Neiva','Martes a domingo 8:00 am - 5:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(2,'Museo Arqueológico Regional del Huila','Espacio de reconocimiento a las culturas prehispánicas que habitaron el Huila entre 1.000 a.C. y 1.550 d.C. Alberga más de 300 piezas entre estatuaria, orfebrería, cerámica, petroglifos y artefactos líticos.',NULL,2.92760000,-75.28180000,3,19,2,'Calle 21 No. 5-81, Centro de Convenciones José Eustasio Rivera, piso 2, Neiva','Lunes a viernes 8:00 am - 12:00 m y 2:00 pm - 5:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(3,'Centro Cultural y de Convenciones José Eustasio Rivera','Complejo cultural construido en 1988 en honor al escritor huilense José Eustasio Rivera. Principal escenario cultural del departamento, con salas para eventos, conferencias, exposiciones de arte.',NULL,2.92760000,-75.28180000,2,19,2,'Carrera 5 No. 21-81, Neiva','Lunes a viernes 8:00 am - 12:00 m y 2:00 pm - 6:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(4,'Malecón Río Magdalena','Extenso corredor peatonal paralelo al río Magdalena, corazón turístico de Neiva. Cuenta con plazoletas de artesanos, comidas típicas, canoeros, recreovías y zonas de ciclovía.',NULL,2.93400000,-75.29600000,2,19,6,'Av. Circunvalar, orillas del río Magdalena, Neiva','Abierto las 24 horas',0,0.00,0,1,'2026-04-23 23:00:41'),(5,'Edificio Nacional de Neiva','Joya arquitectónica patrimonial de estilo republicano ubicada en el centro histórico de Neiva. Actualmente alberga entidades gubernamentales.',NULL,2.92700000,-75.28200000,7,19,2,'Carrera 5 con Calle 8, Centro, Neiva','Lunes a viernes 8:00 am - 5:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(6,'Monumento Cacica La Gaitana y Museo Prehistórico Huilassik Park','Monumento en honor a la cacica Timanco La Gaitana. El complejo incluye el Museo Prehistórico Huilassik Park con más de 57 figuras de animales prehistóricos.',NULL,2.92630000,-75.27600000,7,19,2,'Carrera 1 No. 2A-01, Neiva','Martes a domingo 8:00 am - 12:00 m y 2:00 pm - 6:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(7,'Monumento a la Raza','Escultura monumental que rinde homenaje a las raíces culturales del pueblo huilense, símbolo de la identidad mestiza de la región.',NULL,2.92600000,-75.28100000,7,19,2,'Centro, Neiva','Abierto las 24 horas',0,0.00,0,1,'2026-04-23 23:00:41'),(8,'Catedral de la Inmaculada Concepción','Principal iglesia católica de Neiva, construida en estilo gótico. Patrimonio histórico y cultural declarado.',NULL,2.92630000,-75.28910000,6,19,2,'Carrera 4 con Calle 7, Parque Santander, Neiva','Lunes a domingo 7:00 am - 7:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(9,'Iglesia Colonial San José','Templo colonial de gran valor arquitectónico e histórico. Parte del patrimonio religioso de la ciudad.',NULL,2.92550000,-75.28300000,6,19,2,'Centro histórico, Neiva','Lunes a domingo 7:00 am - 6:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(10,'Plaza Cívica Los Libertadores','Espacio público emblemático del centro de Neiva donde convergen la historia, el comercio y la vida ciudadana.',NULL,2.92680000,-75.28180000,2,19,2,'Centro, Neiva','Abierto las 24 horas',0,0.00,0,1,'2026-04-23 23:00:41'),(11,'Centro Comercial San Juan Plaza','Centro comercial con amplia oferta de tiendas, restaurantes, cine y entretenimiento.',NULL,2.93800000,-75.28400000,9,19,2,'Neiva, Huila','Lunes a domingo 10:00 am - 9:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(12,'Centro Comercial San Pedro Plaza','Centro comercial con variada oferta de tiendas de moda, gastronomía y servicios.',NULL,2.92900000,-75.27800000,9,19,2,'Neiva, Huila','Lunes a domingo 10:00 am - 9:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(13,'Centro Comercial Único Outlet Neiva','Centro comercial outlet con marcas nacionales e internacionales a precios especiales.',NULL,2.94100000,-75.28700000,9,19,2,'Neiva, Huila','Lunes a domingo 10:00 am - 9:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(14,'Centro Comercial Santalucía Plaza','Moderno centro comercial con amplia oferta de tiendas, restaurantes, zona de entretenimiento y cine.',NULL,2.93200000,-75.29000000,9,19,2,'Neiva, Huila','Lunes a domingo 10:00 am - 9:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(15,'Centro Recreacional Los Lagos - Comfamiliar','Centro recreacional de Comfamiliar Huila con piscinas, zonas verdes, canchas deportivas y espacios de esparcimiento familiar.',NULL,2.91800000,-75.27500000,10,19,3,'Neiva, Huila','Martes a domingo 9:00 am - 5:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(16,'Playa Juncal - Parque Acuático','El centro vacacional y parque acuático más grande del sur de Colombia, a 15 minutos de Neiva. Cuenta con piscina de olas, río lento, toboganes, cabañas.',NULL,2.87400000,-75.31200000,10,19,6,'Vía Neiva-Yaguará Km 15, Palermo, Huila','Viernes a domingo 10:00 am - 5:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(17,'Mirador Villarpe','Uno de los miradores más populares del Huila, en el corregimiento El Caguán. Vista panorámica de la ciudad y el valle del Magdalena.',NULL,2.98500000,-75.32000000,1,19,4,'Corregimiento El Caguán, Neiva','Jueves a domingo 10:00 am - 6:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(18,'Montaña Mágica El Chapurro','Mirador ecológico a 1.800 msnm que recrea la leyenda indígena Tama con una figura gigante de chapulín. Senderismo, camping, agroturismo.',NULL,2.99800000,-75.33500000,4,19,4,'Vereda El Chapurro, corregimiento El Caguán, Neiva','Fines de semana y festivos 8:00 am - 5:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(19,'Ecoparque Normandía','Destino de turismo rural y ecoturismo en los alrededores de Neiva. Contacto con la naturaleza, zonas verdes y actividades al aire libre.',NULL,2.95500000,-75.31000000,1,19,3,'Neiva, Huila','Fines de semana 9:00 am - 5:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(20,'Parque Principal El Caguán','Parque central del corregimiento El Caguán. Punto de encuentro comunitario con tradiciones culturales.',NULL,2.99000000,-75.33000000,2,19,1,'Corregimiento El Caguán, Neiva','Abierto las 24 horas',0,0.00,0,1,'2026-04-23 23:00:41'),(21,'Mirador El Barcino','Mirador con vista panorámica del valle de Neiva, restaurante de gastronomía típica, piscina y ambiente familiar.',NULL,2.99200000,-75.31800000,1,19,4,'Vía El Triunfo Sur, Neiva-Caguán, Caguán, Huila','Fines de semana y festivos 10:00 am - 7:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(22,'Termales Tierra de Promisión','Reconocido centro termal con aguas que brotan a 70°C. Piscina termal, restaurante, bar. Propiedades medicinales.',NULL,2.77400000,-75.24100000,10,26,3,'Municipio de Rivera, Huila','Todos los días 7:00 am - 11:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(23,'Termales San Francisco','Aguas termales con sales, bicarbonato y cloruros. Centro recreacional con senderos y bosque natural.',NULL,2.76200000,-75.22000000,10,26,3,'Vereda El Salado, Rivera, Huila','Todos los días 7:00 am - 6:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(24,'Termales Comfamiliar Rivera','Centro termal de Comfamiliar Huila cerca del casco urbano. Piscinas con aguas termales medicinales.',NULL,2.77600000,-75.23800000,10,26,2,'Casco urbano, Rivera, Huila','Consultar horarios',0,0.00,0,1,'2026-04-23 23:00:41'),(25,'Los Ángeles Termal','Pequeño paraíso termal con fuente a 43°C, tres zonas diferenciadas. Alojamiento, restaurante, bar.',NULL,2.76800000,-75.23500000,10,26,3,'Municipio de Rivera, Huila','Mañana 7:30-11:30, tarde 12-4, noche 5-10 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(26,'Mirador Celeste','Mirador con vistas panorámicas del valle del Magdalena y la cordillera Oriental.',NULL,2.79000000,-75.26000000,1,26,4,'Corredor turístico de Rivera, Huila','Fines de semana y festivos',0,0.00,0,1,'2026-04-23 23:00:41'),(27,'Balcón El Vino','Mirador con restaurante y bar. Degustación de vino artesanal, micheladas, plátanos y comidas rápidas.',NULL,2.81000000,-75.29000000,5,26,4,'Inspección La Ulloa, Rivera, Huila','Jueves a domingo y festivos',0,0.00,0,1,'2026-04-23 23:00:41'),(28,'Mirador del Vino','Uno de los miradores más grandes de Rivera. Vinos artesanales, micheladas, alojamiento, restaurante, piscinas naturales.',NULL,2.81200000,-75.29200000,1,26,4,'Sector La Ulloa, Rivera, Huila','Jueves a domingo 10:00 am - 8:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(29,'Mirador El Caracoly','Mirador turístico con vistas del valle del Magdalena y las cordilleras. Parte de la Ruta del Vino.',NULL,2.80500000,-75.28500000,1,26,4,'Corredor La Ulloa, Rivera, Huila','Fines de semana y festivos',0,0.00,0,1,'2026-04-23 23:00:41'),(30,'Mirador Arte y Vino','Mirador con restaurante que combina gastronomía, vinos artesanales y arte.',NULL,2.80800000,-75.28700000,5,26,4,'Corregimiento La Ulloa, Rivera, Huila','Jueves a domingo y festivos',0,0.00,0,1,'2026-04-23 23:00:41'),(31,'Balneario Finca Mis Potrillos','Finca recreacional a 15 minutos de Neiva. Piscina, zonas verdes, actividades de recreación y tours.',NULL,2.80900000,-75.29300000,10,26,3,'Inspección La Ulloa, Rivera, Huila','Fines de semana y festivos 9:00 am - 5:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(32,'Balneario Rancho Tama','Balneario de agua natural en un entorno campestre, ideal para un día de sol en familia.',NULL,2.78500000,-75.25000000,10,26,6,'Rivera, Huila','Fines de semana y festivos',0,0.00,0,1,'2026-04-23 23:00:41'),(33,'Balneario La Tienda Montañera','Balneario campestre con entorno montañoso y aguas naturales, complementado con tienda y gastronomía típica.',NULL,2.80000000,-75.27500000,10,26,3,'Corredor turístico Rivera-La Ulloa, Huila','Fines de semana y festivos',0,0.00,0,1,'2026-04-23 23:00:41'),(34,'Balneario Cuatro','Balneario natural de agua dulce en entorno rural.',NULL,2.78200000,-75.24500000,10,26,6,'Rivera, Huila','Fines de semana y festivos',0,0.00,0,1,'2026-04-23 23:00:41'),(35,'Finca de Recreo La Divina','Finca de recreo con piscina, hospedaje campestre, restaurante gourmet y típico, camping, zonas verdes.',NULL,2.80600000,-75.28800000,10,26,3,'Kilómetro 1.5 Vía Ulloa-Rivera, Rivera, Huila','Todos los días 9:00 am - 6:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(36,'Balneario La Honda','Balneario de aguas naturales en el sector de La Ulloa.',NULL,2.80200000,-75.28000000,10,26,6,'Rivera, Huila','Fines de semana y festivos',0,0.00,0,1,'2026-04-23 23:00:41'),(37,'Balneario Los Chorros','Balneario natural con piscina, hospedaje campestre, restaurante, zonas verdes y parque infantil.',NULL,2.81100000,-75.29600000,10,26,7,'Vía Caguán-La Ulloa, Rivera, Huila','Fines de semana y festivos 9:00 am - 5:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(38,'Balneario San Samana','Balneario de aguas naturales para disfrute familiar en entorno de naturaleza.',NULL,2.79000000,-75.25500000,10,26,6,'Rivera, Huila','Fines de semana y festivos',0,0.00,0,1,'2026-04-23 23:00:41'),(39,'Iglesia Nuestra Señora del Perpetuo Socorro','Principal templo católico de Rivera, símbolo religioso e histórico.',NULL,2.77450000,-75.24020000,6,26,2,'Centro, Rivera, Huila','Lunes a domingo 7:00 am - 7:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(40,'Casa de Campo La Cascada','Finca hotel campestre, punto de partida para el sendero hacia la Cascada Salto del Ángel. Gastronomía local y hospedaje.',NULL,2.76000000,-75.21500000,10,26,4,'Rivera, Huila — acceso desde casco urbano hacia termales','Reservas recomendadas',0,0.00,0,1,'2026-04-23 23:00:41'),(41,'Villa Stefany','Casa de campo y centro recreativo con hospedaje campestre y actividades al aire libre.',NULL,2.78000000,-75.24800000,10,26,3,'Rivera, Huila','Fines de semana y festivos',0,0.00,0,1,'2026-04-23 23:00:41'),(42,'Casa Campo El Cielo','Finca recreacional con vista panorámica del valle y las montañas.',NULL,2.79500000,-75.26500000,10,26,4,'Rivera, Huila','Fines de semana y festivos',0,0.00,0,1,'2026-04-23 23:00:41'),(43,'Casa Campo Los Kiosquitos','Centro recreativo con kioscos y zonas verdes para el esparcimiento familiar.',NULL,2.78700000,-75.25200000,10,26,3,'Rivera, Huila','Fines de semana y festivos',0,0.00,0,1,'2026-04-23 23:00:41'),(44,'Santuario Divino Niño Jesús','Santuario religioso reconocido como destino de devoción y turismo religioso.',NULL,2.77550000,-75.24150000,6,26,2,'Rivera, Huila','Lunes a domingo 7:00 am - 6:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(45,'Cascada Salto del Ángel','Espectacular cascada entre montañas, en las veredas Pedregal, Mesitas y Aguas Calientes. Ideal para ecoturismo.',NULL,2.75500000,-75.21000000,4,26,7,'Veredas Pedregal, Mesitas y Aguas Calientes, Rivera, Huila','Con guía. Reservas recomendadas',0,0.00,0,1,'2026-04-23 23:00:41'),(46,'Cascada La Bocana','Cascada de 15 metros en La Ulloa. Sendero de 6 km por cultivos de cacao y bosques de galería.',NULL,2.81500000,-75.30500000,4,26,7,'Corregimiento La Ulloa, Rivera, Huila','Se recomienda guía local',0,0.00,0,1,'2026-04-23 23:00:41'),(47,'Sitio Arqueológico El Tambillo','Tesoro arqueológico con más de 50 piedras talladas con petroglifos y tumbas prehispánicas.',NULL,2.74000000,-75.19500000,3,26,4,'Zona rural de Rivera, Huila','Con guía. Reservas recomendadas',0,0.00,0,1,'2026-04-23 23:00:41'),(48,'Ruta del Cacao','Sendero interpretativo por cultivos de cacao, combinando senderismo, avistamiento de aves y visita a fincas.',NULL,2.81000000,-75.30000000,1,26,1,'Corregimiento La Ulloa, Rivera, Huila','Con guía comunitario',0,0.00,0,1,'2026-04-23 23:00:41'),(49,'Parque Central José Eustasio Rivera','Parque principal del municipio, nombrado en honor al escritor José Eustasio Rivera, nacido aquí en 1888.',NULL,2.77480000,-75.24060000,7,26,2,'Centro, Rivera, Huila','Abierto las 24 horas',0,0.00,0,1,'2026-04-23 23:00:41'),(50,'Cascada El Santuario','Cascada en el sector de Las Termales, complementaria a la oferta termal.',NULL,2.75800000,-75.21800000,4,26,7,'Sector Las Termales, Rivera, Huila','Se recomienda guía',0,0.00,0,1,'2026-04-23 23:00:41'),(51,'Sendero Primaveral','Sendero ecológico que sale del casco urbano por la vía a termales, recorriendo quebradas, cultivos de café y caña panelera.',NULL,2.76800000,-75.22800000,4,26,4,'Sale del casco urbano hacia vía termales, veredas Llanitos','Se recomienda guía',0,0.00,0,1,'2026-04-23 23:00:41'),(52,'Balneario La Mesa de Hernández','Balneario sobre el río Baché, en un amplio terreno en forma de mesa. Ideal para recreación familiar.',NULL,2.91200000,-75.39800000,10,22,6,'Kilómetro 9 Vía Palermo - Santa María, Palermo, Huila','Fines de semana y festivos',0,0.00,0,1,'2026-04-23 23:00:41'),(53,'Balneario El Pailón','Charco natural sobre el río Baché, espacioso para recreación y descanso.',NULL,2.90800000,-75.40200000,10,22,6,'4 km del casco urbano vía Santa María, Palermo, Huila','Fines de semana y festivos',0,0.00,0,1,'2026-04-23 23:00:41'),(54,'Malecón de Palermo','Parque turístico de espacio público a orillas del río Magdalena, con senderos para disfrutar de la brisa del río.',NULL,2.89600000,-75.42500000,2,22,6,'Orillas del río Magdalena, Palermo, Huila','Abierto las 24 horas',0,0.00,0,1,'2026-04-23 23:00:41'),(55,'Cañón de los Ídolos','Formación natural del río Tune que esculpe una profunda piscina sobre rocas erosionadas.',NULL,2.87500000,-75.45000000,1,22,6,'Río Tune, zona rural de Palermo, Huila','Se recomienda guía local',0,0.00,0,1,'2026-04-23 23:00:41'),(56,'Cascada de Palermo','Cascada natural en la zona montañosa, rodeada de vegetación tropical.',NULL,2.87000000,-75.47000000,4,22,7,'Zona montañosa de Palermo, Huila','Se recomienda guía',0,0.00,0,1,'2026-04-23 23:00:41'),(57,'Parque Principal de Palermo','Corazón cívico e histórico con dos templos: uno colonial en piedra y uno en uso activo.',NULL,2.89290000,-75.43580000,7,22,2,'Centro, Palermo, Huila','Abierto las 24 horas',0,0.00,0,1,'2026-04-23 23:00:41'),(58,'Kalapa Mirador','Mirador nocturno ideal para observar estrellas y atardeceres, con vistas del valle del Magdalena.',NULL,2.90500000,-75.44500000,1,22,4,'Palermo, Huila','Fines de semana y festivos',0,0.00,0,1,'2026-04-23 23:00:41'),(59,'Templo Colonial de Palermo','Construcción en piedra tallada del siglo XVIII, declarado Patrimonio Arquitectónico del Huila.',NULL,2.89300000,-75.43550000,6,22,2,'Parque principal, Palermo, Huila','Lunes a domingo 7:00 am - 6:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(60,'Huiláfrica Salvaje','Parque temático de agroturismo con zoocría de especies exóticas: búfalos, pirarucos, babillas, avestruces, chigüiros.',NULL,2.87800000,-75.41800000,1,22,1,'Kilómetro 1 Vía Neiva-Palermo, Palermo, Huila','Fines de semana y festivos 9:00 am - 5:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(61,'Centro Vacacional SpiritLand Ecopark','Centro vacacional temático con el Cristo más grande de Suramérica (80 m), cascadas, lago de pesca, tirolesas, replicas arqueológicas.',NULL,2.88100000,-75.42000000,4,22,3,'Vereda El Juncal Km 13, vía Huiláfrica Salvaje, Palermo, Huila','Todos los días 9:00 am - 5:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(62,'La Palermosa','Atractivo turístico y recreativo al aire libre, parte de la identidad cultural de Palermo.',NULL,2.89000000,-75.43200000,10,22,3,'Palermo, Huila','Fines de semana y festivos',0,0.00,0,1,'2026-04-23 23:00:41'),(63,'Camino Real de Buenos Aires','Tramo histórico del Camino Real colonial que unía Santafé con Popayán. Patrimonio histórico.',NULL,2.88800000,-75.44800000,7,22,1,'Sector Buenos Aires, Palermo, Huila','Acceso libre',0,0.00,0,1,'2026-04-23 23:00:41'),(64,'Charco del Boquerón y El Poira','Grandes charcos naturales sobre el río Baché. El Poira es un personaje mitológico guardián de charcos profundos.',NULL,2.88400000,-75.41000000,10,22,6,'Límite Palermo - Neiva, orillas del río Baché, Huila','Acceso libre',0,0.00,0,1,'2026-04-23 23:00:41'),(65,'Mirador El Refugio del Nómada','Mirador a 2.200 msnm con vistas de varios municipios, la Represa de Betania, el Nevado del Huila y el Cerro del Pacande.',NULL,2.64200000,-75.28000000,1,6,4,'Vereda El Roble, 18 km del casco urbano, Campoalegre, Huila','Fines de semana y festivos',0,0.00,0,1,'2026-04-23 23:00:41'),(66,'Parque Natural La Siberia','Ecosistema estratégico en la cordillera Oriental a 2.600 msnm, nacimiento de importantes afluentes hídricos.',NULL,2.62000000,-75.24000000,1,6,4,'Cordillera Oriental, zona rural de Campoalegre, Huila','Se recomienda guía local',0,0.00,0,1,'2026-04-23 23:00:41'),(67,'Embalse de Betania','Gigantesco embalse compartido entre Campoalegre, Hobo y Yaguará. Deportes náuticos, pesca deportiva, paseos en lancha.',NULL,2.66000000,-75.42000000,1,6,6,'Límites de Campoalegre, Hobo y Yaguará, Huila','Abierto todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(68,'Parque Museo del Arroz','Museo dedicado a la historia y producción del arroz, producto emblema de la \"Capital Arrocera del Huila\".',NULL,2.68500000,-75.33000000,2,6,1,'Hacienda Potosí, Campoalegre, Huila','Martes a domingo',0,0.00,0,1,'2026-04-23 23:00:41'),(69,'Cabaña Cleves','Cabaña campestre en el corredor turístico, ideal para descanso y disfrute del paisaje arrocero.',NULL,2.67500000,-75.31500000,10,6,1,'Campoalegre, Huila','Fines de semana y festivos',0,0.00,0,1,'2026-04-23 23:00:41'),(70,'Arena y Sol - Tinas de Agua Climatizadas','Centro recreativo con tinas de agua climatizada, ideal para relajación en familia o pareja.',NULL,2.69000000,-75.34000000,10,6,3,'Campoalegre, Huila','Fines de semana y festivos',0,0.00,0,1,'2026-04-23 23:00:41'),(71,'Capilla Santa Laura','Capilla religiosa parte del patrimonio religioso y cultural de Campoalegre.',NULL,2.68600000,-75.32600000,6,6,1,'Campoalegre, Huila','Lunes a domingo 7:00 am - 6:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(72,'San Antonio (Campoalegre)','Sitio turístico y recreativo en entorno campestre arrocero.',NULL,2.67800000,-75.31800000,10,6,1,'Campoalegre, Huila','Fines de semana y festivos',0,0.00,0,1,'2026-04-23 23:00:41'),(73,'La Granja de Pedro','Finca recreacional y agroecoturística para familias, contacto con producción agropecuaria.',NULL,2.68200000,-75.32200000,1,6,1,'Campoalegre, Huila','Fines de semana y festivos',0,0.00,0,1,'2026-04-23 23:00:41'),(74,'Los Potrillos (Campoalegre)','Centro recreativo campestre con espacios para disfrute familiar en la naturaleza.',NULL,2.69100000,-75.33500000,10,6,1,'Campoalegre, Huila','Fines de semana y festivos',0,0.00,0,1,'2026-04-23 23:00:41'),(75,'MonteCafé - Mirador','Mirador con vocación cafetera, vistas del valle arrocero y las montañas, experiencias de café.',NULL,2.66000000,-75.30000000,1,6,4,'Zona montañosa de Campoalegre, Huila','Fines de semana y festivos',0,0.00,0,1,'2026-04-23 23:00:41'),(76,'Casa Bohemia - Resort de Cerveza y Vino','Hotel campestre de 4 estrellas con viñedo propio, cerveza artesanal, spa de cerveza único en Colombia.',NULL,2.70500000,-75.34000000,5,6,4,'Km 22 Vía Neiva-Campoalegre, desvío Vereda Potosí, Campoalegre','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(77,'Parque Central Simón Bolívar','Corazón cívico del municipio \"Corazón del Huila\". Sede del Festival de San Juan y San Pedro.',NULL,2.55830000,-75.44890000,7,13,2,'Centro, Hobo, Huila','Abierto las 24 horas',0,0.00,0,1,'2026-04-23 23:00:41'),(78,'Charco Los Cristales','Cascada de aguas cristalinas a 3.5 km del casco urbano, ideal para barranquismo.',NULL,2.57000000,-75.43000000,4,13,7,'Vereda Agua Fría, Hobo, Huila','Se recomienda guía local',0,0.00,0,1,'2026-04-23 23:00:41'),(79,'Cascada El Poira','Cascada de 20 metros en el Parque Los Pinos, nombre del personaje mitológico guardián de ríos.',NULL,2.54500000,-75.41000000,4,13,7,'Zona montañosa, Hobo, Huila','Se recomienda guía',0,0.00,0,1,'2026-04-23 23:00:41'),(80,'Club Mediterráneo','Centro recreativo a orillas de la Represa de Betania con piscina, bar, camping y pesca deportiva.',NULL,2.55200000,-75.45800000,10,13,6,'1 km del casco urbano, vía Puerto Mómico, Hobo, Huila','Todos los días 8:00 am - 8:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(81,'Parroquia San Juan Bautista','Principal templo católico de Hobo, centro espiritual y punto de partida de las festividades patronales.',NULL,2.55850000,-75.44870000,6,13,2,'Centro, Hobo, Huila','Lunes a domingo 7:00 am - 7:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(82,'Parque Agroecoturístico Los Pinos','Refugio sustentable de 300 hectáreas con senderos ecológicos, glamping, cabañas, restaurante, apicultura, ruta del cacao.',NULL,2.53800000,-75.40500000,1,13,4,'Vereda Bajo Estoracal, Hobo, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(83,'Ruta de Senderismo en Hobo','Red de senderos por paisajes montañosos, cafetaleros y ribereños, con vistas del embalse de Betania.',NULL,2.55000000,-75.42000000,4,13,4,'Zona rural de Hobo, Huila','Se recomienda guía local',0,0.00,0,1,'2026-04-23 23:00:41'),(84,'Puerto Mómico','Puerto turístico a orillas del embalse de Betania, con paseos en lancha, pesca deportiva, piscina, camping.',NULL,2.54900000,-75.46200000,10,13,6,'1.5 km del casco urbano, Hobo, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(85,'Finca La Chamba','Finca recreacional municipal con piscina, bar y restaurante en entorno campestre.',NULL,2.55600000,-75.44200000,10,13,1,'Vereda Centro, Hobo, Huila','Fines de semana y festivos',0,0.00,0,1,'2026-04-23 23:00:41'),(86,'Cascada La Promesa','Cascada de 20 metros en zona montañosa, rodeada de bosques.',NULL,1.90500000,-75.79000000,4,7,7,'Zona rural, Colombia, Huila','Se recomienda guía local',0,0.00,0,1,'2026-04-23 23:00:41'),(87,'Cascada Las Tres Marías','Salto de agua en la vereda El Valle, con caídas consecutivas sobre la quebrada San Francisco.',NULL,1.93000000,-75.82000000,4,7,7,'Vereda El Valle, Colombia, Huila','Se recomienda guía local',0,0.00,0,1,'2026-04-23 23:00:41'),(88,'Bosque Sub Xerofítico de Colombia','Ecosistema singular de vegetación adaptada a baja humedad, bosque seco subandino.',NULL,1.91000000,-75.81000000,1,7,3,'Zona rural, Colombia, Huila','Acceso libre con precaución',0,0.00,0,1,'2026-04-23 23:00:41'),(89,'Laguna Tembladora','Laguna natural en zona montañosa, rodeada de paisajes andinos.',NULL,1.89000000,-75.78000000,1,7,4,'Zona montañosa, Colombia, Huila','Se recomienda guía local',0,0.00,0,1,'2026-04-23 23:00:41'),(90,'Museo Arqueológico de Santana','Museo con orfebrería, artefactos líticos, cerámica y estatuaria del Valle Alto del Río Cabrera.',NULL,1.95000000,-75.76000000,3,7,1,'Corregimiento de Santana, Colombia, Huila','Lunes a viernes 8:00 am - 5:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(91,'Parque Principal de Íquira','Corazón cívico e histórico de Íquira, \"La ciudad luz del Huila\". Fundado en 1694.',NULL,2.60970000,-75.57360000,7,14,2,'Centro, Íquira, Huila','Abierto las 24 horas',0,0.00,0,1,'2026-04-23 23:00:41'),(92,'Baños Termales de Íquira','Aguas termales con propiedades terapéuticas, en las estribaciones del Nevado del Huila.',NULL,2.60500000,-75.58000000,10,14,3,'Municipio de Íquira, Huila','Consultar horarios',0,0.00,0,1,'2026-04-23 23:00:41'),(93,'Reserva Forestal de Tarpeya','Reserva natural sede operativa del PNN Nevado del Huila, con senderos por bosque andino y subpáramo.',NULL,2.58000000,-75.62000000,1,14,4,'Vereda Juancho, 6 km del casco urbano, Íquira, Huila','Se recomienda guía y permiso del PNN',0,0.00,0,1,'2026-04-23 23:00:41'),(94,'Cuevas del Chaparro','Sistema de cuevas naturales para espeleología en la zona montañosa.',NULL,2.61500000,-75.59000000,4,14,4,'Zona rural, Íquira, Huila','Se recomienda guía local',0,0.00,0,1,'2026-04-23 23:00:41'),(95,'Loma de la Cruz','Mirador natural con vista panorámica del casco urbano, valles y montañas.',NULL,2.61200000,-75.57500000,1,14,4,'Íquira, Huila','Acceso libre',0,0.00,0,1,'2026-04-23 23:00:41'),(96,'La Morada del Viento','Mirador con vista al valle del río Baché y paisajes cafeteros. Emprendimiento local muy reconocido.',NULL,2.92000000,-75.54000000,1,28,4,'Santa María, Huila','Fines de semana y festivos',0,0.00,0,1,'2026-04-23 23:00:41'),(97,'Mirador El Taita del Huila','Mirador turístico con vistas panorámicas de las montañas del noroccidente del Huila.',NULL,2.91500000,-75.53500000,1,28,4,'Santa María, Huila','Fines de semana y festivos',0,0.00,0,1,'2026-04-23 23:00:41'),(98,'Portal del Sol','Restaurante y mirador con vista al paisaje cafetero del \"pueblo cafetero del Huila\".',NULL,2.92500000,-75.53000000,5,28,4,'Santa María, Huila','Martes a domingo',0,0.00,0,1,'2026-04-23 23:00:41'),(99,'Río Baché','Cañón natural del río Baché, apto para rafting y deportes de aventura acuática.',NULL,2.93000000,-75.52000000,4,28,6,'Vía Neiva - Santa María, Huila','Abierto todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(100,'Mirador Santa Teresa','Vereda con miradores que permiten contemplar el valle del Magdalena y municipios vecinos.',NULL,2.94000000,-75.54500000,1,28,4,'Vereda Santa Teresa, 12 km del casco urbano, Santa María, Huila','Acceso libre',0,0.00,0,1,'2026-04-23 23:00:41'),(101,'Finca La Constancia','Finca agroturística familiar convertida en reserva natural. Producción de café artesanal, pesca deportiva, restaurante, senderismo.',NULL,2.91000000,-75.52500000,1,28,1,'Santa María, Huila','Reservas recomendadas',0,0.00,0,1,'2026-04-23 23:00:41'),(102,'Quebrada El Aceite','Vertiente natural con charcos tipo piscina y fósiles en las rocas.',NULL,3.06000000,-75.12000000,1,32,6,'A pocos kilómetros del casco urbano, Tello, Huila','Se recomienda guía local',0,0.00,0,1,'2026-04-23 23:00:41'),(103,'Cerro Cucara','Cerro mítico asociado a leyendas indígenas, sitio de culto de los aborígenes.',NULL,3.05000000,-75.13500000,2,32,4,'Zona rural, Tello, Huila','Acceso libre',0,0.00,0,1,'2026-04-23 23:00:41'),(104,'Las Fumarolas de Tello','Fenómeno geológico único: colina que emite humo debido a combustión de rocas carboníferas.',NULL,3.07000000,-75.11000000,1,32,1,'Vereda El Tomo, Tello, Huila','Se recomienda guía',0,0.00,0,1,'2026-04-23 23:00:41'),(105,'Parque Principal de Tello','Corazón histórico de \"El Viñedo del Huila\", rodeado de casas coloridas. Cuna del Beato Gaspar Páez Perdomo.',NULL,3.05440000,-75.12890000,7,32,2,'Centro, Tello, Huila','Abierto las 24 horas',0,0.00,0,1,'2026-04-23 23:00:41'),(106,'Iglesia de Tello','Templo parroquial de estilo colonial, con torre inclinada por el terremoto de 1967.',NULL,3.05420000,-75.12850000,6,32,2,'Centro, Tello, Huila','Lunes a domingo 7:00 am - 7:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(107,'Cascada El Totí','Cascada natural rodeada de vegetación en el \"Paraíso Cafetero del Huila\".',NULL,2.72000000,-75.58000000,4,33,7,'Vereda El Totí, Teruel, Huila','Se recomienda guía local',0,0.00,0,1,'2026-04-23 23:00:41'),(108,'Río Pedernal','Río de aguas cristalinas que ofrece charcos naturales para baño y pesca.',NULL,2.74000000,-75.56500000,1,33,6,'Municipio de Teruel, Huila','Acceso libre',0,0.00,0,1,'2026-04-23 23:00:41'),(109,'Iglesia Parroquial Nuestra Señora de la Candelaria','Templo de estilo gótico con una sola torre en punta de lápiz, patrona del municipio.',NULL,2.73400000,-75.57560000,6,33,2,'Centro, Teruel, Huila','Lunes a domingo 7:00 am - 7:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(110,'Vereda El Almorzadero','Vereda con paisajes cafeteros y montañosos, representativa del agroturismo de Teruel.',NULL,2.71000000,-75.59000000,1,33,4,'Vereda El Almorzadero, Teruel, Huila','Acceso libre',0,0.00,0,1,'2026-04-23 23:00:41'),(111,'Desierto de la Tatacoa (Sector El Cardón, El Cuzco, Los Hoyos)','Segunda zona árida más extensa de Colombia, bosque seco tropical, destino Starlight UNESCO.',NULL,3.23000000,-75.17000000,1,36,5,'Desierto de la Tatacoa, Villavieja, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(112,'Capilla de Santa Bárbara','Capilla colonial más antigua del Huila (1606-1748), hoy alberga el Museo Paleontológico.',NULL,3.21890000,-75.21830000,7,36,2,'Carrera 3 No. 3-28, frente al parque central, Villavieja, Huila','Martes a domingo 8:00 am - 5:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(113,'Cementerio Pijao','Sitio arqueológico con vestigios de la cultura indígena Pijao.',NULL,3.21500000,-75.22000000,3,36,2,'Villavieja, Huila','Consultar horarios',0,0.00,0,1,'2026-04-23 23:00:41'),(114,'Estación del Ferrocarril de Villavieja','Histórica estación del ferrocarril, testigo de la época de auge del transporte férreo.',NULL,3.22000000,-75.21600000,7,36,2,'Villavieja, Huila','Consultar horarios',0,0.00,0,1,'2026-04-23 23:00:41'),(115,'Observatorio Astronómico de la Tatacoa - OATA','Primer observatorio astronómico del desierto, con más de 16 años de trayectoria. Charlas nocturnas.',NULL,3.24000000,-75.18000000,8,36,5,'Sector El Cuzco, Desierto de la Tatacoa, Villavieja, Huila','Lunes a domingo 6:00 pm - 10:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(116,'Observatorio Astronómico Astrosur','Segundo observatorio astronómico, dirigido por el profesor Javier Fernando Rúa Restrepo.',NULL,3.23800000,-75.17800000,8,36,5,'Desierto de la Tatacoa, Villavieja, Huila','Consultar horarios',0,0.00,0,1,'2026-04-23 23:00:41'),(117,'Museo Paleontológico de Villavieja','Museo con 950 piezas originales de fauna y flora del Mioceno (hace 15 millones de años).',NULL,3.21890000,-75.21830000,3,36,2,'Carrera 3 No. 3-28, Villavieja, Huila','Martes a domingo 8:00 am - 5:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(118,'Museo de Historia Natural La Tatacoa','Museo dedicado al ecosistema del bosque seco tropical de la Tatacoa.',NULL,3.21850000,-75.21800000,3,36,2,'Villavieja, Huila','Martes a domingo',0,0.00,0,1,'2026-04-23 23:00:41'),(119,'Museo La Tormenta','Museo artesanal en el casco urbano, parte del city tour de Villavieja.',NULL,3.21800000,-75.21750000,2,36,2,'Villavieja, Huila','Consultar horarios',0,0.00,0,1,'2026-04-23 23:00:41'),(120,'Piscina Los Hoyos','Charcos y piscinas naturales en el sector Los Hoyos del desierto, ideales para refrescarse.',NULL,3.25000000,-75.16500000,1,36,5,'Sector Los Hoyos, Desierto de la Tatacoa, Villavieja, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(121,'Casa del Totumo','Museo artesanal de artesanías elaboradas con totumo, material tradicional de la región.',NULL,3.21850000,-75.21780000,2,36,2,'Carrera 1 No. 2A-01, Villavieja, Huila','Lunes a domingo 8:00 am - 6:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(122,'Sendero Interpretativo Arqueológico Doce','Sendero que combina geología, paleontología y arqueología en el desierto.',NULL,3.23500000,-75.19000000,3,36,5,'Desierto de la Tatacoa, Villavieja, Huila','Con guía local',0,0.00,0,1,'2026-04-23 23:00:41'),(123,'Quebrada Lajas','Quebrada natural que cruza el municipio, rodeada de bosque seco tropical.',NULL,3.21000000,-75.22500000,1,36,6,'Sur del municipio de Villavieja, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(124,'Puente de Golondrinas','Estructura histórica dentro del circuito turístico de Villavieja.',NULL,3.21700000,-75.22000000,7,36,2,'Villavieja, Huila','Acceso libre',0,0.00,0,1,'2026-04-23 23:00:41'),(125,'PNR Ecorregión La Tatacoa','Parque Natural Regional que protege el ecosistema del bosque seco tropical de la Tatacoa.',NULL,3.23000000,-75.17000000,1,36,5,'Municipio de Villavieja, Huila','Con guías certificados',0,0.00,0,1,'2026-04-23 23:00:41'),(126,'Cascada La María','Cascada natural en la \"Capital Turística y Ganadera del Huila\".',NULL,2.65800000,-75.52000000,4,37,7,'Zona rural, Yaguará, Huila','Se recomienda guía',0,0.00,0,1,'2026-04-23 23:00:41'),(127,'Charco El Bejuco','Piscinas naturales con caídas de agua rodeadas de bejucos, muy visitadas.',NULL,2.66200000,-75.50500000,10,37,6,'Yaguará, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(128,'Cueva del Amor','Cueva dentro del embalse de Betania, accesible por vía fluvial. Nombre dado por ingenieros italianos.',NULL,2.65000000,-75.54000000,4,37,6,'Embalse de Betania, acceso por vía fluvial, Yaguará, Huila','Acceso en lancha',0,0.00,0,1,'2026-04-23 23:00:41'),(129,'Cueva del Tigre','Caverna de 710 metros con fósiles, estalactitas, estalagmitas y una quebrada interna para barranquismo.',NULL,2.67000000,-75.50000000,4,37,3,'Zona rural, Yaguará, Huila — acceso vía Íquira','Con guía especializado',0,0.00,0,1,'2026-04-23 23:00:41'),(130,'El Malecón de Yaguará','Zona natural a orillas del embalse de Betania, con caminatas ecológicas y avistamiento de aves.',NULL,2.66600000,-75.51800000,1,37,6,'Casco urbano de Yaguará','Abierto las 24 horas',0,0.00,0,1,'2026-04-23 23:00:41'),(131,'Embalse y Represa de Betania','Gigantesca represa de 7.400 hectáreas, ofrece deportes náuticos, pesca deportiva, paseos en lancha.',NULL,2.65000000,-75.53000000,1,37,6,'Municipio de Yaguará, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(132,'Iglesia Santa Ana','Templo parroquial de estilo neogótico, considerado uno de los más bellos del Huila.',NULL,2.66680000,-75.51300000,6,37,2,'Centro, frente al parque Ángel María Paredes, Yaguará, Huila','Lunes a domingo 7:00 am - 7:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(133,'Loma de San Pedro','Mirador natural con vistas del embalse de Betania y las montañas.',NULL,2.67500000,-75.51000000,1,37,4,'Zona rural, Yaguará, Huila','Acceso libre',0,0.00,0,1,'2026-04-23 23:00:41'),(134,'Ruta Ciclista \"Anillo de Yaguará\"','Ruta ciclística alrededor del embalse, que incluye el malecón, la Loma de San Pedro y el Mirador El Cucharo.',NULL,2.66670000,-75.51310000,4,37,6,'Municipio de Yaguará, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(135,'Las Juntas y Balnearios El Tomo','Balnearios naturales a 15 minutos del casco urbano, con playas y pozos naturales.',NULL,2.68000000,-75.49000000,10,37,6,'15 minutos del casco urbano, Yaguará, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(136,'Moyas de Chichayaco','Cascada de 7 metros para descenso en cuerdas, a 4.5 km del sendero ecológico.',NULL,2.66000000,-75.50800000,4,37,7,'4.5 km del sendero ecológico, Yaguará, Huila','Con guía local',0,0.00,0,1,'2026-04-23 23:00:41'),(137,'Parque Ángel María Paredes','Parque central de Yaguará, rodeado de samanes y alamedas.',NULL,2.66680000,-75.51280000,2,37,2,'Centro, Yaguará, Huila','Abierto las 24 horas',0,0.00,0,1,'2026-04-23 23:00:41'),(138,'Quesillos Yaguareños','Tradición gastronómica: fábricas de quesillo artesanal, acompañado de achiras, cucas y mistela.',NULL,2.66650000,-75.51300000,5,37,2,'Centro, Yaguará, Huila','Lunes a domingo',0,0.00,0,1,'2026-04-23 23:00:41'),(139,'Río El Callejón - Sitio El Caimán','Tramo del río Callejón con playas y pozos de 3-4 metros profundidad, rodeado de bosque seco tropical.',NULL,2.67200000,-75.50200000,10,37,6,'Vía Íquira, vereda La Floresta, Yaguará, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(140,'Cascada de Bordones','Una de las cascadas más altas de Colombia (>400 m) en la vereda San José. Senderismo y fotografía.',NULL,1.83800000,-76.06200000,1,1,7,'Vereda San José, Acevedo, Huila','Acceso con guía',0,0.00,0,1,'2026-04-23 23:00:41'),(141,'Páramo de Miraflores','Ecosistema de alta montaña con frailejones, fuente hídrica, trekking ecológico.',NULL,1.90000000,-76.00000000,1,1,4,'Zona rural, Acevedo, Huila','Acceso con guía',0,0.00,0,1,'2026-04-23 23:00:41'),(142,'Cascada del Mortiño','Destino natural poco explorado, rodeado de bosque húmedo y senderos rurales.',NULL,1.85000000,-76.04000000,1,1,7,'Acevedo, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(143,'Río Suaza - Sector Recreativo','Zona del río Suaza para baño, tubing y actividades recreativas.',NULL,1.83000000,-76.05000000,1,1,6,'Río Suaza, Acevedo, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(144,'Cañón de Pipilicua','Formación natural imponente con paredes rocosas y paisajes áridos, ideal para senderismo.',NULL,3.22000000,-75.23000000,4,2,4,'Aipe, Huila','Acceso con guía',0,0.00,0,1,'2026-04-23 23:00:41'),(145,'Sendero Chicalá','Ruta ecológica en zona semiárida, con vegetación típica del desierto huilense.',NULL,3.21000000,-75.24000000,1,2,3,'Aipe, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(146,'Río Magdalena - Sector Aipe','Zona del río Magdalena para pesca, kayak y turismo rural.',NULL,3.22000000,-75.25000000,1,2,6,'Aipe, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(147,'Cañón de Pericongo','Escenario histórico y natural rodeado de montañas, senderismo y turismo histórico.',NULL,2.53000000,-75.32000000,7,3,4,'Algeciras, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(148,'Quebrada La Cristalina','Fuente hídrica de aguas claras, ideal para baño y caminatas ecológicas.',NULL,2.54000000,-75.31000000,1,3,6,'Algeciras, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(149,'Mirador Zathura','Mirador con vista panorámica del paisaje montañoso de Algeciras.',NULL,2.55000000,-75.33000000,1,3,4,'Algeciras, Huila','Fines de semana',0,0.00,0,1,'2026-04-23 23:00:41'),(150,'Laguna de Altamira','Espejo de agua natural para pesca artesanal y caminatas en ambiente tranquilo.',NULL,2.06000000,-75.80000000,1,4,3,'Altamira, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(151,'Río Magdalena - Altamira','Tramo del río Magdalena para pesca y recreación, rodeado de paisajes rurales.',NULL,2.07000000,-75.79000000,1,4,6,'Altamira, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(152,'Salto del Guarocó','Cascada natural rodeada de vegetación en zona rural, senderismo y fotografía.',NULL,3.15000000,-75.05000000,4,5,7,'Baraya, Huila','Acceso con guía',0,0.00,0,1,'2026-04-23 23:00:41'),(153,'Laguna de las Nubes','Espejo de agua en zona montañosa, rodeado de neblina, ideal para avistamiento de aves.',NULL,3.12000000,-75.02000000,1,5,4,'Zona rural de Baraya, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(154,'Río Guarocó','Río de aguas limpias para baño y recreación familiar.',NULL,3.14000000,-75.04000000,1,5,6,'Baraya, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(155,'Río Suaza - Elías','Zona del río Suaza rodeada de paisajes cafeteros y montañosos, para baño y descanso.',NULL,2.05000000,-75.93000000,1,8,6,'Elías, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(156,'Cascadas Rurales de Elías','Conjunto de cascadas escondidas en la zona rural, senderismo y ecoturismo.',NULL,2.06000000,-75.92000000,4,8,7,'Zona rural de Elías','Acceso con guía',0,0.00,0,1,'2026-04-23 23:00:41'),(157,'Río Magdalena - El Agrado','Tramo del río Magdalena para pesca artesanal y baño, destino tranquilo.',NULL,2.26000000,-75.77000000,1,9,6,'El Agrado, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(158,'Balnearios Naturales de El Agrado','Espacios naturales sobre ríos y quebradas para recreación y turismo familiar.',NULL,2.25000000,-75.78000000,10,9,6,'El Agrado, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(159,'Mano del Gigante','Mirador icónico con una gigantesca mano que simula sostener a los visitantes. Vistas espectaculares del valle.',NULL,2.18000000,-75.63000000,4,10,4,'Garzón, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(160,'Represa de Betania - Garzón','Zona del embalse para deportes acuáticos, pesca y turismo.',NULL,2.17000000,-75.65000000,1,10,6,'Garzón, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(161,'Mano del Gigante - Gigante','Acceso alternativo a la Mano del Gigante desde Gigante, con vistas del embalse de Betania.',NULL,2.20000000,-75.62000000,4,11,4,'Gigante, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(162,'Río Magdalena - Gigante','Zona del río Magdalena para pesca y turismo rural.',NULL,2.21000000,-75.61000000,1,11,6,'Gigante, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(163,'Cascadas de Guadalupe','Conjunto de cascadas naturales en zona rural, senderismo y turismo ecológico.',NULL,2.02000000,-75.75000000,4,12,7,'Guadalupe, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(164,'Río Suaza - Guadalupe','Tramo del río Suaza para baño y recreación.',NULL,2.03000000,-75.74000000,1,12,6,'Guadalupe, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(165,'Alto de los Ídolos','Parque arqueológico con estatuas funerarias y tumbas de culturas prehispánicas. Patrimonio Mundial.',NULL,1.92000000,-76.24000000,3,15,4,'Isnos, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(166,'Estrecho del Magdalena','Uno de los puntos más angostos del río Magdalena, donde su caudal se reduce a pocos metros.',NULL,1.91000000,-76.23000000,1,15,6,'Isnos, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(167,'Cascadas Rurales de La Argentina','Conjunto de cascadas entre montañas y cafetales, senderismo, fotografía y contacto con la naturaleza.',NULL,2.20000000,-76.00000000,4,16,7,'Zona rural, La Argentina, Huila','Acceso con guía',0,0.00,0,1,'2026-04-23 23:00:41'),(168,'Miradores Naturales de La Argentina','Puntos estratégicos en la zona montañosa con vistas del paisaje rural y cafetero.',NULL,2.21000000,-75.99000000,1,16,4,'La Argentina, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(169,'Río La Plata','Río que ofrece espacios para recreación, baño y turismo rural.',NULL,2.39000000,-75.89000000,1,17,6,'La Plata, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(170,'Cascadas de La Plata','Cascadas naturales en la zona rural para ecoturismo, caminatas y fotografía.',NULL,2.38000000,-75.90000000,4,17,7,'Zona rural, La Plata, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(171,'Cascadas de Nátaga','Destino natural rodeado de vegetación para turismo ecológico y senderismo.',NULL,2.53000000,-75.81000000,4,18,7,'Nátaga, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(172,'Miradores de Nátaga','Puntos elevados con vistas panorámicas de la región montañosa.',NULL,2.54000000,-75.80000000,1,18,4,'Nátaga, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(173,'Cascadas de Oporapa','Conjunto de caídas de agua en zona rural, rodeadas de vegetación y senderos ecológicos.',NULL,2.02000000,-75.96000000,4,20,7,'Oporapa, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(174,'Rutas Rurales de Oporapa','Senderos que atraviesan fincas agrícolas y paisajes naturales, turismo comunitario.',NULL,2.03000000,-75.95000000,1,20,1,'Oporapa, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(175,'Caja de Agua de Paicol','Impresionante formación natural donde el agua cae en una cavidad rocosa formando una piscina natural.',NULL,2.45000000,-75.78000000,4,21,7,'Paicol, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(176,'Cascadas de Paicol','Serie de cascadas en zona rural para senderismo y ecoturismo.',NULL,2.44000000,-75.77000000,4,21,7,'Paicol, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(177,'Valle de Laboyos','Valle fértil rodeado de montañas, reconocido por su producción cafetera y paisajes naturales.',NULL,1.85000000,-76.05000000,1,25,4,'Pitalito, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(178,'Laguna Guaitipán','Laguna natural rodeada de vegetación, ideal para actividades ecológicas, pesca y turismo de naturaleza.',NULL,1.84000000,-76.06000000,1,25,3,'Pitalito, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(179,'Cascada Arcoíris','Espectacular cascada donde la luz del sol genera efectos de arcoíris en el agua.',NULL,1.90000000,-76.10000000,4,27,7,'Saladoblanco, Huila','Acceso con guía',0,0.00,0,1,'2026-04-23 23:00:41'),(180,'Parque Arqueológico de San Agustín','Patrimonio de la Humanidad, con esculturas y tumbas prehispánicas de culturas milenarias.',NULL,1.88000000,-76.27000000,3,29,3,'San Agustín, Huila','Todos los días 8:00 am - 5:00 pm',0,0.00,0,1,'2026-04-23 23:00:41'),(181,'Estrecho del Magdalena - San Agustín','Lugar donde el río Magdalena se estrecha entre formaciones rocosas, creando un paisaje impresionante.',NULL,1.87000000,-76.26000000,1,29,6,'San Agustín, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(182,'Río Suaza - Suaza','Zona del río Suaza para actividades recreativas, baño y turismo rural.',NULL,1.98000000,-75.95000000,1,30,6,'Suaza, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(183,'Río Páez','Río que atraviesa el municipio, ideal para pesca, recreación y turismo natural.',NULL,2.48000000,-75.73000000,1,34,6,'Tesalia, Huila','Todos los días',0,0.00,0,1,'2026-04-23 23:00:41'),(184,'Cueva del Mohán','Formación natural con gran valor cultural y mitológico, para turismo de aventura y exploración.',NULL,1.95000000,-75.93000000,4,35,4,'Timaná, Huila','Acceso con guía',0,0.00,0,1,'2026-04-23 23:00:41');
/*!40000 ALTER TABLE `destinos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `destinos_categorias`
--

DROP TABLE IF EXISTS `destinos_categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `destinos_categorias` (
  `destino_id` int(11) NOT NULL,
  `categoria_id` int(11) NOT NULL,
  PRIMARY KEY (`destino_id`,`categoria_id`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `destinos_categorias_ibfk_1` FOREIGN KEY (`destino_id`) REFERENCES `destinos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `destinos_categorias_ibfk_2` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `destinos_categorias`
--

LOCK TABLES `destinos_categorias` WRITE;
/*!40000 ALTER TABLE `destinos_categorias` DISABLE KEYS */;
/*!40000 ALTER TABLE `destinos_categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `destinos_entornos`
--

DROP TABLE IF EXISTS `destinos_entornos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `destinos_entornos` (
  `destino_id` int(11) NOT NULL,
  `entorno_id` int(11) NOT NULL,
  PRIMARY KEY (`destino_id`,`entorno_id`),
  KEY `entorno_id` (`entorno_id`),
  CONSTRAINT `destinos_entornos_ibfk_1` FOREIGN KEY (`destino_id`) REFERENCES `destinos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `destinos_entornos_ibfk_2` FOREIGN KEY (`entorno_id`) REFERENCES `entornos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `destinos_entornos`
--

LOCK TABLES `destinos_entornos` WRITE;
/*!40000 ALTER TABLE `destinos_entornos` DISABLE KEYS */;
/*!40000 ALTER TABLE `destinos_entornos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `destinos_etiquetas`
--

DROP TABLE IF EXISTS `destinos_etiquetas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `destinos_etiquetas` (
  `destino_id` int(11) NOT NULL,
  `etiqueta_id` int(11) NOT NULL,
  PRIMARY KEY (`destino_id`,`etiqueta_id`),
  KEY `etiqueta_id` (`etiqueta_id`),
  CONSTRAINT `destinos_etiquetas_ibfk_1` FOREIGN KEY (`destino_id`) REFERENCES `destinos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `destinos_etiquetas_ibfk_2` FOREIGN KEY (`etiqueta_id`) REFERENCES `etiquetas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `destinos_etiquetas`
--

LOCK TABLES `destinos_etiquetas` WRITE;
/*!40000 ALTER TABLE `destinos_etiquetas` DISABLE KEYS */;
/*!40000 ALTER TABLE `destinos_etiquetas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `destinos_tipos_viajero`
--

DROP TABLE IF EXISTS `destinos_tipos_viajero`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `destinos_tipos_viajero` (
  `destino_id` int(11) NOT NULL,
  `tipo_viajero_id` int(11) NOT NULL,
  PRIMARY KEY (`destino_id`,`tipo_viajero_id`),
  KEY `tipo_viajero_id` (`tipo_viajero_id`),
  CONSTRAINT `destinos_tipos_viajero_ibfk_1` FOREIGN KEY (`destino_id`) REFERENCES `destinos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `destinos_tipos_viajero_ibfk_2` FOREIGN KEY (`tipo_viajero_id`) REFERENCES `tipos_viajero` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `destinos_tipos_viajero`
--

LOCK TABLES `destinos_tipos_viajero` WRITE;
/*!40000 ALTER TABLE `destinos_tipos_viajero` DISABLE KEYS */;
/*!40000 ALTER TABLE `destinos_tipos_viajero` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entornos`
--

DROP TABLE IF EXISTS `entornos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `entornos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entornos`
--

LOCK TABLES `entornos` WRITE;
/*!40000 ALTER TABLE `entornos` DISABLE KEYS */;
INSERT INTO `entornos` VALUES (7,'Cascadas'),(5,'Desierto'),(4,'Montañoso'),(3,'Natural'),(6,'Río'),(1,'Rural'),(2,'Urbano');
/*!40000 ALTER TABLE `entornos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `etiquetas`
--

DROP TABLE IF EXISTS `etiquetas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `etiquetas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `etiquetas`
--

LOCK TABLES `etiquetas` WRITE;
/*!40000 ALTER TABLE `etiquetas` DISABLE KEYS */;
INSERT INTO `etiquetas` VALUES (3,'Caminatas'),(7,'Extremo'),(2,'Familia'),(4,'Fotografía'),(5,'Historia'),(1,'Parejas'),(6,'Tranquilo');
/*!40000 ALTER TABLE `etiquetas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favoritos`
--

DROP TABLE IF EXISTS `favoritos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `favoritos` (
  `usuario_id` int(11) NOT NULL,
  `destino_id` int(11) NOT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`usuario_id`,`destino_id`),
  KEY `destino_id` (`destino_id`),
  CONSTRAINT `favoritos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `favoritos_ibfk_2` FOREIGN KEY (`destino_id`) REFERENCES `destinos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favoritos`
--

LOCK TABLES `favoritos` WRITE;
/*!40000 ALTER TABLE `favoritos` DISABLE KEYS */;
/*!40000 ALTER TABLE `favoritos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `imagenes_destino`
--

DROP TABLE IF EXISTS `imagenes_destino`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `imagenes_destino` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `destino_id` int(11) NOT NULL,
  `url` varchar(255) NOT NULL,
  `tipo` enum('principal','secundaria') DEFAULT 'secundaria',
  PRIMARY KEY (`id`),
  KEY `destino_id` (`destino_id`),
  CONSTRAINT `imagenes_destino_ibfk_1` FOREIGN KEY (`destino_id`) REFERENCES `destinos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `imagenes_destino`
--

LOCK TABLES `imagenes_destino` WRITE;
/*!40000 ALTER TABLE `imagenes_destino` DISABLE KEYS */;
/*!40000 ALTER TABLE `imagenes_destino` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` smallint(5) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_04_22_005804_create_personal_access_tokens_table',1),(5,'2026_04_29_235800_add_perfil_columns_to_users_table',1),(6,'2026_05_10_015443_make_password_nullable_in_usuarios_table',1),(7,'2026_05_10_051914_add_timestamps_to_usuarios_table',1),(8,'2026_05_10_073751_create_publicaciones_table',1),(9,'2026_05_12_050522_create_publicacion_likes_table',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `municipios`
--

DROP TABLE IF EXISTS `municipios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `municipios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `municipios`
--

LOCK TABLES `municipios` WRITE;
/*!40000 ALTER TABLE `municipios` DISABLE KEYS */;
INSERT INTO `municipios` VALUES (1,'Acevedo'),(2,'Aipe'),(3,'Algeciras'),(4,'Altamira'),(5,'Baraya'),(6,'Campoalegre'),(7,'Colombia'),(9,'El Agrado'),(8,'Elías'),(10,'Garzón'),(11,'Gigante'),(12,'Guadalupe'),(13,'Hobo'),(14,'Íquira'),(15,'Isnos'),(16,'La Argentina'),(17,'La Plata'),(18,'Nátaga'),(19,'Neiva'),(20,'Oporapa'),(21,'Paicol'),(22,'Palermo'),(23,'Palestina'),(24,'Pital'),(25,'Pitalito'),(26,'Rivera'),(27,'Saladoblanco'),(29,'San Agustín'),(28,'Santa María'),(30,'Suaza'),(31,'Tarqui'),(32,'Tello'),(33,'Teruel'),(34,'Tesalia'),(35,'Timaná'),(36,'Villavieja'),(37,'Yaguará');
/*!40000 ALTER TABLE `municipios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',1,'auth_token','5cf0244a30f3091c90f74b7545c5f8cdfbd40cf52c1aeaa6fcc1cfadae137d24','[\"*\"]',NULL,NULL,'2026-05-08 08:37:55','2026-05-08 08:37:55'),(2,'App\\Models\\User',1,'auth_token','c3af150efb3ff6c903a02c9e4bb20f9c5dcfef6bf37f22895d4bd952bb41cad8','[\"*\"]',NULL,NULL,'2026-05-08 08:38:40','2026-05-08 08:38:40'),(3,'App\\Models\\User',1,'auth_token','030765c072ab7663d5efc55f8f3d466ec6ec5c6846d26f0ace922020ea435cb3','[\"*\"]',NULL,NULL,'2026-05-08 08:40:42','2026-05-08 08:40:42'),(4,'App\\Models\\User',1,'auth_token','5b2615b04c5fff09e5c5e29b8127bf6fa1bcd59392b466096e6d3f26570f7d16','[\"*\"]',NULL,NULL,'2026-05-08 08:43:03','2026-05-08 08:43:03'),(5,'App\\Models\\User',1,'auth_token','afe22fc3df83fdbe2cfe79898b57d5b1d66b19527f5d7b33b8a51afb6dcb2a2d','[\"*\"]',NULL,NULL,'2026-05-08 08:44:45','2026-05-08 08:44:45'),(6,'App\\Models\\User',1,'auth_token','a94679d3c4fb311f5a129b989a691fa340510f73440cc83fd3a091ac400a0985','[\"*\"]',NULL,NULL,'2026-05-08 08:45:23','2026-05-08 08:45:23'),(7,'App\\Models\\User',1,'auth_token','7dccaff197779b07c43be44835be55c86bf14cdcc3db4702e1d233f988747ddf','[\"*\"]',NULL,NULL,'2026-05-08 08:50:42','2026-05-08 08:50:42'),(8,'App\\Models\\User',1,'auth_token','80c2e9e245ab7b343c41680503c85e89701d0affe26718ac960ceee0a4317850','[\"*\"]','2026-05-08 12:26:44',NULL,'2026-05-08 08:51:08','2026-05-08 12:26:44'),(9,'App\\Models\\User',2,'auth_token','4445d33fb8133ba7ecb41d1cb080100d498ef621f27fc6cd658b6d47921050dc','[\"*\"]',NULL,NULL,'2026-05-10 11:18:53','2026-05-10 11:18:53'),(10,'App\\Models\\User',3,'google_auth','d84211bf2a16f010b8a2552aea282f2a2f7aeb5bb893003311e1283ba9ac93c2','[\"*\"]','2026-05-10 07:06:45',NULL,'2026-05-10 06:59:23','2026-05-10 07:06:45'),(11,'App\\Models\\User',3,'google_auth','5b137afa36ec820022fc6df3867c64588b3bb903e188469425a02553b16fb44c','[\"*\"]','2026-05-10 07:07:06',NULL,'2026-05-10 07:07:03','2026-05-10 07:07:06'),(12,'App\\Models\\User',4,'google_auth','c3d3ed4cff08f6b3837007cbd67d4c58c0193616e0f9247b5a2fe5813cb926db','[\"*\"]','2026-05-10 08:20:43',NULL,'2026-05-10 08:20:41','2026-05-10 08:20:43'),(13,'App\\Models\\User',3,'google_auth','e6d635f58746c6b48e4316c96ab40ad564ae42413e468daafe172423f46473ab','[\"*\"]','2026-05-10 08:23:26',NULL,'2026-05-10 08:23:23','2026-05-10 08:23:26'),(14,'App\\Models\\User',5,'auth_token','92b859a4cbc2b39bc1d5ee8037d531da7590da95db631c4fdf890665af80eef2','[\"*\"]',NULL,NULL,'2026-05-10 08:35:11','2026-05-10 08:35:11'),(15,'App\\Models\\User',6,'auth_token','f918894dfa200219dbe73cc26da29d559b576fca15b79dff8dc298d526e48a83','[\"*\"]',NULL,NULL,'2026-05-10 08:50:13','2026-05-10 08:50:13'),(17,'App\\Models\\User',3,'google_auth','dc31226cbe3c93e9fcb030b45238dc47c91262527dc6b25079e0651013336dcf','[\"*\"]',NULL,NULL,'2026-05-10 09:37:35','2026-05-10 09:37:35'),(18,'App\\Models\\User',3,'google_auth','75c4cb3769f208ad03d268156760029799a6ab976e8891b647949d06b5f7ea36','[\"*\"]',NULL,NULL,'2026-05-10 09:38:29','2026-05-10 09:38:29'),(19,'App\\Models\\User',3,'google_auth','7967826aa50fefe6e1b99d3bc7652e526b6d57e69bde30fc057b979a6fe12993','[\"*\"]',NULL,NULL,'2026-05-10 10:24:45','2026-05-10 10:24:45'),(20,'App\\Models\\User',3,'google_auth','b51e14dd3e59f6fa858e914162d1df5a870fd3c79b5237792e6968fbc841a77b','[\"*\"]',NULL,NULL,'2026-05-10 10:25:00','2026-05-10 10:25:00'),(21,'App\\Models\\User',3,'google_auth','a45323a415af456d7b66a37dd77db84f075dfe22527991b5cce02fd2610379be','[\"*\"]',NULL,NULL,'2026-05-10 10:25:35','2026-05-10 10:25:35'),(22,'App\\Models\\User',3,'google_auth','9d0212cd009439268e4d39de78b40b4b3b05e8412836fb27b9eecf6f66d0ae33','[\"*\"]',NULL,NULL,'2026-05-10 10:27:45','2026-05-10 10:27:45'),(23,'App\\Models\\User',3,'google_auth','e0246537b113315b4cd649f8dff6645d0a4b9344b15a654fb5b2df52df445e24','[\"*\"]',NULL,NULL,'2026-05-10 10:41:09','2026-05-10 10:41:09'),(24,'App\\Models\\User',3,'google_auth','f96dd08163cb568545186f56315f059be830c7368a9f691ab075caa379ce269c','[\"*\"]',NULL,NULL,'2026-05-10 10:42:23','2026-05-10 10:42:23'),(25,'App\\Models\\User',4,'google_auth','d1b3dabbb0779111af78366c98eda5e2621acfa008d6eb4625edba948f0384ca','[\"*\"]',NULL,NULL,'2026-05-10 10:55:03','2026-05-10 10:55:03'),(26,'App\\Models\\User',3,'google_auth','e065ad52817d3bfdb13ecdca6eb6894c993c8ccacd0ddf0e0385cad1e251606c','[\"*\"]',NULL,NULL,'2026-05-10 10:55:45','2026-05-10 10:55:45'),(28,'App\\Models\\User',3,'google_auth','81bdb56be5a37cfc74f17c6322f315d091b86cdea9c0624a322243e4d9e27929','[\"*\"]',NULL,NULL,'2026-05-10 10:58:31','2026-05-10 10:58:31'),(29,'App\\Models\\User',3,'google_auth','8dfd64eb3b83481dab97f01a8a0248c939cbccaae888c6e9043c2766a0f98c74','[\"*\"]',NULL,NULL,'2026-05-10 11:00:41','2026-05-10 11:00:41'),(30,'App\\Models\\User',4,'google_auth','2146c8c39b7e9d0410e48c0130e9fdcff91c846b88df6c35f0ff89319045d11a','[\"*\"]',NULL,NULL,'2026-05-10 11:02:22','2026-05-10 11:02:22'),(41,'App\\Models\\User',3,'google_auth','0058178de138877f913e952e88b8199326d8a300efadd4129d2fb1cb7ccc80b4','[\"*\"]','2026-05-10 11:47:47',NULL,'2026-05-10 11:47:42','2026-05-10 11:47:47'),(44,'App\\Models\\User',9,'google_auth','7eab8db01adc7f1459eca28384001390f9fb822ffe7eb46d1d9b250b39c6a1d7','[\"*\"]','2026-05-10 12:00:55',NULL,'2026-05-10 12:00:50','2026-05-10 12:00:55'),(45,'App\\Models\\User',10,'google_auth','5999699a74fce685ed562077f432e849dc62179a7811a839587b2d7df97de97e','[\"*\"]','2026-05-10 12:04:03',NULL,'2026-05-10 12:03:23','2026-05-10 12:04:03'),(46,'App\\Models\\User',11,'google_auth','be1915b4acdd0b3cf149a9e71bb2aeda92609893b64cb95fa8d49c801e43c664','[\"*\"]','2026-05-10 12:08:11',NULL,'2026-05-10 12:06:20','2026-05-10 12:08:11'),(48,'App\\Models\\User',13,'auth_token','96d003c021a0e137c9d461411b24ab1aa721076d92f4744e3d0ef908d4269632','[\"*\"]','2026-05-10 12:17:51',NULL,'2026-05-10 12:17:46','2026-05-10 12:17:51'),(50,'App\\Models\\User',12,'google_auth','5a59077b189ab576d6c31803a27aabce6355914e05aac3b8c16d20829c191ec0','[\"*\"]','2026-05-11 00:53:52',NULL,'2026-05-10 12:50:23','2026-05-11 00:53:52'),(51,'App\\Models\\User',12,'google_auth','134611363184b491e6118b2b7e301ccce3fa8d7c50726ee916c7bb77cc8d3d01','[\"*\"]','2026-05-11 01:13:38',NULL,'2026-05-11 01:13:15','2026-05-11 01:13:38'),(55,'App\\Models\\User',12,'google_auth','a899e55bfc78f2818b60c60b678acc30e64acc2932ad7a98dfc0d220ab43d06a','[\"*\"]',NULL,NULL,'2026-05-13 09:27:11','2026-05-13 09:27:11'),(56,'App\\Models\\User',14,'google_auth','bfc0ab2ae4a6bd35f548fd8cae2f4ddbfbb1959aac23e6955cbf32cc5344402d','[\"*\"]',NULL,NULL,'2026-05-13 09:27:38','2026-05-13 09:27:38'),(57,'App\\Models\\User',12,'google_auth','6aee6e4c2a92f01834ae7fec6cb1cdaa4639402e65a30406822a3e3f4371159b','[\"*\"]',NULL,NULL,'2026-05-13 09:33:07','2026-05-13 09:33:07'),(58,'App\\Models\\User',12,'google_auth','d8299cac1fb07610a9430908412ad45c6c0fedb412c6e3309e42b0e76d7b20ca','[\"*\"]',NULL,NULL,'2026-05-14 01:04:48','2026-05-14 01:04:48'),(62,'App\\Models\\User',14,'google_auth','fc922cc9abbf51009b4b9aeef29b0d8664e85148852620f3580563beb6095907','[\"*\"]','2026-05-14 05:18:28',NULL,'2026-05-14 05:18:24','2026-05-14 05:18:28');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `preferencias_usuario`
--

DROP TABLE IF EXISTS `preferencias_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `preferencias_usuario` (
  `usuario_id` int(11) NOT NULL,
  `accesibilidad_requerida` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`usuario_id`),
  CONSTRAINT `preferencias_usuario_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preferencias_usuario`
--

LOCK TABLES `preferencias_usuario` WRITE;
/*!40000 ALTER TABLE `preferencias_usuario` DISABLE KEYS */;
/*!40000 ALTER TABLE `preferencias_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `publicacion_likes`
--

DROP TABLE IF EXISTS `publicacion_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `publicacion_likes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `publicacion_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `publicacion_likes_usuario_id_publicacion_id_unique` (`usuario_id`,`publicacion_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `publicacion_likes`
--

LOCK TABLES `publicacion_likes` WRITE;
/*!40000 ALTER TABLE `publicacion_likes` DISABLE KEYS */;
INSERT INTO `publicacion_likes` VALUES (3,14,2,'2026-05-13 09:25:05','2026-05-13 09:25:05'),(6,14,1,'2026-05-13 09:25:24','2026-05-13 09:25:24'),(9,12,1,'2026-05-14 01:23:18','2026-05-14 01:23:18'),(10,12,2,'2026-05-14 01:23:26','2026-05-14 01:23:26'),(11,12,3,'2026-05-13 20:43:46','2026-05-13 20:43:46');
/*!40000 ALTER TABLE `publicacion_likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `publicaciones`
--

DROP TABLE IF EXISTS `publicaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `publicaciones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `imagen` varchar(255) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `ubicacion` varchar(255) DEFAULT NULL,
  `likes` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `publicaciones`
--

LOCK TABLES `publicaciones` WRITE;
/*!40000 ALTER TABLE `publicaciones` DISABLE KEYS */;
INSERT INTO `publicaciones` VALUES (1,12,'http://localhost:8000/imagenes/publicaciones/RY23Hy3V79JRODHbzHlPtILLt7w8PleIO7FzY8QZ.jpg','prueba','neiva',2,'2026-05-12 08:38:55','2026-05-12 09:00:51'),(2,14,'http://localhost:8000/imagenes/publicaciones/ZT9TSu6pHdFQ3ExviRRiy76v9BozCZrCuU4HCcYT.png','prueba2',NULL,0,'2026-05-13 09:08:11','2026-05-13 09:08:11'),(3,12,'http://localhost:8000/imagenes/publicaciones/fP0AQbmASMvsKMwe03zFqgeXBXQRozUzlapro9Vi.jpg','prueba 3','Neiva-huila',0,'2026-05-13 20:43:38','2026-05-13 20:43:38');
/*!40000 ALTER TABLE `publicaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reseñas`
--

DROP TABLE IF EXISTS `reseñas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reseñas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `destino_id` int(11) NOT NULL,
  `rating` tinyint(4) NOT NULL CHECK (`rating` between 1 and 5),
  `comentario` text DEFAULT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usuario_destino` (`usuario_id`,`destino_id`),
  KEY `destino_id` (`destino_id`),
  CONSTRAINT `reseñas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reseñas_ibfk_2` FOREIGN KEY (`destino_id`) REFERENCES `destinos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reseñas`
--

LOCK TABLES `reseñas` WRITE;
/*!40000 ALTER TABLE `reseñas` DISABLE KEYS */;
/*!40000 ALTER TABLE `reseñas` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER after_reseña_insert_update
AFTER INSERT ON reseñas
FOR EACH ROW
BEGIN
    UPDATE destinos d
    SET 
        total_reseñas = (SELECT COUNT(*) FROM reseñas WHERE destino_id = NEW.destino_id),
        rating_promedio = (SELECT AVG(rating) FROM reseñas WHERE destino_id = NEW.destino_id)
    WHERE d.id = NEW.destino_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER after_reseña_delete
AFTER DELETE ON reseñas
FOR EACH ROW
BEGIN
    UPDATE destinos d
    SET 
        total_reseñas = (SELECT COUNT(*) FROM reseñas WHERE destino_id = OLD.destino_id),
        rating_promedio = (SELECT AVG(rating) FROM reseñas WHERE destino_id = OLD.destino_id)
    WHERE d.id = OLD.destino_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('bVZeQArH5EVonSuN2MQmARCZD8QH57UBZiKcCEq0',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','eyJfdG9rZW4iOiJyY3FONmRKZmVxelB2WkU0TERYSWdmZ0tpbW9OaFF6aU15MkxaSlR2IiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cL2xvY2FsaG9zdDo4MDAwXC9pbWFnZW5lc1wvcHVibGljYWNpb25lc1wvZlAwQVFibUFTTXZzS013ZTAzekZxZ2VYQlhRUm96VXpsYXBybzlWaS5qcGciLCJyb3V0ZSI6bnVsbH0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=',1778695276),('coSUGW9NtNNUGhEOtQv0NYOD8rm7KL5LUUjOcbhr',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','eyJfdG9rZW4iOiJGbFF1UERNZkhhVlpZZ2pxRmhOOEFNejVPb3RDeVBpblc5TzBMUEUyIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cL2xvY2FsaG9zdDo4MDAwXC9pbWFnZW5lc1wvcHVibGljYWNpb25lc1wvZlAwQVFibUFTTXZzS013ZTAzekZxZ2VYQlhRUm96VXpsYXBybzlWaS5qcGciLCJyb3V0ZSI6bnVsbH0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=',1778716529),('e2MjXPr1SQ8Wj14zzC3mJtHvP66dmrkFyqiQzoI6',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','eyJfdG9rZW4iOiJwb0Q0T2d0TnhRVVdDSzZneklUSjRhOU5wTTRjbTQzZllPd3lZV2VtIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cL2xvY2FsaG9zdDo4MDAwXC9pbWFnZW5lc1wvcHVibGljYWNpb25lc1wvUlkyM0h5M1Y3OUpST0RIYnpIbFB0SUxMdDd3OFBsZUlPN0Z6WThRWi5qcGciLCJyb3V0ZSI6bnVsbH0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=',1778557701),('E8QN1Lvz40qQjswJ25R0vbQCTn66YUfznuCqR2KM',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','eyJfdG9rZW4iOiJUckVMalNCcE9PSXRVTFJsQ0l4ZU5iZTZtMG85MDdJTHdqbzNWbFc1IiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cL2xvY2FsaG9zdDo4MDAwXC9pbWFnZW5lc1wvcHVibGljYWNpb25lc1wvWlQ5VFN1NnBIZEZRM0V4dmlSUml5NzZ2OUJvekNackN1VTRIQ2NZVC5wbmciLCJyb3V0ZSI6ImdlbmVyYXRlZDo6eUJ1RUlackZnYWllVmJQUCJ9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19',1778646253),('fBDjTh0qGCRKX3BUJiWyGgii7AFeGaFC2INx6LRQ',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','eyJfdG9rZW4iOiI4TUVuMUdmZEJ1OVR3T1NtdXVrNnpKUGxiNHVZejNQNHQ0NVFYRFhXIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cL2xvY2FsaG9zdDo4MDAwXC9pbWFnZW5lc1wvcHVibGljYWNpb25lc1wvUlkyM0h5M1Y3OUpST0RIYnpIbFB0SUxMdDd3OFBsZUlPN0Z6WThRWi5qcGciLCJyb3V0ZSI6bnVsbH0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=',1778560959),('k0mUZM549TNtDpLesAhi9dYbLuoTAkLFuvW8l8am',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','eyJfdG9rZW4iOiJEQlJhMWxndU5XQ2NRaWZxbXN0MmU1Z0M2enM5YlFuSUZvTDhQVXRNIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwIiwicm91dGUiOm51bGx9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19',1778390295),('lOVaUJGqhBq9bZSpWebbAeSOgT86JF0XeMgydxs1',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','eyJfdG9rZW4iOiJvRmRDQXF3a2ZsMWRCYWMxeVRXTDF5U3pRMktFeXJqQ3hkT3JaR1BaIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cL2xvY2FsaG9zdDo4MDAwXC9pbWFnZW5lc1wvcHVibGljYWNpb25lc1wvWlQ5VFN1NnBIZEZRM0V4dmlSUml5NzZ2OUJvekNackN1VTRIQ2NZVC5wbmciLCJyb3V0ZSI6bnVsbH0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=',1778703778),('zYYLpDr9i3WVS4zeYagopywcqnF3wmkTttvGwMko',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0','eyJfdG9rZW4iOiI5dnhYQTJrYTRndXk4YkNDUWNsbXcxYnRKRlAwUTZ4WEhuTzRIUUhQIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cL2xvY2FsaG9zdDo4MDAwXC9pbWFnZW5lc1wvcHVibGljYWNpb25lc1wvWlQ5VFN1NnBIZEZRM0V4dmlSUml5NzZ2OUJvekNackN1VTRIQ2NZVC5wbmciLCJyb3V0ZSI6bnVsbH0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=',1778716530);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipos_viajero`
--

DROP TABLE IF EXISTS `tipos_viajero`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tipos_viajero` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipos_viajero`
--

LOCK TABLES `tipos_viajero` WRITE;
/*!40000 ALTER TABLE `tipos_viajero` DISABLE KEYS */;
INSERT INTO `tipos_viajero` VALUES (6,'Adultos mayores'),(3,'Amigos'),(1,'Familiar'),(5,'Niños'),(2,'Parejas'),(4,'Viaje solo');
/*!40000 ALTER TABLE `tipos_viajero` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `bio` varchar(255) DEFAULT NULL,
  `ubicacion` varchar(100) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `foto_portada` varchar(255) DEFAULT NULL,
  `google_id` varchar(100) DEFAULT NULL,
  `provider` varchar(50) NOT NULL DEFAULT 'local',
  `google_token` text DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_google_id_unique` (`google_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Camilo','camilo@gmail.com',NULL,NULL,NULL,NULL,NULL,'local',NULL,NULL,'$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',NULL,'2026-05-08 03:14:00','2026-05-08 03:14:00');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `google_id` varchar(100) DEFAULT NULL,
  `provider` varchar(50) DEFAULT 'local',
  `google_token` text DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `rol` enum('turista','admin') DEFAULT 'turista',
  `bio` varchar(255) DEFAULT NULL,
  `ubicacion_texto` varchar(100) DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `foto_portada` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `email_verificado` tinyint(1) DEFAULT 0,
  `ultimo_acceso` datetime DEFAULT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `google_id` (`google_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Test Con Timestamps','timestamps@test.com',NULL,'local',NULL,'$2y$12$eTcCGsN1eqCVFOovBJrp/Or9/l3TvUA.s.hHoYCdglVW9igvfjstm','turista',NULL,NULL,NULL,NULL,1,0,NULL,'2026-05-10 00:22:58','2026-05-10 10:22:58','2026-05-10 10:22:58'),(2,'PruebaCurl','curl@test.com',NULL,'local',NULL,'$2y$12$5s8apwo.XWUPKtPYi/PgHeZ82L8Un9IEw1CX0HlAhegpsH5uBPe2K','turista',NULL,NULL,NULL,NULL,1,0,NULL,'2026-05-10 01:18:53','2026-05-10 11:18:53','2026-05-10 11:18:53'),(5,'TestCurl','testcurl@example.com',NULL,'local',NULL,'$2y$12$IZNm18/GP/co1eTuKYl.I.coSvY/gyCJ0v0Gt6B4aa5FzSF0dGB36','turista',NULL,NULL,NULL,NULL,1,0,NULL,'2026-05-09 22:35:11','2026-05-10 08:35:11','2026-05-10 08:35:11'),(12,'camilo facundo','juancamilofacundog@gmail.com','107642425073708894355','google','ya29.a0AQvPyIMoJaIXtIUcCSfnpK7JHVUjUEcufnYQZ-PqmxjhFzLgSmbeznkbgNeeOAQqp4o-Rp6pyirbQy1TsWMvc4d7xLldZqQ0G_8TjfULpsg2BIQz_a21EbAW3S3o-ozIk0pKJedBSkEmL-TfS2BBdvV8Hs4ZcYacX7VbI-n2FdT7kxR-9rhkXHqWERoUVlLzgmKvTuhD-fqAgWYA5IbAaRXIhgXC6IF5h0wROZlaSlVlWyThFaAVUza-BwKFUetTPD57ooKpr2dSVpiqmVu5914kXAOzHFEaCgYKAUUSARYSFQHGX2MiT5Jt5gO3QH4LLOQ7V-leMg0294',NULL,'turista',NULL,NULL,'https://lh3.googleusercontent.com/a/ACg8ocKGbuI-fLsaxT3UuSrV44X1CNfACzX2xRYhPGJFZQYpLaNrHLDl=s96-c',NULL,1,0,NULL,'2026-05-10 02:17:17','2026-05-10 12:17:17','2026-05-13 23:02:04'),(13,'jcamifago','juanfacundo@gmail.com',NULL,'local',NULL,'$2y$12$OWZcMQCKb9hv5GLZbCJYFOa1QyjaU4DUqgfyepus.tizMH/nQVUie','turista',NULL,NULL,NULL,NULL,1,0,NULL,'2026-05-10 02:17:46','2026-05-10 12:17:46','2026-05-10 12:17:46'),(14,'JUAN CAMILO FACUNDO GONZALEZ','juan_facundogo@fet.edu.co','116280369040138126743','google','ya29.a0AQvPyINsC-QOFuIha_GDCPNxOW3zPHKPxEG3YTTglvc1ld2cT60ECnjvpcGrxpOsAQ6IlT-rucoyWBQHpjrL0C9nOB8n9YYIvYwy43Hlit_ZEsdCH0-kJDEEUxs_o_Mp2u7JOWLWr6Y1gTOjm3eEoGttNQArNmW1JH1nOzZ2P-4ivvraFtBxtV4iD9lqMccUXiD02GYCuIYZP3oFDYPd9I794h9mh6kznFPR6oVKSKlpamOMmg6uDM97sFPqc3wXKFmcQx4xzio8rQY5dinEZ04H3tbXQgaCgYKAUsSARQSFQHGX2MibohCFpVElnkqfUlMMt9U0A0293',NULL,'turista',NULL,NULL,'https://lh3.googleusercontent.com/a/ACg8ocLZCJkRdIgq__ZKZWjyAF0nEmjXtFOi3Rcd-y2xHAT0mwXiZA=s96-c',NULL,1,0,NULL,'2026-05-10 02:35:26','2026-05-10 12:35:26','2026-05-14 05:18:23');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios_categorias`
--

DROP TABLE IF EXISTS `usuarios_categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios_categorias` (
  `usuario_id` int(11) NOT NULL,
  `categoria_id` int(11) NOT NULL,
  `peso` tinyint(4) DEFAULT 3 CHECK (`peso` between 1 and 5),
  PRIMARY KEY (`usuario_id`,`categoria_id`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `usuarios_categorias_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `usuarios_categorias_ibfk_2` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios_categorias`
--

LOCK TABLES `usuarios_categorias` WRITE;
/*!40000 ALTER TABLE `usuarios_categorias` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuarios_categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios_entornos`
--

DROP TABLE IF EXISTS `usuarios_entornos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios_entornos` (
  `usuario_id` int(11) NOT NULL,
  `entorno_id` int(11) NOT NULL,
  `peso` tinyint(4) DEFAULT 3 CHECK (`peso` between 1 and 5),
  PRIMARY KEY (`usuario_id`,`entorno_id`),
  KEY `entorno_id` (`entorno_id`),
  CONSTRAINT `usuarios_entornos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `usuarios_entornos_ibfk_2` FOREIGN KEY (`entorno_id`) REFERENCES `entornos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios_entornos`
--

LOCK TABLES `usuarios_entornos` WRITE;
/*!40000 ALTER TABLE `usuarios_entornos` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuarios_entornos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios_etiquetas`
--

DROP TABLE IF EXISTS `usuarios_etiquetas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios_etiquetas` (
  `usuario_id` int(11) NOT NULL,
  `etiqueta_id` int(11) NOT NULL,
  `peso` tinyint(4) DEFAULT 3 CHECK (`peso` between 1 and 5),
  PRIMARY KEY (`usuario_id`,`etiqueta_id`),
  KEY `etiqueta_id` (`etiqueta_id`),
  CONSTRAINT `usuarios_etiquetas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `usuarios_etiquetas_ibfk_2` FOREIGN KEY (`etiqueta_id`) REFERENCES `etiquetas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios_etiquetas`
--

LOCK TABLES `usuarios_etiquetas` WRITE;
/*!40000 ALTER TABLE `usuarios_etiquetas` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuarios_etiquetas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios_tipos_viajero`
--

DROP TABLE IF EXISTS `usuarios_tipos_viajero`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios_tipos_viajero` (
  `usuario_id` int(11) NOT NULL,
  `tipo_viajero_id` int(11) NOT NULL,
  `peso` tinyint(4) DEFAULT 3 CHECK (`peso` between 1 and 5),
  PRIMARY KEY (`usuario_id`,`tipo_viajero_id`),
  KEY `tipo_viajero_id` (`tipo_viajero_id`),
  CONSTRAINT `usuarios_tipos_viajero_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `usuarios_tipos_viajero_ibfk_2` FOREIGN KEY (`tipo_viajero_id`) REFERENCES `tipos_viajero` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios_tipos_viajero`
--

LOCK TABLES `usuarios_tipos_viajero` WRITE;
/*!40000 ALTER TABLE `usuarios_tipos_viajero` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuarios_tipos_viajero` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-13 23:15:37
