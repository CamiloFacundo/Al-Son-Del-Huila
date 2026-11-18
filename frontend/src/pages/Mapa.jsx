import { useEffect, useMemo, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { PiMagnifyingGlassDuotone, PiXBold, PiStarFill, PiArrowsOutSimpleBold, PiCrosshairDuotone, PiNavigationArrowFill } from "react-icons/pi"
import api from "../services/api"
import { getDestinos } from "../api/destinos"
import { capaOscura } from "../utils/mapas"
import { visualCategoria } from "../utils/categoriaVisual"
import { distanciaKm, formatoDistancia, pedirUbicacion } from "../utils/ubicacion"
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
  const [ubicacion, setUbicacion] = useState(null) // { lat, lng, precision }
  const [estadoUbic, setEstadoUbic] = useState({ buscando: false, error: "" })
  const [porCercania, setPorCercania] = useState(false)

  const contenedorRef = useRef(null)
  const mapaRef = useRef(null)
  const marcadoresRef = useRef(new Map())
  const filasRef = useRef(new Map())
  const listaRef = useRef(null)
  const capaUbicacionRef = useRef(null)
  const encuadreUbicacionRef = useRef(null) // encuadre pendiente tras ubicar al usuario

  useEffect(() => {
    Promise.all([getDestinos(), api.get("/categorias")])
      .then(([d, c]) => { setDestinos(d); setCategorias(c.data) })
      .catch(() => setError("No se pudieron cargar los destinos. Revisa tu conexión e inténtalo de nuevo."))
  }, [])

  // Distancia desde el usuario a cada destino (cuando compartió su ubicación)
  const distancias = useMemo(() => {
    const m = new Map()
    if (!ubicacion || !destinos) return m
    for (const d of destinos) {
      const lat = parseFloat(d.latitud), lng = parseFloat(d.longitud)
      if (!isNaN(lat) && !isNaN(lng)) m.set(d.id, distanciaKm(ubicacion.lat, ubicacion.lng, lat, lng))
    }
    return m
  }, [ubicacion, destinos])

  const visibles = useMemo(() => {
    if (!destinos) return []
    const q = normalizar(busqueda.trim())
    const lista = destinos.filter(d =>
      (!filtro || d.categoria_id === filtro) &&
      (!q || normalizar(`${d.nombre} ${d.municipio?.nombre} ${d.categoria?.nombre}`).includes(q))
    )
    if (porCercania && distancias.size) {
      lista.sort((a, b) => (distancias.get(a.id) ?? Infinity) - (distancias.get(b.id) ?? Infinity))
    }
    return lista
  }, [destinos, busqueda, filtro, porCercania, distancias])

  // Qué destinos se ven (sin importar el orden): solo si cambia se vuelve a encuadrar el mapa
  const claveVisibles = useMemo(() => visibles.map(d => d.id).sort((a, b) => a - b).join(","), [visibles])

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
    capaUbicacionRef.current = L.layerGroup().addTo(mapa)
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

  // Mostrar solo los marcadores filtrados y encuadrarlos (ordenar por cercanía no vuelve a encuadrar)
  useEffect(() => {
    const mapa = mapaRef.current
    if (!mapa || !destinos) return
    const ids = new Set(claveVisibles ? claveVisibles.split(",").map(Number) : [])
    const puntos = []
    marcadoresRef.current.forEach((m, id) => {
      if (ids.has(id)) { if (!mapa.hasLayer(m)) m.addTo(mapa); puntos.push(m.getLatLng()) }
      else m.remove()
    })
    if (puntos.length) mapa.fitBounds(L.latLngBounds(puntos), { padding: [48, 48], maxZoom: 12, animate: true })
  }, [claveVisibles, destinos])

  // Punto "Estás aquí" con el círculo de precisión del GPS
  useEffect(() => {
    const capa = capaUbicacionRef.current
    if (!capa) return
    capa.clearLayers()
    if (!ubicacion) return
    const punto = [ubicacion.lat, ubicacion.lng]
    if (ubicacion.precision > 30) {
      L.circle(punto, {
        radius: Math.min(ubicacion.precision, 5000), color: "#D4A843", weight: 1, opacity: 0.6,
        fillColor: "#D4A843", fillOpacity: 0.08, interactive: false,
      }).addTo(capa)
    }
    L.marker(punto, {
      icon: L.divIcon({ className: "", html: `<span class="${styles.yo}"></span>`, iconSize: [22, 22], iconAnchor: [11, 11] }),
      title: "Tu ubicación", zIndexOffset: 2000, keyboard: false,
    }).bindTooltip("Estás aquí", { direction: "top", offset: [0, -12], className: styles.yoEtiqueta }).addTo(capa)
    // El vuelo va después de dibujar: el primer círculo crea la capa SVG y cortaría una animación ya empezada
    if (encuadreUbicacionRef.current) {
      mapaRef.current?.flyToBounds(encuadreUbicacionRef.current, { padding: [70, 70], maxZoom: 13, duration: 1 })
      encuadreUbicacionRef.current = null
    }
  }, [ubicacion])

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

  const ubicarme = async () => {
    setEstadoUbic({ buscando: true, error: "" })
    try {
      const u = await pedirUbicacion()
      // Encuadrar al usuario junto con los 3 destinos visibles más cercanos
      const cercanos = visibles
        .map(d => ({ d, km: distanciaKm(u.lat, u.lng, parseFloat(d.latitud), parseFloat(d.longitud)) }))
        .filter(x => !isNaN(x.km))
        .sort((a, b) => a.km - b.km)
        .slice(0, 3)
        .map(x => [parseFloat(x.d.latitud), parseFloat(x.d.longitud)])
      encuadreUbicacionRef.current = L.latLngBounds([[u.lat, u.lng], ...cercanos])
      setUbicacion(u)
      setPorCercania(true)
      setEstadoUbic({ buscando: false, error: "" })
      listaRef.current?.scrollTo({ top: 0, behavior: "smooth" })
    } catch (e) {
      setEstadoUbic({ buscando: false, error: e.message })
    }
  }

  const quitarUbicacion = () => {
    setUbicacion(null)
    setPorCercania(false)
    setEstadoUbic({ buscando: false, error: "" })
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
          {ubicacion && (
            <div className={styles.cercania}>
              <PiNavigationArrowFill size={12} aria-hidden="true" />
              <span>{porCercania ? "Ordenados por cercanía a ti" : "Tu ubicación está en el mapa"}</span>
              <button type="button" onClick={() => setPorCercania(p => !p)}>{porCercania ? "Orden normal" : "Más cercanos"}</button>
              <button type="button" onClick={quitarUbicacion}>Quitar</button>
            </div>
          )}
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
                  <span className={styles.extras}>
                    {distancias.has(d.id) && <span className={styles.distancia}>{formatoDistancia(distancias.get(d.id))}</span>}
                    {Number(d.rating_promedio) > 0 && (
                      <span className={styles.nota}><PiStarFill size={11} aria-hidden="true" /> {Number(d.rating_promedio).toFixed(1)}</span>
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </aside>

      <section className={styles.mapaZona} aria-label="Mapa">
        <div ref={contenedorRef} className={styles.mapa} />
        <div className={styles.ubicarZona}>
          <button type="button" className={styles.ubicar} onClick={ubicarme} disabled={estadoUbic.buscando}
            aria-label={ubicacion ? "Actualizar mi ubicación" : "Mostrar mi ubicación"}>
            {estadoUbic.buscando
              ? <span className={styles.ubicarGiro} aria-hidden="true" />
              : <PiCrosshairDuotone size={18} aria-hidden="true" />}
            <span>{estadoUbic.buscando ? "Buscando…" : "Mi ubicación"}</span>
          </button>
          {estadoUbic.error && (
            <p className={styles.ubicarError} role="alert">
              {estadoUbic.error}
              <button type="button" onClick={() => setEstadoUbic({ buscando: false, error: "" })} aria-label="Cerrar aviso"><PiXBold size={10} /></button>
            </p>
          )}
        </div>
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
