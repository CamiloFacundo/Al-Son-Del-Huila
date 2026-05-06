USE al_son_del_huila;

-- =====================================================
-- INSERCIÓN DE DESTINOS (SIN NINGÚN CAMPO NULO)
-- =====================================================

INSERT INTO destinos 
  (nombre, descripcion, imagen, latitud, longitud, categoria_id, municipio_id, entorno_id, direccion, horario)
VALUES

-- =====================================================
-- NEIVA (municipio_id = 19)
-- =====================================================

(
  'Parque Isla del Mohán',
  'Parque natural ubicado en una isla artificial sobre el río Magdalena, con más de 68 hectáreas de bosque seco tropical. Ofrece caminatas ecológicas, paseos en canoa, avistamiento de aves y deportes náuticos.',
  NULL,
  2.9350, -75.2980,
  1, 19, 6,
  'Av. Circunvalar con Calle 10, Neiva',
  'Martes a domingo 8:00 am - 5:00 pm'
),
(
  'Museo Arqueológico Regional del Huila',
  'Espacio de reconocimiento a las culturas prehispánicas que habitaron el Huila entre 1.000 a.C. y 1.550 d.C. Alberga más de 300 piezas entre estatuaria, orfebrería, cerámica, petroglifos y artefactos líticos.',
  NULL,
  2.9276, -75.2818,
  3, 19, 2,
  'Calle 21 No. 5-81, Centro de Convenciones José Eustasio Rivera, piso 2, Neiva',
  'Lunes a viernes 8:00 am - 12:00 m y 2:00 pm - 5:00 pm'
),
(
  'Centro Cultural y de Convenciones José Eustasio Rivera',
  'Complejo cultural construido en 1988 en honor al escritor huilense José Eustasio Rivera. Principal escenario cultural del departamento, con salas para eventos, conferencias, exposiciones de arte.',
  NULL,
  2.9276, -75.2818,
  2, 19, 2,
  'Carrera 5 No. 21-81, Neiva',
  'Lunes a viernes 8:00 am - 12:00 m y 2:00 pm - 6:00 pm'
),
(
  'Malecón Río Magdalena',
  'Extenso corredor peatonal paralelo al río Magdalena, corazón turístico de Neiva. Cuenta con plazoletas de artesanos, comidas típicas, canoeros, recreovías y zonas de ciclovía.',
  NULL,
  2.9340, -75.2960,
  2, 19, 6,
  'Av. Circunvalar, orillas del río Magdalena, Neiva',
  'Abierto las 24 horas'
),
(
  'Edificio Nacional de Neiva',
  'Joya arquitectónica patrimonial de estilo republicano ubicada en el centro histórico de Neiva. Actualmente alberga entidades gubernamentales.',
  NULL,
  2.9270, -75.2820,
  7, 19, 2,
  'Carrera 5 con Calle 8, Centro, Neiva',
  'Lunes a viernes 8:00 am - 5:00 pm'
),
(
  'Monumento Cacica La Gaitana y Museo Prehistórico Huilassik Park',
  'Monumento en honor a la cacica Timanco La Gaitana. El complejo incluye el Museo Prehistórico Huilassik Park con más de 57 figuras de animales prehistóricos.',
  NULL,
  2.9263, -75.2760,
  7, 19, 2,
  'Carrera 1 No. 2A-01, Neiva',
  'Martes a domingo 8:00 am - 12:00 m y 2:00 pm - 6:00 pm'
),
(
  'Monumento a la Raza',
  'Escultura monumental que rinde homenaje a las raíces culturales del pueblo huilense, símbolo de la identidad mestiza de la región.',
  NULL,
  2.9260, -75.2810,
  7, 19, 2,
  'Centro, Neiva',
  'Abierto las 24 horas'
),
(
  'Catedral de la Inmaculada Concepción',
  'Principal iglesia católica de Neiva, construida en estilo gótico. Patrimonio histórico y cultural declarado.',
  NULL,
  2.9263, -75.2891,
  6, 19, 2,
  'Carrera 4 con Calle 7, Parque Santander, Neiva',
  'Lunes a domingo 7:00 am - 7:00 pm'
),
(
  'Iglesia Colonial San José',
  'Templo colonial de gran valor arquitectónico e histórico. Parte del patrimonio religioso de la ciudad.',
  NULL,
  2.9255, -75.2830,
  6, 19, 2,
  'Centro histórico, Neiva',
  'Lunes a domingo 7:00 am - 6:00 pm'
),
(
  'Plaza Cívica Los Libertadores',
  'Espacio público emblemático del centro de Neiva donde convergen la historia, el comercio y la vida ciudadana.',
  NULL,
  2.9268, -75.2818,
  2, 19, 2,
  'Centro, Neiva',
  'Abierto las 24 horas'
),
(
  'Centro Comercial San Juan Plaza',
  'Centro comercial con amplia oferta de tiendas, restaurantes, cine y entretenimiento.',
  NULL,
  2.9380, -75.2840,
  9, 19, 2,
  'Neiva, Huila',
  'Lunes a domingo 10:00 am - 9:00 pm'
),
(
  'Centro Comercial San Pedro Plaza',
  'Centro comercial con variada oferta de tiendas de moda, gastronomía y servicios.',
  NULL,
  2.9290, -75.2780,
  9, 19, 2,
  'Neiva, Huila',
  'Lunes a domingo 10:00 am - 9:00 pm'
),
(
  'Centro Comercial Único Outlet Neiva',
  'Centro comercial outlet con marcas nacionales e internacionales a precios especiales.',
  NULL,
  2.9410, -75.2870,
  9, 19, 2,
  'Neiva, Huila',
  'Lunes a domingo 10:00 am - 9:00 pm'
),
(
  'Centro Comercial Santalucía Plaza',
  'Moderno centro comercial con amplia oferta de tiendas, restaurantes, zona de entretenimiento y cine.',
  NULL,
  2.9320, -75.2900,
  9, 19, 2,
  'Neiva, Huila',
  'Lunes a domingo 10:00 am - 9:00 pm'
),
(
  'Centro Recreacional Los Lagos - Comfamiliar',
  'Centro recreacional de Comfamiliar Huila con piscinas, zonas verdes, canchas deportivas y espacios de esparcimiento familiar.',
  NULL,
  2.9180, -75.2750,
  10, 19, 3,
  'Neiva, Huila',
  'Martes a domingo 9:00 am - 5:00 pm'
),
(
  'Playa Juncal - Parque Acuático',
  'El centro vacacional y parque acuático más grande del sur de Colombia, a 15 minutos de Neiva. Cuenta con piscina de olas, río lento, toboganes, cabañas.',
  NULL,
  2.8740, -75.3120,
  10, 19, 6,
  'Vía Neiva-Yaguará Km 15, Palermo, Huila',
  'Viernes a domingo 10:00 am - 5:00 pm'
),
(
  'Mirador Villarpe',
  'Uno de los miradores más populares del Huila, en el corregimiento El Caguán. Vista panorámica de la ciudad y el valle del Magdalena.',
  NULL,
  2.9850, -75.3200,
  1, 19, 4,
  'Corregimiento El Caguán, Neiva',
  'Jueves a domingo 10:00 am - 6:00 pm'
),
(
  'Montaña Mágica El Chapurro',
  'Mirador ecológico a 1.800 msnm que recrea la leyenda indígena Tama con una figura gigante de chapulín. Senderismo, camping, agroturismo.',
  NULL,
  2.9980, -75.3350,
  4, 19, 4,
  'Vereda El Chapurro, corregimiento El Caguán, Neiva',
  'Fines de semana y festivos 8:00 am - 5:00 pm'
),
(
  'Ecoparque Normandía',
  'Destino de turismo rural y ecoturismo en los alrededores de Neiva. Contacto con la naturaleza, zonas verdes y actividades al aire libre.',
  NULL,
  2.9550, -75.3100,
  1, 19, 3,
  'Neiva, Huila',
  'Fines de semana 9:00 am - 5:00 pm'
),
(
  'Parque Principal El Caguán',
  'Parque central del corregimiento El Caguán. Punto de encuentro comunitario con tradiciones culturales.',
  NULL,
  2.9900, -75.3300,
  2, 19, 1,
  'Corregimiento El Caguán, Neiva',
  'Abierto las 24 horas'
),
(
  'Mirador El Barcino',
  'Mirador con vista panorámica del valle de Neiva, restaurante de gastronomía típica, piscina y ambiente familiar.',
  NULL,
  2.9920, -75.3180,
  1, 19, 4,
  'Vía El Triunfo Sur, Neiva-Caguán, Caguán, Huila',
  'Fines de semana y festivos 10:00 am - 7:00 pm'
),

