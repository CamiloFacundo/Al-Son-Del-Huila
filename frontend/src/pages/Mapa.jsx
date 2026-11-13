import { useEffect, useMemo, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { PiMagnifyingGlassDuotone, PiXBold, PiStarFill, PiArrowsOutSimpleBold } from "react-icons/pi"
import api from "../services/api"
import { getDestinos } from "../api/destinos"
import { capaOscura } from "../utils/mapas"
import { visualCategoria } from "../utils/categoriaVisual"
import DestinoModal from "../components/DestinoModal"
import styles from "./Mapa.module.css"

const HUILA = [2.5359, -75.5277]

const normalizar = (t) => (t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
const escapar = (t) => String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]))

function iconoPin(color, activo) {
  return L.divIcon({
    className: "",
    html: `<span class="${styles.pin} ${activo ? styles.pinActivo : ""}" style="--c:${color}"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  })
}

// Explorador de destinos: lista con búsqueda y filtros por categoría, sincronizada con el mapa.
export default function MapaPagina() {
  const [destinos, setDestinos] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [error, setError] = useState("")
  const [busqueda, setBusqueda] = useState("")
  const [filtro, setFiltro] = useState(null) // id de categoría o null = todas
  const [activo, setActivo] = useState(null) // id del destino resaltado
  const [ficha, setFicha] = useState(null)

  const contenedorRef = useRef(null)
  const mapaRef = useRef(null)
  const marcadoresRef = useRef(new Map())
  const filasRef = useRef(new Map())
  const listaRef = useRef(null)

  useEffect(() => {
    Promise.all([getDestinos(), api.get("/categorias")])
      .then(([d, c]) => { setDestinos(d); setCategorias(c.data) })
      .catch(() => setError("No se pudieron cargar los destinos. Revisa tu conexión e inténtalo de nuevo."))
  }, [])

  const visibles = useMemo(() => {
    if (!destinos) return []
    const q = normalizar(busqueda.trim())
    return destinos.filter(d =>
      (!filtro || d.categoria_id === filtro) &&
      (!q || normalizar(`${d.nombre} ${d.municipio?.nombre} ${d.categoria?.nombre}`).includes(q))
    )
  }, [destinos, busqueda, filtro])

  const conteo = useMemo(() => {
    const c = {}
    for (const d of destinos || []) c[d.categoria_id] = (c[d.categoria_id] || 0) + 1
    return c
  }, [destinos])

  // Crear el mapa una vez
  useEffect(() => {
    const mapa = L.map(contenedorRef.current, { zoomControl: false, attributionControl: true }).setView(HUILA, 8)
    capaOscura(mapa)
    L.control.zoom({ position: "bottomright" }).addTo(mapa)
    mapaRef.current = mapa
    return () => { mapa.remove(); mapaRef.current = null }
  }, [])

  // Crear los marcadores cuando llegan los destinos
  useEffect(() => {
    const mapa = mapaRef.current
    if (!mapa || !destinos) return
    const marcadores = marcadoresRef.current
    marcadores.forEach(m => m.remove())
    marcadores.clear()

    for (const d of destinos) {
      const lat = parseFloat(d.latitud), lng = parseFloat(d.longitud)
      if (isNaN(lat) || isNaN(lng)) continue
      const { color } = visualCategoria(d.categoria_id)

      const popup = document.createElement("div")
      popup.className = styles.popup
      popup.innerHTML = `
        ${d.imagen ? `<img src="${escapar(d.imagen)}" alt="">` : ""}
        <div class="${styles.popupCuerpo}">
          <strong>${escapar(d.nombre)}</strong>
          <span>${escapar(d.municipio?.nombre)} · ${escapar(d.categoria?.nombre)}</span>
        </div>`
      const boton = document.createElement("button")
      boton.type = "button"
      boton.className = styles.popupBoton
      boton.textContent = "Ver ficha"
      boton.addEventListener("click", () => setFicha(d))
      popup.querySelector(`.${styles.popupCuerpo}`).appendChild(boton)

      const m = L.marker([lat, lng], { icon: iconoPin(color, false), title: d.nombre, riseOnHover: true })
        .bindPopup(popup, { className: styles.popupLeaflet, maxWidth: 260, minWidth: 220, closeButton: true })
        .on("click", () => setActivo(d.id))
        .addTo(mapa)
      marcadores.set(d.id, m)
    }
  }, [destinos])

  // Mostrar solo los marcadores filtrados y encuadrarlos
  useEffect(() => {
    const mapa = mapaRef.current
    if (!mapa || !destinos) return
    const ids = new Set(visibles.map(d => d.id))
    const puntos = []
    marcadoresRef.current.forEach((m, id) => {
      if (ids.has(id)) { if (!mapa.hasLayer(m)) m.addTo(mapa); puntos.push(m.getLatLng()) }
      else m.remove()
    })
    if (puntos.length) mapa.fitBounds(L.latLngBounds(puntos), { padding: [48, 48], maxZoom: 12, animate: true })
  }, [visibles, destinos])

  // Resaltar el marcador activo y llevar su fila a la vista
  useEffect(() => {
    marcadoresRef.current.forEach((m, id) => {
      const d = destinos?.find(x => x.id === id)
      if (d) m.setIcon(iconoPin(visualCategoria(d.categoria_id).color, id === activo))
      if (id === activo) m.setZIndexOffset(1000); else m.setZIndexOffset(0)
    })
    // Llevar la fila a la vista desplazando solo la lista (scrollIntoView movería toda la página)
    const fila = activo && filasRef.current.get(activo)
    const lista = listaRef.current
    if (fila && lista) {
      const arriba = fila.offsetTop // .lista es position: relative
      if (arriba < lista.scrollTop || arriba + fila.offsetHeight > lista.scrollTop + lista.clientHeight) {
        lista.scrollTo({ top: arriba - lista.clientHeight / 2 + fila.offsetHeight / 2, behavior: "smooth" })
      }
    }
  }, [activo, destinos])

  const enfocar = (d) => {
    setActivo(d.id)
    const m = marcadoresRef.current.get(d.id)
    if (m && mapaRef.current) {
      mapaRef.current.flyTo(m.getLatLng(), Math.max(mapaRef.current.getZoom(), 12), { duration: 0.8 })
      setTimeout(() => m.openPopup(), 820)
    }
  }

  // Desplazar la fila de chips (solo en horizontal) para que el elegido quede a la vista
  const mostrarChip = (chip) => {
    const fila = chip.parentElement
    fila.scrollTo({ left: chip.offsetLeft - fila.offsetLeft - 24, behavior: "smooth" })
  }

  const verTodo = () => {
    setBusqueda(""); setFiltro(null); setActivo(null)
    mapaRef.current?.closePopup()
  }

  return (
    <div className={styles.pagina}>
      <aside className={styles.panel} aria-label="Destinos del mapa">
        <header className={styles.cabecera}>
          <h1>Mapa de destinos</h1>
          <p>{destinos ? `${visibles.length} de ${destinos.length} destinos` : error ? "" : "Cargando destinos…"}</p>
        </header>

        <label className={styles.buscador}>
          <PiMagnifyingGlassDuotone size={18} aria-hidden="true" />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar destino o municipio"
            aria-label="Buscar destino o municipio"
          />
          {busqueda && (
            <button type="button" onClick={() => setBusqueda("")} aria-label="Borrar búsqueda"><PiXBold size={12} /></button>
          )}
        </label>

        <div className={styles.chips} role="group" aria-label="Filtrar por categoría">
          <button type="button" className={`${styles.chip} ${!filtro ? styles.chipActivo : ""}`} aria-pressed={!filtro} onClick={() => setFiltro(null)}>
            Todas
          </button>
          {categorias.filter(c => conteo[c.id]).map(c => {
            const { Icon, color } = visualCategoria(c.id)
            return (
              <button type="button" key={c.id} style={{ "--c": color }}
                className={`${styles.chip} ${filtro === c.id ? styles.chipActivo : ""}`}
                aria-pressed={filtro === c.id} onClick={(e) => { setFiltro(filtro === c.id ? null : c.id); mostrarChip(e.currentTarget) }}>
                <Icon size={14} aria-hidden="true" /> {c.nombre}
              </button>
            )
          })}
        </div>

        <ul className={styles.lista} ref={listaRef}>
          {error && <li className={styles.estado}>{error}</li>}
          {destinos && visibles.length === 0 && (
            <li className={styles.estado}>
              Ningún destino coincide con tu búsqueda.
              <button type="button" className={styles.enlace} onClick={verTodo}>Ver todos</button>
            </li>
          )}
          {visibles.map(d => {
            const { Icon, color, fondo } = visualCategoria(d.categoria_id)
            return (
              <li key={d.id} ref={el => el ? filasRef.current.set(d.id, el) : filasRef.current.delete(d.id)}>
                <button
                  type="button"
                  className={`${styles.fila} ${activo === d.id ? styles.filaActiva : ""}`}
                  onClick={() => enfocar(d)}
                  onMouseEnter={() => setActivo(d.id)}
                  aria-current={activo === d.id || undefined}
                >
                  {d.imagen
                    ? <img className={styles.miniatura} src={d.imagen} alt="" loading="lazy" />
                    : <span className={styles.miniatura} style={{ background: fondo }}><Icon size={20} aria-hidden="true" /></span>}
                  <span className={styles.filaTexto}>
                    <strong>{d.nombre}</strong>
                    <span className={styles.meta}>
                      <i style={{ background: color }} aria-hidden="true" />
                      {d.municipio?.nombre} · {d.categoria?.nombre}
                    </span>
                  </span>
                  {Number(d.rating_promedio) > 0 && (
                    <span className={styles.nota}><PiStarFill size={11} aria-hidden="true" /> {Number(d.rating_promedio).toFixed(1)}</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </aside>

      <section className={styles.mapaZona} aria-label="Mapa">
        <div ref={contenedorRef} className={styles.mapa} />
        {(filtro || busqueda) && (
          <button type="button" className={styles.verTodo} onClick={verTodo}>
            <PiArrowsOutSimpleBold size={14} aria-hidden="true" /> Ver todo el Huila
          </button>
        )}
      </section>

      <DestinoModal destino={ficha} isOpen={!!ficha} onClose={() => setFicha(null)} />
    </div>
  )
}
