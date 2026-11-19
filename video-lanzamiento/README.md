# Video de lanzamiento — Al Son del Huila

Video de 62 s en 1920×1080 a 30 fps, sin audio, pensado para repetirse en la pantalla de la feria.
Empieza y termina en negro, así que el bucle no se nota.

**Archivo final:** `salida/al-son-del-huila-lanzamiento.mp4`

## Cómo proyectarlo en la feria

- **Con VLC (recomendado):** abre el MP4, activa *Repetir todo* (o pulsa `L`) y pon pantalla completa (`F`).
- **Desde una memoria USB en el televisor:** copia el MP4 y activa la repetición en el reproductor del televisor.
- **Sin el MP4:** abre `index.html` en Chrome y pulsa `F11`. La animación se repite sola, pero necesita internet
  para cargar las fuentes.

## Escenas

| Segundos | Escena |
|---|---|
| 0–7 | Logo y nombre |
| 7–11 | «Descubre el Huila como nunca antes» |
| 11–24 | Tatacoa, San Agustín, río Magdalena y termales de Rivera |
| 24–30 | Cifras: 185 destinos, 37 municipios y 10 categorías |
| 30–49 | Funciones: catálogo, mapa, quiz y Huily (con capturas reales de la app) |
| 49–54 | Cortes rápidos por categoría |
| 54–62 | Cierre con la invitación a probar la app en el stand |

## Cómo cambiarlo y volver a generarlo

Los textos, los tiempos y las fotos están en `index.html`. La línea de tiempo está en la función `renderAt(t)`.

```powershell
npm install
node render.js                    # genera el video completo (unos 5 a 10 minutos)
node render.js --stills 12,40     # solo captura esos segundos para revisarlos
```

Necesitas Google Chrome y `ffmpeg` en el PATH.

Para repetir las capturas de la app, enciéndela (`iniciar.cmd`) y ejecuta `node capturar.js`.