-- =====================================================
-- RIVERA (municipio_id = 26)
-- =====================================================

(
  'Termales Tierra de Promisión',
  'Reconocido centro termal con aguas que brotan a 70°C. Piscina termal, restaurante, bar. Propiedades medicinales.',
  NULL,
  2.7740, -75.2410,
  10, 26, 3,
  'Municipio de Rivera, Huila',
  'Todos los días 7:00 am - 11:00 pm'
),
(
  'Termales San Francisco',
  'Aguas termales con sales, bicarbonato y cloruros. Centro recreacional con senderos y bosque natural.',
  NULL,
  2.7620, -75.2200,
  10, 26, 3,
  'Vereda El Salado, Rivera, Huila',
  'Todos los días 7:00 am - 6:00 pm'
),
(
  'Termales Comfamiliar Rivera',
  'Centro termal de Comfamiliar Huila cerca del casco urbano. Piscinas con aguas termales medicinales.',
  NULL,
  2.7760, -75.2380,
  10, 26, 2,
  'Casco urbano, Rivera, Huila',
  'Consultar horarios'
),
(
  'Los Ángeles Termal',
  'Pequeño paraíso termal con fuente a 43°C, tres zonas diferenciadas. Alojamiento, restaurante, bar.',
  NULL,
  2.7680, -75.2350,
  10, 26, 3,
  'Municipio de Rivera, Huila',
  'Mañana 7:30-11:30, tarde 12-4, noche 5-10 pm'
),
(
  'Mirador Celeste',
  'Mirador con vistas panorámicas del valle del Magdalena y la cordillera Oriental.',
  NULL,
  2.7900, -75.2600,
  1, 26, 4,
  'Corredor turístico de Rivera, Huila',
  'Fines de semana y festivos'
),
(
  'Balcón El Vino',
  'Mirador con restaurante y bar. Degustación de vino artesanal, micheladas, plátanos y comidas rápidas.',
  NULL,
  2.8100, -75.2900,
  5, 26, 4,
  'Inspección La Ulloa, Rivera, Huila',
  'Jueves a domingo y festivos'
),
(
  'Mirador del Vino',
  'Uno de los miradores más grandes de Rivera. Vinos artesanales, micheladas, alojamiento, restaurante, piscinas naturales.',
  NULL,
  2.8120, -75.2920,
  1, 26, 4,
  'Sector La Ulloa, Rivera, Huila',
  'Jueves a domingo 10:00 am - 8:00 pm'
),
(
  'Mirador El Caracoly',
  'Mirador turístico con vistas del valle del Magdalena y las cordilleras. Parte de la Ruta del Vino.',
  NULL,
  2.8050, -75.2850,
  1, 26, 4,
  'Corredor La Ulloa, Rivera, Huila',
  'Fines de semana y festivos'
),
(
  'Mirador Arte y Vino',
  'Mirador con restaurante que combina gastronomía, vinos artesanales y arte.',
  NULL,
  2.8080, -75.2870,
  5, 26, 4,
  'Corregimiento La Ulloa, Rivera, Huila',
  'Jueves a domingo y festivos'
),
(
  'Balneario Finca Mis Potrillos',
  'Finca recreacional a 15 minutos de Neiva. Piscina, zonas verdes, actividades de recreación y tours.',
  NULL,
  2.8090, -75.2930,
  10, 26, 3,
  'Inspección La Ulloa, Rivera, Huila',
  'Fines de semana y festivos 9:00 am - 5:00 pm'
),
(
  'Balneario Rancho Tama',
  'Balneario de agua natural en un entorno campestre, ideal para un día de sol en familia.',
  NULL,
  2.7850, -75.2500,
  10, 26, 6,
  'Rivera, Huila',
  'Fines de semana y festivos'
),
(
  'Balneario La Tienda Montañera',
  'Balneario campestre con entorno montañoso y aguas naturales, complementado con tienda y gastronomía típica.',
  NULL,
  2.8000, -75.2750,
  10, 26, 3,
  'Corredor turístico Rivera-La Ulloa, Huila',
  'Fines de semana y festivos'
),
(
  'Balneario Cuatro',
  'Balneario natural de agua dulce en entorno rural.',
  NULL,
  2.7820, -75.2450,
  10, 26, 6,
  'Rivera, Huila',
  'Fines de semana y festivos'
),
(
  'Finca de Recreo La Divina',
  'Finca de recreo con piscina, hospedaje campestre, restaurante gourmet y típico, camping, zonas verdes.',
  NULL,
  2.8060, -75.2880,
  10, 26, 3,
  'Kilómetro 1.5 Vía Ulloa-Rivera, Rivera, Huila',
  'Todos los días 9:00 am - 6:00 pm'
),
(
  'Balneario La Honda',
  'Balneario de aguas naturales en el sector de La Ulloa.',
  NULL,
  2.8020, -75.2800,
  10, 26, 6,
  'Rivera, Huila',
  'Fines de semana y festivos'
),
(
  'Balneario Los Chorros',
  'Balneario natural con piscina, hospedaje campestre, restaurante, zonas verdes y parque infantil.',
  NULL,
  2.8110, -75.2960,
  10, 26, 7,
  'Vía Caguán-La Ulloa, Rivera, Huila',
  'Fines de semana y festivos 9:00 am - 5:00 pm'
),
(
  'Balneario San Samana',
  'Balneario de aguas naturales para disfrute familiar en entorno de naturaleza.',
  NULL,
  2.7900, -75.2550,
  10, 26, 6,
  'Rivera, Huila',
  'Fines de semana y festivos'
),
(
  'Iglesia Nuestra Señora del Perpetuo Socorro',
  'Principal templo católico de Rivera, símbolo religioso e histórico.',
  NULL,
  2.7745, -75.2402,
  6, 26, 2,
  'Centro, Rivera, Huila',
  'Lunes a domingo 7:00 am - 7:00 pm'
),
(
  'Casa de Campo La Cascada',
  'Finca hotel campestre, punto de partida para el sendero hacia la Cascada Salto del Ángel. Gastronomía local y hospedaje.',
  NULL,
  2.7600, -75.2150,
  10, 26, 4,
  'Rivera, Huila — acceso desde casco urbano hacia termales',
  'Reservas recomendadas'
),
(
  'Villa Stefany',
  'Casa de campo y centro recreativo con hospedaje campestre y actividades al aire libre.',
  NULL,
  2.7800, -75.2480,
  10, 26, 3,
  'Rivera, Huila',
  'Fines de semana y festivos'
),
(
  'Casa Campo El Cielo',
  'Finca recreacional con vista panorámica del valle y las montañas.',
  NULL,
  2.7950, -75.2650,
  10, 26, 4,
  'Rivera, Huila',
  'Fines de semana y festivos'
),
(
  'Casa Campo Los Kiosquitos',
  'Centro recreativo con kioscos y zonas verdes para el esparcimiento familiar.',
  NULL,
  2.7870, -75.2520,
  10, 26, 3,
  'Rivera, Huila',
  'Fines de semana y festivos'
),
(
  'Santuario Divino Niño Jesús',
  'Santuario religioso reconocido como destino de devoción y turismo religioso.',
  NULL,
  2.7755, -75.2415,
  6, 26, 2,
  'Rivera, Huila',
  'Lunes a domingo 7:00 am - 6:00 pm'
),
(
  'Cascada Salto del Ángel',
  'Espectacular cascada entre montañas, en las veredas Pedregal, Mesitas y Aguas Calientes. Ideal para ecoturismo.',
  NULL,
  2.7550, -75.2100,
  4, 26, 7,
  'Veredas Pedregal, Mesitas y Aguas Calientes, Rivera, Huila',
  'Con guía. Reservas recomendadas'
),
(
  'Cascada La Bocana',
  'Cascada de 15 metros en La Ulloa. Sendero de 6 km por cultivos de cacao y bosques de galería.',
  NULL,
  2.8150, -75.3050,
  4, 26, 7,
  'Corregimiento La Ulloa, Rivera, Huila',
  'Se recomienda guía local'
),
(
  'Sitio Arqueológico El Tambillo',
  'Tesoro arqueológico con más de 50 piedras talladas con petroglifos y tumbas prehispánicas.',
  NULL,
  2.7400, -75.1950,
  3, 26, 4,
  'Zona rural de Rivera, Huila',
  'Con guía. Reservas recomendadas'
),
(
  'Ruta del Cacao',
  'Sendero interpretativo por cultivos de cacao, combinando senderismo, avistamiento de aves y visita a fincas.',
  NULL,
  2.8100, -75.3000,
  1, 26, 1,
  'Corregimiento La Ulloa, Rivera, Huila',
  'Con guía comunitario'
),
(
  'Parque Central José Eustasio Rivera',
  'Parque principal del municipio, nombrado en honor al escritor José Eustasio Rivera, nacido aquí en 1888.',
  NULL,
  2.7748, -75.2406,
  7, 26, 2,
  'Centro, Rivera, Huila',
  'Abierto las 24 horas'
),
(
  'Cascada El Santuario',
  'Cascada en el sector de Las Termales, complementaria a la oferta termal.',
  NULL,
  2.7580, -75.2180,
  4, 26, 7,
  'Sector Las Termales, Rivera, Huila',
  'Se recomienda guía'
),
(
  'Sendero Primaveral',
  'Sendero ecológico que sale del casco urbano por la vía a termales, recorriendo quebradas, cultivos de café y caña panelera.',
  NULL,
  2.7680, -75.2280,
  4, 26, 4,
  'Sale del casco urbano hacia vía termales, veredas Llanitos',
  'Se recomienda guía'
),

