import L from "leaflet"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"

// Iconos de los marcadores desde el propio proyecto (antes se pedían a unpkg / cdnjs)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow })

// Fondos de mapa gratuitos y sin clave.
// (Antes se usaba CARTO, que ahora exige API key y mostraba "API KEY REQUIRED" en todos los mapas.)

// Mapa claro: OpenStreetMap (hay que mostrar la atribución; uso moderado, ver osm.wiki/Tile_usage_policy)
export function capaClara(mapa) {
  return L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(mapa)
}

// Mapa oscuro: Esri Dark Gray Canvas + capa de nombres de lugares
export function capaOscura(mapa) {
  const atribucion = 'Tiles &copy; <a href="https://www.esri.com">Esri</a> &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap'
  L.tileLayer("https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
    attribution: atribucion,
    maxZoom: 16,
  }).addTo(mapa)
  return L.tileLayer("https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 16,
  }).addTo(mapa)
}
