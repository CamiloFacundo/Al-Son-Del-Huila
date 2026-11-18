// Ubicación del usuario con el GPS del navegador y distancias a los destinos.

/** Distancia en km entre dos puntos (fórmula de haversine). */
export function distanciaKm(lat1, lng1, lat2, lng2) {
  const rad = (g) => (g * Math.PI) / 180
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lng2 - lng1) / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** "850 m", "12 km", "1.240 km" */
export function formatoDistancia(km) {
  if (km < 1) return `${Math.max(50, Math.round((km * 1000) / 50) * 50)} m`
  return `${Math.round(km).toLocaleString("es-CO")} km`
}

/**
 * Pide la ubicación al navegador.
 * @returns {Promise<{lat:number,lng:number,precision:number}>}
 * @throws {Error} con un mensaje en español listo para mostrar
 */
export function pedirUbicacion() {
  return new Promise((resolver, rechazar) => {
    if (!("geolocation" in navigator)) {
      rechazar(new Error("Tu navegador no permite compartir la ubicación."))
      return
    }
    if (!window.isSecureContext) {
      rechazar(new Error("La ubicación solo funciona en una conexión segura (https) o en localhost."))
      return
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolver({ lat: coords.latitude, lng: coords.longitude, precision: coords.accuracy }),
      (err) => {
        const mensajes = {
          1: "No diste permiso para usar tu ubicación. Actívalo en el candado de la barra de direcciones.",
          2: "No se pudo determinar tu ubicación. Revisa que el GPS o el Wi-Fi estén activos.",
          3: "La ubicación tardó demasiado en responder. Inténtalo de nuevo.",
        }
        rechazar(new Error(mensajes[err.code] || "No se pudo obtener tu ubicación."))
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    )
  })
}