-- =====================================================
-- PALERMO (municipio_id = 22)
-- =====================================================

(
  'Balneario La Mesa de Hernández',
  'Balneario sobre el río Baché, en un amplio terreno en forma de mesa. Ideal para recreación familiar.',
  NULL,
  2.9120, -75.3980,
  10, 22, 6,
  'Kilómetro 9 Vía Palermo - Santa María, Palermo, Huila',
  'Fines de semana y festivos'
),
(
  'Balneario El Pailón',
  'Charco natural sobre el río Baché, espacioso para recreación y descanso.',
  NULL,
  2.9080, -75.4020,
  10, 22, 6,
  '4 km del casco urbano vía Santa María, Palermo, Huila',
  'Fines de semana y festivos'
),
(
  'Malecón de Palermo',
  'Parque turístico de espacio público a orillas del río Magdalena, con senderos para disfrutar de la brisa del río.',
  NULL,
  2.8960, -75.4250,
  2, 22, 6,
  'Orillas del río Magdalena, Palermo, Huila',
  'Abierto las 24 horas'
),
(
  'Cañón de los Ídolos',
  'Formación natural del río Tune que esculpe una profunda piscina sobre rocas erosionadas.',
  NULL,
  2.8750, -75.4500,
  1, 22, 6,
  'Río Tune, zona rural de Palermo, Huila',
  'Se recomienda guía local'
),
(
  'Cascada de Palermo',
  'Cascada natural en la zona montañosa, rodeada de vegetación tropical.',
  NULL,
  2.8700, -75.4700,
  4, 22, 7,
  'Zona montañosa de Palermo, Huila',
  'Se recomienda guía'
),
(
  'Parque Principal de Palermo',
  'Corazón cívico e histórico con dos templos: uno colonial en piedra y uno en uso activo.',
  NULL,
  2.8929, -75.4358,
  7, 22, 2,
  'Centro, Palermo, Huila',
  'Abierto las 24 horas'
),
(
  'Kalapa Mirador',
  'Mirador nocturno ideal para observar estrellas y atardeceres, con vistas del valle del Magdalena.',
  NULL,
  2.9050, -75.4450,
  1, 22, 4,
  'Palermo, Huila',
  'Fines de semana y festivos'
),
(
  'Templo Colonial de Palermo',
  'Construcción en piedra tallada del siglo XVIII, declarado Patrimonio Arquitectónico del Huila.',
  NULL,
  2.8930, -75.4355,
  6, 22, 2,
  'Parque principal, Palermo, Huila',
  'Lunes a domingo 7:00 am - 6:00 pm'
),
(
  'Huiláfrica Salvaje',
  'Parque temático de agroturismo con zoocría de especies exóticas: búfalos, pirarucos, babillas, avestruces, chigüiros.',
  NULL,
  2.8780, -75.4180,
  1, 22, 1,
  'Kilómetro 1 Vía Neiva-Palermo, Palermo, Huila',
  'Fines de semana y festivos 9:00 am - 5:00 pm'
),
(
  'Centro Vacacional SpiritLand Ecopark',
  'Centro vacacional temático con el Cristo más grande de Suramérica (80 m), cascadas, lago de pesca, tirolesas, replicas arqueológicas.',
  NULL,
  2.8810, -75.4200,
  4, 22, 3,
  'Vereda El Juncal Km 13, vía Huiláfrica Salvaje, Palermo, Huila',
  'Todos los días 9:00 am - 5:00 pm'
),
(
  'La Palermosa',
  'Atractivo turístico y recreativo al aire libre, parte de la identidad cultural de Palermo.',
  NULL,
  2.8900, -75.4320,
  10, 22, 3,
  'Palermo, Huila',
  'Fines de semana y festivos'
),
(
  'Camino Real de Buenos Aires',
  'Tramo histórico del Camino Real colonial que unía Santafé con Popayán. Patrimonio histórico.',
  NULL,
  2.8880, -75.4480,
  7, 22, 1,
  'Sector Buenos Aires, Palermo, Huila',
  'Acceso libre'
),
(
  'Charco del Boquerón y El Poira',
  'Grandes charcos naturales sobre el río Baché. El Poira es un personaje mitológico guardián de charcos profundos.',
  NULL,
  2.8840, -75.4100,
  10, 22, 6,
  'Límite Palermo - Neiva, orillas del río Baché, Huila',
  'Acceso libre'
),

-- =====================================================
-- CAMPOALEGRE (municipio_id = 6)
-- =====================================================

