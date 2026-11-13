import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { PiMapTrifoldDuotone, PiCaretDownBold } from "react-icons/pi"
import { capaOscura } from "../utils/mapas"
import styles from "./MapaRutas.module.css"

const HUILA = [2.5359, -75.5277]
const escapar = (t) => String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]))
const nombreDe = (v) => (v && typeof v === "object" ? v.nombre : v) || ""
const esMovil = () => window.matchMedia("(max-width: 900px)").matches
const relleno = () => (esMovil() ? [36, 36] : [70, 70])

function pin(numero, activo) {
  return L.divIcon({
    className: "",
    html: `<span class="${styles.pin} ${activo ? styles.pinActivo : ""}">${numero}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  })
}

/**
 * Mapa de Huily: los destinos de la ruta o de la respuesta, numerados y unidos en orden.
 * @param destinos  lista de destinos (con latitud/longitud)
 * @param titulo    nombre de la ruta (si es una ruta)
 * @param destacado id del destino a resaltar y abrir
 */
export default function MapaRutas({ destinos = [], titulo = null, destacado = null, onVerFicha }) {
  const contenedorRef = useRef(null)
  const mapaRef = useRef(null)
  const capaRef = useRef(null)
  const marcadoresRef = useRef(new Map())
  const puntosRef = useRef([])
  const fichaRef = useRef(onVerFicha)
  useEffect(() => { fichaRef.current = onVerFicha }, [onVerFicha])
  // En el celular la lista de paradas empieza plegada para no tapar el mapa
  const [leyendaAbierta, setLeyendaAbierta] = useState(() => !esMovil())

  useEffect(() => {
    const mapa = L.map(contenedorRef.current, { zoomControl: false }).setView(HUILA, 8)
    capaOscura(mapa)
    L.control.zoom({ position: "bottomright" }).addTo(mapa)
    capaRef.current = L.layerGroup().addTo(mapa)
    mapaRef.current = mapa
    // Si cambia el tamaño del contenedor (giro del celular, columnas), se recalcula y se vuelve a encuadrar
    const observador = new ResizeObserver(() => {
      mapa.invalidateSize()
      const puntos = puntosRef.current
      if (puntos.length > 1) mapa.fitBounds(puntos, { padding: relleno(), maxZoom: 12 })
      else if (puntos.length === 1) mapa.setView(puntos[0], 12)
    })
    observador.observe(contenedorRef.current)
    return () => { observador.disconnect(); mapa.remove(); mapaRef.current = null }
  }, [])

  // Pintar destinos, línea de la ruta y encuadre
  useEffect(() => {
    const mapa = mapaRef.current
    if (!mapa) return
    capaRef.current.clearLayers()
    marcadoresRef.current.clear()

    const validos = destinos.filter(d => !isNaN(parseFloat(d.latitud)) && !isNaN(parseFloat(d.longitud)))
    const puntos = validos.map(d => [parseFloat(d.latitud), parseFloat(d.longitud)])
    puntosRef.current = puntos

    if (titulo && puntos.length > 1) {
      L.polyline(puntos, { color: "#D4A843", weight: 3, opacity: 0.75, dashArray: "8 8", lineJoin: "round" }).addTo(capaRef.current)
    }

    validos.forEach((d, i) => {
      const popup = document.createElement("div")
      popup.className = styles.popup
      popup.innerHTML = `
        ${d.imagen ? `<img src="${escapar(d.imagen)}" alt="">` : ""}
        <div class="${styles.popupCuerpo}">
          <span class="${styles.popupNumero}">${titulo ? `Parada ${i + 1}` : `Sugerencia ${i + 1}`}</span>
          <strong>${escapar(d.nombre)}</strong>
          <span>${escapar(nombreDe(d.municipio))} · ${escapar(nombreDe(d.categoria))}</span>
        </div>`
      if (fichaRef.current) {
        const boton = document.createElement("button")
        boton.type = "button"
        boton.className = styles.popupBoton
        boton.textContent = "Ver ficha"
        boton.addEventListener("click", () => fichaRef.current?.(d))
        popup.querySelector(`.${styles.popupCuerpo}`).appendChild(boton)
      }
      const m = L.marker(puntos[i], { icon: pin(i + 1, d.id === destacado), title: d.nombre, riseOnHover: true })
        .bindPopup(popup, { className: styles.popupLeaflet, minWidth: 220, maxWidth: 240 })
        .addTo(capaRef.current)
      marcadoresRef.current.set(d.id, m)
    })

    if (puntos.length === 1) mapa.flyTo(puntos[0], 12, { duration: 0.8 })
    else if (puntos.length > 1) mapa.flyToBounds(puntos, { padding: relleno(), maxZoom: 12, duration: 0.8 })
    else mapa.flyTo(HUILA, 8, { duration: 0.6 })
  }, [destinos, titulo, destacado])

  // Abrir el destino destacado (p. ej. al pulsar su nombre en el chat)
  useEffect(() => {
    if (!destacado) return
    const m = marcadoresRef.current.get(destacado)
    if (m) setTimeout(() => m.openPopup(), 850)
  }, [destacado, destinos])

  const enfocar = (d) => {
    const m = marcadoresRef.current.get(d.id)
    if (!m || !mapaRef.current) return
    if (esMovil()) setLeyendaAbierta(false)
    mapaRef.current.flyTo(m.getLatLng(), Math.max(mapaRef.current.getZoom(), 12), { duration: 0.7 })
    setTimeout(() => m.openPopup(), 720)
  }

  return (
    <div className={styles.wrapper}>
      <div ref={contenedorRef} className={styles.mapa} />

      {destinos.length > 0 ? (
        <div className={styles.leyenda}>
          <button type="button" className={styles.leyendaCabecera} onClick={() => setLeyendaAbierta(a => !a)}
            aria-expanded={leyendaAbierta} aria-controls="leyenda-paradas">
            <span className={styles.leyendaTitulos}>
              <strong>{titulo || "Destinos sugeridos"}</strong>
              <span>{destinos.length} {destinos.length === 1 ? "parada" : "paradas"}</span>
            </span>
            <PiCaretDownBold size={13} aria-hidden="true" className={`${styles.leyendaFlecha} ${leyendaAbierta ? styles.leyendaFlechaAbierta : ""}`} />
          </button>
          <ol id="leyenda-paradas" className={styles.leyendaLista} hidden={!leyendaAbierta}>
            {destinos.map((d, i) => (
              <li key={d.id}>
                <button type="button" className={`${styles.leyendaItem} ${d.id === destacado ? styles.leyendaActiva : ""}`} onClick={() => enfocar(d)}>
                  <span className={styles.leyendaNum}>{i + 1}</span>
                  <span className={styles.leyendaInfo}>
                    <span className={styles.leyendaNombre}>{d.nombre}</span>
                    <span className={styles.leyendaMuni}>{nombreDe(d.municipio)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className={styles.vacio}>
          <PiMapTrifoldDuotone size={34} aria-hidden="true" />
          <p>Pídele una ruta a Huily o elige una de tus rutas: aparecerá aquí.</p>
        </div>
      )}
    </div>
  )
}