(
  'Mirador El Refugio del Nómada',
  'Mirador a 2.200 msnm con vistas de varios municipios, la Represa de Betania, el Nevado del Huila y el Cerro del Pacande.',
  NULL,
  2.6420, -75.2800,
  1, 6, 4,
  'Vereda El Roble, 18 km del casco urbano, Campoalegre, Huila',
  'Fines de semana y festivos'
),
(
  'Parque Natural La Siberia',
  'Ecosistema estratégico en la cordillera Oriental a 2.600 msnm, nacimiento de importantes afluentes hídricos.',
  NULL,
  2.6200, -75.2400,
  1, 6, 4,
  'Cordillera Oriental, zona rural de Campoalegre, Huila',
  'Se recomienda guía local'
),
(
  'Embalse de Betania',
  'Gigantesco embalse compartido entre Campoalegre, Hobo y Yaguará. Deportes náuticos, pesca deportiva, paseos en lancha.',
  NULL,
  2.6600, -75.4200,
  1, 6, 6,
  'Límites de Campoalegre, Hobo y Yaguará, Huila',
  'Abierto todos los días'
),
(
  'Parque Museo del Arroz',
  'Museo dedicado a la historia y producción del arroz, producto emblema de la "Capital Arrocera del Huila".',
  NULL,
  2.6850, -75.3300,
  2, 6, 1,
  'Hacienda Potosí, Campoalegre, Huila',
  'Martes a domingo'
),
(
  'Cabaña Cleves',
  'Cabaña campestre en el corredor turístico, ideal para descanso y disfrute del paisaje arrocero.',
  NULL,
  2.6750, -75.3150,
  10, 6, 1,
  'Campoalegre, Huila',
  'Fines de semana y festivos'
),
(
  'Arena y Sol - Tinas de Agua Climatizadas',
  'Centro recreativo con tinas de agua climatizada, ideal para relajación en familia o pareja.',
  NULL,
  2.6900, -75.3400,
  10, 6, 3,
  'Campoalegre, Huila',
  'Fines de semana y festivos'
),
(
  'Capilla Santa Laura',
  'Capilla religiosa parte del patrimonio religioso y cultural de Campoalegre.',
  NULL,
  2.6860, -75.3260,
  6, 6, 1,
  'Campoalegre, Huila',
  'Lunes a domingo 7:00 am - 6:00 pm'
),
(
  'San Antonio (Campoalegre)',
  'Sitio turístico y recreativo en entorno campestre arrocero.',
  NULL,
  2.6780, -75.3180,
  10, 6, 1,
  'Campoalegre, Huila',
  'Fines de semana y festivos'
),
(
  'La Granja de Pedro',
  'Finca recreacional y agroecoturística para familias, contacto con producción agropecuaria.',
  NULL,
  2.6820, -75.3220,
  1, 6, 1,
  'Campoalegre, Huila',
  'Fines de semana y festivos'
),
(
  'Los Potrillos (Campoalegre)',
  'Centro recreativo campestre con espacios para disfrute familiar en la naturaleza.',
  NULL,
  2.6910, -75.3350,
  10, 6, 1,
  'Campoalegre, Huila',
  'Fines de semana y festivos'
),
(
  'MonteCafé - Mirador',
  'Mirador con vocación cafetera, vistas del valle arrocero y las montañas, experiencias de café.',
  NULL,
  2.6600, -75.3000,
  1, 6, 4,
  'Zona montañosa de Campoalegre, Huila',
  'Fines de semana y festivos'
),
(
  'Casa Bohemia - Resort de Cerveza y Vino',
  'Hotel campestre de 4 estrellas con viñedo propio, cerveza artesanal, spa de cerveza único en Colombia.',
  NULL,
  2.7050, -75.3400,
  5, 6, 4,
  'Km 22 Vía Neiva-Campoalegre, desvío Vereda Potosí, Campoalegre',
  'Todos los días'
),

-- =====================================================
-- HOBO (municipio_id = 13)
-- =====================================================

(
  'Parque Central Simón Bolívar',
  'Corazón cívico del municipio "Corazón del Huila". Sede del Festival de San Juan y San Pedro.',
  NULL,
  2.5583, -75.4489,
  7, 13, 2,
  'Centro, Hobo, Huila',
  'Abierto las 24 horas'
),
(
  'Charco Los Cristales',
  'Cascada de aguas cristalinas a 3.5 km del casco urbano, ideal para barranquismo.',
  NULL,
  2.5700, -75.4300,
  4, 13, 7,
  'Vereda Agua Fría, Hobo, Huila',
  'Se recomienda guía local'
),
(
  'Cascada El Poira',
  'Cascada de 20 metros en el Parque Los Pinos, nombre del personaje mitológico guardián de ríos.',
  NULL,
  2.5450, -75.4100,
  4, 13, 7,
  'Zona montañosa, Hobo, Huila',
  'Se recomienda guía'
),
(
  'Club Mediterráneo',
  'Centro recreativo a orillas de la Represa de Betania con piscina, bar, camping y pesca deportiva.',
  NULL,
  2.5520, -75.4580,
  10, 13, 6,
  '1 km del casco urbano, vía Puerto Mómico, Hobo, Huila',
  'Todos los días 8:00 am - 8:00 pm'
),
(
  'Parroquia San Juan Bautista',
  'Principal templo católico de Hobo, centro espiritual y punto de partida de las festividades patronales.',
  NULL,
  2.5585, -75.4487,
  6, 13, 2,
  'Centro, Hobo, Huila',
  'Lunes a domingo 7:00 am - 7:00 pm'
),
(
  'Parque Agroecoturístico Los Pinos',
  'Refugio sustentable de 300 hectáreas con senderos ecológicos, glamping, cabañas, restaurante, apicultura, ruta del cacao.',
  NULL,
  2.5380, -75.4050,
  1, 13, 4,
  'Vereda Bajo Estoracal, Hobo, Huila',
  'Todos los días'
),
(
  'Ruta de Senderismo en Hobo',
  'Red de senderos por paisajes montañosos, cafetaleros y ribereños, con vistas del embalse de Betania.',
  NULL,
  2.5500, -75.4200,
  4, 13, 4,
  'Zona rural de Hobo, Huila',
  'Se recomienda guía local'
),
(
  'Puerto Mómico',
  'Puerto turístico a orillas del embalse de Betania, con paseos en lancha, pesca deportiva, piscina, camping.',
  NULL,
  2.5490, -75.4620,
  10, 13, 6,
  '1.5 km del casco urbano, Hobo, Huila',
  'Todos los días'
),
(
  'Finca La Chamba',
  'Finca recreacional municipal con piscina, bar y restaurante en entorno campestre.',
  NULL,
  2.5560, -75.4420,
  10, 13, 1,
  'Vereda Centro, Hobo, Huila',
  'Fines de semana y festivos'
),

-- =====================================================
-- COLOMBIA (municipio_id = 7)
-- =====================================================

(
  'Cascada La Promesa',
  'Cascada de 20 metros en zona montañosa, rodeada de bosques.',
  NULL,
  1.9050, -75.7900,
  4, 7, 7,
  'Zona rural, Colombia, Huila',
  'Se recomienda guía local'
),
(
  'Cascada Las Tres Marías',
  'Salto de agua en la vereda El Valle, con caídas consecutivas sobre la quebrada San Francisco.',
  NULL,
  1.9300, -75.8200,
  4, 7, 7,
  'Vereda El Valle, Colombia, Huila',
  'Se recomienda guía local'
),
(
  'Bosque Sub Xerofítico de Colombia',
  'Ecosistema singular de vegetación adaptada a baja humedad, bosque seco subandino.',
  NULL,
  1.9100, -75.8100,
  1, 7, 3,
  'Zona rural, Colombia, Huila',
  'Acceso libre con precaución'
),
(
  'Laguna Tembladora',
  'Laguna natural en zona montañosa, rodeada de paisajes andinos.',
  NULL,
  1.8900, -75.7800,
  1, 7, 4,
  'Zona montañosa, Colombia, Huila',
  'Se recomienda guía local'
),
(
  'Museo Arqueológico de Santana',
  'Museo con orfebrería, artefactos líticos, cerámica y estatuaria del Valle Alto del Río Cabrera.',
  NULL,
  1.9500, -75.7600,
  3, 7, 1,
  'Corregimiento de Santana, Colombia, Huila',
  'Lunes a viernes 8:00 am - 5:00 pm'
),

-- =====================================================
-- ÍQUIRA (municipio_id = 14)
-- =====================================================

(
  'Parque Principal de Íquira',
  'Corazón cívico e histórico de Íquira, "La ciudad luz del Huila". Fundado en 1694.',
  NULL,
  2.6097, -75.5736,
  7, 14, 2,
  'Centro, Íquira, Huila',
  'Abierto las 24 horas'
),
(
  'Baños Termales de Íquira',
  'Aguas termales con propiedades terapéuticas, en las estribaciones del Nevado del Huila.',
  NULL,
  2.6050, -75.5800,
  10, 14, 3,
  'Municipio de Íquira, Huila',
  'Consultar horarios'
),
(
  'Reserva Forestal de Tarpeya',
  'Reserva natural sede operativa del PNN Nevado del Huila, con senderos por bosque andino y subpáramo.',
  NULL,
  2.5800, -75.6200,
  1, 14, 4,
  'Vereda Juancho, 6 km del casco urbano, Íquira, Huila',
  'Se recomienda guía y permiso del PNN'
),
(
  'Cuevas del Chaparro',
  'Sistema de cuevas naturales para espeleología en la zona montañosa.',
  NULL,
  2.6150, -75.5900,
  4, 14, 4,
  'Zona rural, Íquira, Huila',
  'Se recomienda guía local'
),
(
  'Loma de la Cruz',
  'Mirador natural con vista panorámica del casco urbano, valles y montañas.',
  NULL,
  2.6120, -75.5750,
  1, 14, 4,
  'Íquira, Huila',
  'Acceso libre'
),

-- =====================================================
-- SANTA MARÍA (municipio_id = 28)
-- =====================================================

(
  'La Morada del Viento',
  'Mirador con vista al valle del río Baché y paisajes cafeteros. Emprendimiento local muy reconocido.',
  NULL,
  2.9200, -75.5400,
  1, 28, 4,
  'Santa María, Huila',
  'Fines de semana y festivos'
),
(
  'Mirador El Taita del Huila',
  'Mirador turístico con vistas panorámicas de las montañas del noroccidente del Huila.',
  NULL,
  2.9150, -75.5350,
  1, 28, 4,
  'Santa María, Huila',
  'Fines de semana y festivos'
),
(
  'Portal del Sol',
  'Restaurante y mirador con vista al paisaje cafetero del "pueblo cafetero del Huila".',
  NULL,
  2.9250, -75.5300,
  5, 28, 4,
  'Santa María, Huila',
  'Martes a domingo'
),
(
  'Río Baché',
  'Cañón natural del río Baché, apto para rafting y deportes de aventura acuática.',
  NULL,
  2.9300, -75.5200,
  4, 28, 6,
  'Vía Neiva - Santa María, Huila',
  'Abierto todos los días'
),
(
  'Mirador Santa Teresa',
  'Vereda con miradores que permiten contemplar el valle del Magdalena y municipios vecinos.',
  NULL,
  2.9400, -75.5450,
  1, 28, 4,
  'Vereda Santa Teresa, 12 km del casco urbano, Santa María, Huila',
  'Acceso libre'
),
(
  'Finca La Constancia',
  'Finca agroturística familiar convertida en reserva natural. Producción de café artesanal, pesca deportiva, restaurante, senderismo.',
  NULL,
  2.9100, -75.5250,
  1, 28, 1,
  'Santa María, Huila',
  'Reservas recomendadas'
),

-- =====================================================
-- TELLO (municipio_id = 32)
-- =====================================================

(
  'Quebrada El Aceite',
  'Vertiente natural con charcos tipo piscina y fósiles en las rocas.',
  NULL,
  3.0600, -75.1200,
  1, 32, 6,
  'A pocos kilómetros del casco urbano, Tello, Huila',
  'Se recomienda guía local'
),
(
  'Cerro Cucara',
  'Cerro mítico asociado a leyendas indígenas, sitio de culto de los aborígenes.',
  NULL,
  3.0500, -75.1350,
  2, 32, 4,
  'Zona rural, Tello, Huila',
  'Acceso libre'
),
(
  'Las Fumarolas de Tello',
  'Fenómeno geológico único: colina que emite humo debido a combustión de rocas carboníferas.',
  NULL,
  3.0700, -75.1100,
  1, 32, 1,
  'Vereda El Tomo, Tello, Huila',
  'Se recomienda guía'
),
(
  'Parque Principal de Tello',
  'Corazón histórico de "El Viñedo del Huila", rodeado de casas coloridas. Cuna del Beato Gaspar Páez Perdomo.',
  NULL,
  3.0544, -75.1289,
  7, 32, 2,
  'Centro, Tello, Huila',
  'Abierto las 24 horas'
),
(
  'Iglesia de Tello',
  'Templo parroquial de estilo colonial, con torre inclinada por el terremoto de 1967.',
  NULL,
  3.0542, -75.1285,
  6, 32, 2,
  'Centro, Tello, Huila',
  'Lunes a domingo 7:00 am - 7:00 pm'
),

-- =====================================================
-- TERUEL (municipio_id = 33)
-- =====================================================

(
  'Cascada El Totí',
  'Cascada natural rodeada de vegetación en el "Paraíso Cafetero del Huila".',
  NULL,
  2.7200, -75.5800,
  4, 33, 7,
  'Vereda El Totí, Teruel, Huila',
  'Se recomienda guía local'
),
(
  'Río Pedernal',
  'Río de aguas cristalinas que ofrece charcos naturales para baño y pesca.',
  NULL,
  2.7400, -75.5650,
  1, 33, 6,
  'Municipio de Teruel, Huila',
  'Acceso libre'
),
(
  'Iglesia Parroquial Nuestra Señora de la Candelaria',
  'Templo de estilo gótico con una sola torre en punta de lápiz, patrona del municipio.',
  NULL,
  2.7340, -75.5756,
  6, 33, 2,
  'Centro, Teruel, Huila',
  'Lunes a domingo 7:00 am - 7:00 pm'
),
(
  'Vereda El Almorzadero',
  'Vereda con paisajes cafeteros y montañosos, representativa del agroturismo de Teruel.',
  NULL,
  2.7100, -75.5900,
  1, 33, 4,
  'Vereda El Almorzadero, Teruel, Huila',
  'Acceso libre'
),

-- =====================================================
-- VILLAVIEJA (municipio_id = 36)
-- =====================================================

(
  'Desierto de la Tatacoa (Sector El Cardón, El Cuzco, Los Hoyos)',
  'Segunda zona árida más extensa de Colombia, bosque seco tropical, destino Starlight UNESCO.',
  NULL,
  3.2300, -75.1700,
  1, 36, 5,
  'Desierto de la Tatacoa, Villavieja, Huila',
  'Todos los días'
),
(
  'Capilla de Santa Bárbara',
  'Capilla colonial más antigua del Huila (1606-1748), hoy alberga el Museo Paleontológico.',
  NULL,
  3.2189, -75.2183,
  7, 36, 2,
  'Carrera 3 No. 3-28, frente al parque central, Villavieja, Huila',
  'Martes a domingo 8:00 am - 5:00 pm'
),
(
  'Cementerio Pijao',
  'Sitio arqueológico con vestigios de la cultura indígena Pijao.',
  NULL,
  3.2150, -75.2200,
  3, 36, 2,
  'Villavieja, Huila',
  'Consultar horarios'
),
(
  'Estación del Ferrocarril de Villavieja',
  'Histórica estación del ferrocarril, testigo de la época de auge del transporte férreo.',
  NULL,
  3.2200, -75.2160,
  7, 36, 2,
  'Villavieja, Huila',
  'Consultar horarios'
),
(
  'Observatorio Astronómico de la Tatacoa - OATA',
  'Primer observatorio astronómico del desierto, con más de 16 años de trayectoria. Charlas nocturnas.',
  NULL,
  3.2400, -75.1800,
  8, 36, 5,
  'Sector El Cuzco, Desierto de la Tatacoa, Villavieja, Huila',
  'Lunes a domingo 6:00 pm - 10:00 pm'
),
(
  'Observatorio Astronómico Astrosur',
  'Segundo observatorio astronómico, dirigido por el profesor Javier Fernando Rúa Restrepo.',
  NULL,
  3.2380, -75.1780,
  8, 36, 5,
  'Desierto de la Tatacoa, Villavieja, Huila',
  'Consultar horarios'
),
(
  'Museo Paleontológico de Villavieja',
  'Museo con 950 piezas originales de fauna y flora del Mioceno (hace 15 millones de años).',
  NULL,
  3.2189, -75.2183,
  3, 36, 2,
  'Carrera 3 No. 3-28, Villavieja, Huila',
  'Martes a domingo 8:00 am - 5:00 pm'
),
(
  'Museo de Historia Natural La Tatacoa',
  'Museo dedicado al ecosistema del bosque seco tropical de la Tatacoa.',
  NULL,
  3.2185, -75.2180,
  3, 36, 2,
  'Villavieja, Huila',
  'Martes a domingo'
),
(
  'Museo La Tormenta',
  'Museo artesanal en el casco urbano, parte del city tour de Villavieja.',
  NULL,
  3.2180, -75.2175,
  2, 36, 2,
  'Villavieja, Huila',
  'Consultar horarios'
),
(
  'Piscina Los Hoyos',
  'Charcos y piscinas naturales en el sector Los Hoyos del desierto, ideales para refrescarse.',
  NULL,
  3.2500, -75.1650,
  1, 36, 5,
  'Sector Los Hoyos, Desierto de la Tatacoa, Villavieja, Huila',
  'Todos los días'
),
(
  'Casa del Totumo',
  'Museo artesanal de artesanías elaboradas con totumo, material tradicional de la región.',
  NULL,
  3.2185, -75.2178,
  2, 36, 2,
  'Carrera 1 No. 2A-01, Villavieja, Huila',
  'Lunes a domingo 8:00 am - 6:00 pm'
),
(
  'Sendero Interpretativo Arqueológico Doce',
  'Sendero que combina geología, paleontología y arqueología en el desierto.',
  NULL,
  3.2350, -75.1900,
  3, 36, 5,
  'Desierto de la Tatacoa, Villavieja, Huila',
  'Con guía local'
),
(
  'Quebrada Lajas',
  'Quebrada natural que cruza el municipio, rodeada de bosque seco tropical.',
  NULL,
  3.2100, -75.2250,
  1, 36, 6,
  'Sur del municipio de Villavieja, Huila',
  'Todos los días'
),
(
  'Puente de Golondrinas',
  'Estructura histórica dentro del circuito turístico de Villavieja.',
  NULL,
  3.2170, -75.2200,
  7, 36, 2,
  'Villavieja, Huila',
  'Acceso libre'
),
(
  'PNR Ecorregión La Tatacoa',
  'Parque Natural Regional que protege el ecosistema del bosque seco tropical de la Tatacoa.',
  NULL,
  3.2300, -75.1700,
  1, 36, 5,
  'Municipio de Villavieja, Huila',
  'Con guías certificados'
),

-- =====================================================
-- YAGUARÁ (municipio_id = 37)
-- =====================================================

(
  'Cascada La María',
  'Cascada natural en la "Capital Turística y Ganadera del Huila".',
  NULL,
  2.6580, -75.5200,
  4, 37, 7,
  'Zona rural, Yaguará, Huila',
  'Se recomienda guía'
),
(
  'Charco El Bejuco',
  'Piscinas naturales con caídas de agua rodeadas de bejucos, muy visitadas.',
  NULL,
  2.6620, -75.5050,
  10, 37, 6,
  'Yaguará, Huila',
  'Todos los días'
),
(
  'Cueva del Amor',
  'Cueva dentro del embalse de Betania, accesible por vía fluvial. Nombre dado por ingenieros italianos.',
  NULL,
  2.6500, -75.5400,
  4, 37, 6,
  'Embalse de Betania, acceso por vía fluvial, Yaguará, Huila',
  'Acceso en lancha'
),
(
  'Cueva del Tigre',
  'Caverna de 710 metros con fósiles, estalactitas, estalagmitas y una quebrada interna para barranquismo.',
  NULL,
  2.6700, -75.5000,
  4, 37, 3,
  'Zona rural, Yaguará, Huila — acceso vía Íquira',
  'Con guía especializado'
),
(
  'El Malecón de Yaguará',
  'Zona natural a orillas del embalse de Betania, con caminatas ecológicas y avistamiento de aves.',
  NULL,
  2.6660, -75.5180,
  1, 37, 6,
  'Casco urbano de Yaguará',
  'Abierto las 24 horas'
),
(
  'Embalse y Represa de Betania',
  'Gigantesca represa de 7.400 hectáreas, ofrece deportes náuticos, pesca deportiva, paseos en lancha.',
  NULL,
  2.6500, -75.5300,
  1, 37, 6,
  'Municipio de Yaguará, Huila',
  'Todos los días'
),
(
  'Iglesia Santa Ana',
  'Templo parroquial de estilo neogótico, considerado uno de los más bellos del Huila.',
  NULL,
  2.6668, -75.5130,
  6, 37, 2,
  'Centro, frente al parque Ángel María Paredes, Yaguará, Huila',
  'Lunes a domingo 7:00 am - 7:00 pm'
),
(
  'Loma de San Pedro',
  'Mirador natural con vistas del embalse de Betania y las montañas.',
  NULL,
  2.6750, -75.5100,
  1, 37, 4,
  'Zona rural, Yaguará, Huila',
  'Acceso libre'
),
(
  'Ruta Ciclista "Anillo de Yaguará"',
  'Ruta ciclística alrededor del embalse, que incluye el malecón, la Loma de San Pedro y el Mirador El Cucharo.',
  NULL,
  2.6667, -75.5131,
  4, 37, 6,
  'Municipio de Yaguará, Huila',
  'Todos los días'
),
(
  'Las Juntas y Balnearios El Tomo',
  'Balnearios naturales a 15 minutos del casco urbano, con playas y pozos naturales.',
  NULL,
  2.6800, -75.4900,
  10, 37, 6,
  '15 minutos del casco urbano, Yaguará, Huila',
  'Todos los días'
),
(
  'Moyas de Chichayaco',
  'Cascada de 7 metros para descenso en cuerdas, a 4.5 km del sendero ecológico.',
  NULL,
  2.6600, -75.5080,
  4, 37, 7,
  '4.5 km del sendero ecológico, Yaguará, Huila',
  'Con guía local'
),
(
  'Parque Ángel María Paredes',
  'Parque central de Yaguará, rodeado de samanes y alamedas.',
  NULL,
  2.6668, -75.5128,
  2, 37, 2,
  'Centro, Yaguará, Huila',
  'Abierto las 24 horas'
),
(
  'Quesillos Yaguareños',
  'Tradición gastronómica: fábricas de quesillo artesanal, acompañado de achiras, cucas y mistela.',
  NULL,
  2.6665, -75.5130,
  5, 37, 2,
  'Centro, Yaguará, Huila',
  'Lunes a domingo'
),
(
  'Río El Callejón - Sitio El Caimán',
  'Tramo del río Callejón con playas y pozos de 3-4 metros profundidad, rodeado de bosque seco tropical.',
  NULL,
  2.6720, -75.5020,
  10, 37, 6,
  'Vía Íquira, vereda La Floresta, Yaguará, Huila',
  'Todos los días'
),

-- =====================================================
-- ACEVEDO (municipio_id = 1)
-- =====================================================

(
  'Cascada de Bordones',
  'Una de las cascadas más altas de Colombia (>400 m) en la vereda San José. Senderismo y fotografía.',
  NULL,
  1.8380, -76.0620,
  1, 1, 7,
  'Vereda San José, Acevedo, Huila',
  'Acceso con guía'
),
(
  'Páramo de Miraflores',
  'Ecosistema de alta montaña con frailejones, fuente hídrica, trekking ecológico.',
  NULL,
  1.9000, -76.0000,
  1, 1, 4,
  'Zona rural, Acevedo, Huila',
  'Acceso con guía'
),
(
  'Cascada del Mortiño',
  'Destino natural poco explorado, rodeado de bosque húmedo y senderos rurales.',
  NULL,
  1.8500, -76.0400,
  1, 1, 7,
  'Acevedo, Huila',
  'Todos los días'
),
(
  'Río Suaza - Sector Recreativo',
  'Zona del río Suaza para baño, tubing y actividades recreativas.',
  NULL,
  1.8300, -76.0500,
  1, 1, 6,
  'Río Suaza, Acevedo, Huila',
  'Todos los días'
),

-- =====================================================
-- AIPE (municipio_id = 2)
-- =====================================================

(
  'Cañón de Pipilicua',
  'Formación natural imponente con paredes rocosas y paisajes áridos, ideal para senderismo.',
  NULL,
  3.2200, -75.2300,
  4, 2, 4,
  'Aipe, Huila',
  'Acceso con guía'
),
(
  'Sendero Chicalá',
  'Ruta ecológica en zona semiárida, con vegetación típica del desierto huilense.',
  NULL,
  3.2100, -75.2400,
  1, 2, 3,
  'Aipe, Huila',
  'Todos los días'
),
(
  'Río Magdalena - Sector Aipe',
  'Zona del río Magdalena para pesca, kayak y turismo rural.',
  NULL,
  3.2200, -75.2500,
  1, 2, 6,
  'Aipe, Huila',
  'Todos los días'
),

-- =====================================================
-- ALGECIRAS (municipio_id = 3)
-- =====================================================

(
  'Cañón de Pericongo',
  'Escenario histórico y natural rodeado de montañas, senderismo y turismo histórico.',
  NULL,
  2.5300, -75.3200,
  7, 3, 4,
  'Algeciras, Huila',
  'Todos los días'
),
(
  'Quebrada La Cristalina',
  'Fuente hídrica de aguas claras, ideal para baño y caminatas ecológicas.',
  NULL,
  2.5400, -75.3100,
  1, 3, 6,
  'Algeciras, Huila',
  'Todos los días'
),
(
  'Mirador Zathura',
  'Mirador con vista panorámica del paisaje montañoso de Algeciras.',
  NULL,
  2.5500, -75.3300,
  1, 3, 4,
  'Algeciras, Huila',
  'Fines de semana'
),

-- =====================================================
-- ALTAMIRA (municipio_id = 4)
-- =====================================================

(
  'Laguna de Altamira',
  'Espejo de agua natural para pesca artesanal y caminatas en ambiente tranquilo.',
  NULL,
  2.0600, -75.8000,
  1, 4, 3,
  'Altamira, Huila',
  'Todos los días'
),
(
  'Río Magdalena - Altamira',
  'Tramo del río Magdalena para pesca y recreación, rodeado de paisajes rurales.',
  NULL,
  2.0700, -75.7900,
  1, 4, 6,
  'Altamira, Huila',
  'Todos los días'
),

-- =====================================================
-- BARAYA (municipio_id = 5)
-- =====================================================

(
  'Salto del Guarocó',
  'Cascada natural rodeada de vegetación en zona rural, senderismo y fotografía.',
  NULL,
  3.1500, -75.0500,
  4, 5, 7,
  'Baraya, Huila',
  'Acceso con guía'
),
(
  'Laguna de las Nubes',
  'Espejo de agua en zona montañosa, rodeado de neblina, ideal para avistamiento de aves.',
  NULL,
  3.1200, -75.0200,
  1, 5, 4,
  'Zona rural de Baraya, Huila',
  'Todos los días'
),
(
  'Río Guarocó',
  'Río de aguas limpias para baño y recreación familiar.',
  NULL,
  3.1400, -75.0400,
  1, 5, 6,
  'Baraya, Huila',
  'Todos los días'
),

-- =====================================================
-- ELÍAS (municipio_id = 8)
-- =====================================================

(
  'Río Suaza - Elías',
  'Zona del río Suaza rodeada de paisajes cafeteros y montañosos, para baño y descanso.',
  NULL,
  2.0500, -75.9300,
  1, 8, 6,
  'Elías, Huila',
  'Todos los días'
),
(
  'Cascadas Rurales de Elías',
  'Conjunto de cascadas escondidas en la zona rural, senderismo y ecoturismo.',
  NULL,
  2.0600, -75.9200,
  4, 8, 7,
  'Zona rural de Elías',
  'Acceso con guía'
),

-- =====================================================
-- EL AGRADO (municipio_id = 9)
-- =====================================================

(
  'Río Magdalena - El Agrado',
  'Tramo del río Magdalena para pesca artesanal y baño, destino tranquilo.',
  NULL,
  2.2600, -75.7700,
  1, 9, 6,
  'El Agrado, Huila',
  'Todos los días'
),
(
  'Balnearios Naturales de El Agrado',
  'Espacios naturales sobre ríos y quebradas para recreación y turismo familiar.',
  NULL,
  2.2500, -75.7800,
  10, 9, 6,
  'El Agrado, Huila',
  'Todos los días'
),

-- =====================================================
-- GARZÓN (municipio_id = 10)
-- =====================================================

(
  'Mano del Gigante',
  'Mirador icónico con una gigantesca mano que simula sostener a los visitantes. Vistas espectaculares del valle.',
  NULL,
  2.1800, -75.6300,
  4, 10, 4,
  'Garzón, Huila',
  'Todos los días'
),
(
  'Represa de Betania - Garzón',
  'Zona del embalse para deportes acuáticos, pesca y turismo.',
  NULL,
  2.1700, -75.6500,
  1, 10, 6,
  'Garzón, Huila',
  'Todos los días'
),

-- =====================================================
-- GIGANTE (municipio_id = 11)
-- =====================================================

(
  'Mano del Gigante - Gigante',
  'Acceso alternativo a la Mano del Gigante desde Gigante, con vistas del embalse de Betania.',
  NULL,
  2.2000, -75.6200,
  4, 11, 4,
  'Gigante, Huila',
  'Todos los días'
),
(
  'Río Magdalena - Gigante',
  'Zona del río Magdalena para pesca y turismo rural.',
  NULL,
  2.2100, -75.6100,
  1, 11, 6,
  'Gigante, Huila',
  'Todos los días'
),

-- =====================================================
-- GUADALUPE (municipio_id = 12)
-- =====================================================

(
  'Cascadas de Guadalupe',
  'Conjunto de cascadas naturales en zona rural, senderismo y turismo ecológico.',
  NULL,
  2.0200, -75.7500,
  4, 12, 7,
  'Guadalupe, Huila',
  'Todos los días'
),
(
  'Río Suaza - Guadalupe',
  'Tramo del río Suaza para baño y recreación.',
  NULL,
  2.0300, -75.7400,
  1, 12, 6,
  'Guadalupe, Huila',
  'Todos los días'
),

-- =====================================================
-- ISNOS (municipio_id = 15)
-- =====================================================

(
  'Alto de los Ídolos',
  'Parque arqueológico con estatuas funerarias y tumbas de culturas prehispánicas. Patrimonio Mundial.',
  NULL,
  1.9200, -76.2400,
  3, 15, 4,
  'Isnos, Huila',
  'Todos los días'
),
(
  'Estrecho del Magdalena',
  'Uno de los puntos más angostos del río Magdalena, donde su caudal se reduce a pocos metros.',
  NULL,
  1.9100, -76.2300,
  1, 15, 6,
  'Isnos, Huila',
  'Todos los días'
),

-- =====================================================
-- LA ARGENTINA (municipio_id = 16)
-- =====================================================

(
  'Cascadas Rurales de La Argentina',
  'Conjunto de cascadas entre montañas y cafetales, senderismo, fotografía y contacto con la naturaleza.',
  NULL,
  2.2000, -76.0000,
  4, 16, 7,
  'Zona rural, La Argentina, Huila',
  'Acceso con guía'
),
(
  'Miradores Naturales de La Argentina',
  'Puntos estratégicos en la zona montañosa con vistas del paisaje rural y cafetero.',
  NULL,
  2.2100, -75.9900,
  1, 16, 4,
  'La Argentina, Huila',
  'Todos los días'
),

-- =====================================================
-- LA PLATA (municipio_id = 17)
-- =====================================================

(
  'Río La Plata',
  'Río que ofrece espacios para recreación, baño y turismo rural.',
  NULL,
  2.3900, -75.8900,
  1, 17, 6,
  'La Plata, Huila',
  'Todos los días'
),
(
  'Cascadas de La Plata',
  'Cascadas naturales en la zona rural para ecoturismo, caminatas y fotografía.',
  NULL,
  2.3800, -75.9000,
  4, 17, 7,
  'Zona rural, La Plata, Huila',
  'Todos los días'
),

-- =====================================================
-- NÁTAGA (municipio_id = 18)
-- =====================================================

(
  'Cascadas de Nátaga',
  'Destino natural rodeado de vegetación para turismo ecológico y senderismo.',
  NULL,
  2.5300, -75.8100,
  4, 18, 7,
  'Nátaga, Huila',
  'Todos los días'
),
(
  'Miradores de Nátaga',
  'Puntos elevados con vistas panorámicas de la región montañosa.',
  NULL,
  2.5400, -75.8000,
  1, 18, 4,
  'Nátaga, Huila',
  'Todos los días'
),

-- =====================================================
-- OPORAPA (municipio_id = 20)
-- =====================================================

(
  'Cascadas de Oporapa',
  'Conjunto de caídas de agua en zona rural, rodeadas de vegetación y senderos ecológicos.',
  NULL,
  2.0200, -75.9600,
  4, 20, 7,
  'Oporapa, Huila',
  'Todos los días'
),
(
  'Rutas Rurales de Oporapa',
  'Senderos que atraviesan fincas agrícolas y paisajes naturales, turismo comunitario.',
  NULL,
  2.0300, -75.9500,
  1, 20, 1,
  'Oporapa, Huila',
  'Todos los días'
),

-- =====================================================
-- PAICOL (municipio_id = 21)
-- =====================================================

(
  'Caja de Agua de Paicol',
  'Impresionante formación natural donde el agua cae en una cavidad rocosa formando una piscina natural.',
  NULL,
  2.4500, -75.7800,
  4, 21, 7,
  'Paicol, Huila',
  'Todos los días'
),
(
  'Cascadas de Paicol',
  'Serie de cascadas en zona rural para senderismo y ecoturismo.',
  NULL,
  2.4400, -75.7700,
  4, 21, 7,
  'Paicol, Huila',
  'Todos los días'
),

-- =====================================================
-- PITALITO (municipio_id = 25)
-- =====================================================

(
  'Valle de Laboyos',
  'Valle fértil rodeado de montañas, reconocido por su producción cafetera y paisajes naturales.',
  NULL,
  1.8500, -76.0500,
  1, 25, 4,
  'Pitalito, Huila',
  'Todos los días'
),
(
  'Laguna Guaitipán',
  'Laguna natural rodeada de vegetación, ideal para actividades ecológicas, pesca y turismo de naturaleza.',
  NULL,
  1.8400, -76.0600,
  1, 25, 3,
  'Pitalito, Huila',
  'Todos los días'
),

-- =====================================================
-- SALADOBLANCO (municipio_id = 27)
-- =====================================================

(
  'Cascada Arcoíris',
  'Espectacular cascada donde la luz del sol genera efectos de arcoíris en el agua.',
  NULL,
  1.9000, -76.1000,
  4, 27, 7,
  'Saladoblanco, Huila',
  'Acceso con guía'
),

-- =====================================================
-- SAN AGUSTÍN (municipio_id = 29)
-- =====================================================

(
  'Parque Arqueológico de San Agustín',
  'Patrimonio de la Humanidad, con esculturas y tumbas prehispánicas de culturas milenarias.',
  NULL,
  1.8800, -76.2700,
  3, 29, 3,
  'San Agustín, Huila',
  'Todos los días 8:00 am - 5:00 pm'
),
(
  'Estrecho del Magdalena - San Agustín',
  'Lugar donde el río Magdalena se estrecha entre formaciones rocosas, creando un paisaje impresionante.',
  NULL,
  1.8700, -76.2600,
  1, 29, 6,
  'San Agustín, Huila',
  'Todos los días'
),

-- =====================================================
-- SUAZA (municipio_id = 30)
-- =====================================================

(
  'Río Suaza - Suaza',
  'Zona del río Suaza para actividades recreativas, baño y turismo rural.',
  NULL,
  1.9800, -75.9500,
  1, 30, 6,
  'Suaza, Huila',
  'Todos los días'
),

-- =====================================================
-- TESALIA (municipio_id = 34)
-- =====================================================

(
  'Río Páez',
  'Río que atraviesa el municipio, ideal para pesca, recreación y turismo natural.',
  NULL,
  2.4800, -75.7300,
  1, 34, 6,
  'Tesalia, Huila',
  'Todos los días'
),

-- =====================================================
-- TIMANÁ (municipio_id = 35)
-- =====================================================

(
  'Cueva del Mohán',
  'Formación natural con gran valor cultural y mitológico, para turismo de aventura y exploración.',
  NULL,
  1.9500, -75.9300,
  4, 35, 4,
  'Timaná, Huila',
  'Acceso con guía'
);
