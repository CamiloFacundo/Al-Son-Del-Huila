import { useState, useRef, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import {
  PiPaperPlaneTiltFill, PiImageDuotone, PiMapPinDuotone, PiFloppyDiskDuotone, PiCheckBold,
  PiMapTrifoldDuotone, PiArrowClockwiseBold, PiChatCircleDotsDuotone, PiCalendarBlankDuotone,
} from "react-icons/pi"
import { enviarMensaje } from "../api/groq"
import { reducirImagen } from "../utils/imagen"
import logo from "../assets/images/logo.png"
import styles from "./ChatRutas.module.css"

const CLAVE_SESION = "huily_conversacion"

const BIENVENIDA = {
  id: "bienvenida",
  rol: "assistant",
  local: true,
  texto: "¡Hola! Soy **Huily**, tu guía para recorrer el Huila.\n\nPuedo:\n- Armarte una ruta por días según lo que te guste\n- Recomendarte destinos por región, tipo de viaje o actividad\n- Decirte qué lugar del Huila se parece a una foto\n\n¿Qué te gustaría vivir?",
}

const SUGERENCIAS = [
  "Ruta de 2 días por el sur del Huila",
  "Planes para ver estrellas en la Tatacoa",
  "Ruta en familia con niños cerca de Neiva",
  "Termales y descanso para una pareja",
]

// ── Texto con formato básico (negritas, cursivas, listas, títulos), escapando el HTML primero ──
const escapar = (t) => String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]))
const enLinea = (t) => t
  .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  .replace(/(^|[^*])\*(?!\s)(.+?)\*/g, "$1<em>$2</em>")

function formatear(texto) {
  const lineas = escapar(texto).split("\n")
  let html = "", lista = null
  const cerrar = () => { if (lista) { html += `</${lista}>`; lista = null } }
  for (const linea of lineas) {
    const t = linea.trim()
    let m
    if ((m = t.match(/^[-*•]\s+(.*)/))) {
      if (lista !== "ul") { cerrar(); html += "<ul>"; lista = "ul" }
      html += `<li>${enLinea(m[1])}</li>`
    } else if ((m = t.match(/^\d+[.)]\s+(.*)/))) {
      if (lista !== "ol") { cerrar(); html += "<ol>"; lista = "ol" }
      html += `<li>${enLinea(m[1])}</li>`
    } else if ((m = t.match(/^#{1,4}\s+(.*)/))) {
      cerrar(); html += `<p class="${styles.titulo}">${enLinea(m[1])}</p>`
    } else if (t === "") {
      cerrar()
    } else {
      cerrar(); html += `<p>${enLinea(t)}</p>`
    }
  }
  cerrar()
  return html
}

function repartirPorDias(destinos, dias) {
  const n = Math.max(1, Math.min(dias || 1, destinos.length))
  const tam = Math.ceil(destinos.length / n)
  return Array.from({ length: n }, (_, i) => destinos.slice(i * tam, (i + 1) * tam)).filter(d => d.length)
}

function cargarConversacion() {
  try {
    const guardada = JSON.parse(sessionStorage.getItem(CLAVE_SESION))
    return Array.isArray(guardada) && guardada.length ? guardada : [BIENVENIDA]
  } catch {
    return [BIENVENIDA]
  }
}

function TarjetaRuta({ ruta, usuario, onVerEnMapa, onGuardar }) {
  const [estado, setEstado] = useState(ruta.guardada ? "ok" : "idle")
  const dias = repartirPorDias(ruta.destinos, ruta.dias)

  const guardar = async () => {
    setEstado("guardando")
    try {
      await onGuardar(ruta)
      setEstado("ok")
    } catch {
      setEstado("error")
    }
  }

  return (
    <div className={styles.ruta}>
      <div className={styles.rutaCabecera}>
        <PiMapTrifoldDuotone size={18} aria-hidden="true" />
        <div>
          <strong>{ruta.nombre}</strong>
          <span>{dias.length} {dias.length === 1 ? "día" : "días"} · {ruta.destinos.length} paradas</span>
        </div>
      </div>
      <ol className={styles.rutaDias}>
        {dias.map((paradas, i) => (
          <li key={i}>
            <span className={styles.rutaDia}><PiCalendarBlankDuotone size={12} aria-hidden="true" /> Día {i + 1}</span>
            <span className={styles.rutaParadas}>{paradas.map(p => p.nombre).join(" → ")}</span>
          </li>
        ))}
      </ol>
      <div className={styles.rutaAcciones}>
        <button type="button" className={styles.btnSecundario} onClick={() => onVerEnMapa(ruta.destinos, ruta)}>
          <PiMapPinDuotone size={14} aria-hidden="true" /> Ver en el mapa
        </button>
        {usuario ? (
          estado === "ok" ? (
            <span className={styles.guardada}><PiCheckBold size={12} aria-hidden="true" /> Guardada en Mis rutas</span>
          ) : (
            <button type="button" className={styles.btnPrimario} onClick={guardar} disabled={estado === "guardando"}>
              <PiFloppyDiskDuotone size={14} aria-hidden="true" /> {estado === "guardando" ? "Guardando…" : estado === "error" ? "Reintentar guardar" : "Guardar ruta"}
            </button>
          )
        ) : (
          <Link to="/login" state={{ from: { pathname: "/rutas" } }} className={styles.enlace}>Inicia sesión para guardarla</Link>
        )}
      </div>
    </div>
  )
}

// Chat con Huily. La conversación se conserva al cambiar de pestaña y durante la sesión del navegador.
export default function ChatRutas({ rutaActiva, usuario, onVerEnMapa, onGuardarRuta }) {
  const [mensajes, setMensajes] = useState(cargarConversacion)
  const [input, setInput] = useState("")
  const [cargando, setCargando] = useState(false)
  const [errorFoto, setErrorFoto] = useState("")

  const finalRef = useRef(null)
  const inputRef = useRef(null)
  const fileRef = useRef(null)
  const rutaAnunciada = useRef(rutaActiva?.id)

  // Guardar la conversación (sin fotos, que pesan) para no perderla al recargar o cambiar de página
  useEffect(() => {
    try {
      sessionStorage.setItem(CLAVE_SESION, JSON.stringify(mensajes.slice(-30).map(({ imagen, ...m }) => (imagen ? { ...m, teniaFoto: true } : m))))
    } catch { /* almacenamiento lleno o bloqueado: no pasa nada */ }
  }, [mensajes])

  useEffect(() => {
    finalRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [mensajes, cargando])

  // Al elegir una ruta guardada, Huily lo anuncia (sin borrar la conversación)
  useEffect(() => {
    if (!rutaActiva || rutaAnunciada.current === rutaActiva.id) return
    rutaAnunciada.current = rutaActiva.id
    setMensajes(prev => [...prev, {
      id: `ruta-${rutaActiva.id}-${Date.now()}`,
      rol: "assistant",
      local: true,
      texto: `Estás viendo **${rutaActiva.nombre}** (${rutaActiva.destinos.length} paradas). Pregúntame lo que quieras sobre ella: qué llevar, qué más hay cerca o cómo ampliarla.`,
    }])
  }, [rutaActiva])

  // Ajustar la altura del cuadro de texto a lo escrito
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 140) + "px"
  }, [input])

  const pedir = useCallback(async (historial) => {
    setCargando(true)
    try {
      const enviables = historial.filter(m => !m.local && !m.error)
      const contexto = rutaActiva ? { rutaActiva: rutaActiva.nombre, destinos: rutaActiva.destinos } : null
      const { respuesta, destinos, ruta } = await enviarMensaje(enviables, contexto)
      setMensajes(prev => [...prev, { id: Date.now(), rol: "assistant", texto: respuesta, destinos, ruta }])
      if (ruta?.destinos?.length) onVerEnMapa?.(ruta.destinos, ruta)
      else if (destinos?.length) onVerEnMapa?.(destinos)
    } catch (err) {
      setMensajes(prev => [...prev, { id: Date.now(), rol: "assistant", texto: err.message, error: true, reintentarEn: err.reintentarEn }])
    } finally {
      setCargando(false)
    }
  }, [rutaActiva, onVerEnMapa])

  const enviar = (texto = input, imagen = null) => {
    const limpio = texto.trim()
    if ((!limpio && !imagen) || cargando) return
    const nuevo = { id: Date.now(), rol: "user", texto: limpio || "¿Qué lugar del Huila se parece a esta foto?", imagen }
    const historial = [...mensajes.filter(m => !m.error), nuevo]
    setMensajes(prev => [...prev, nuevo])
    setInput("")
    setErrorFoto("")
    pedir(historial)
    inputRef.current?.focus()
  }

  const reintentar = () => {
    const sinError = mensajes.filter(m => !m.error)
    setMensajes(sinError)
    pedir(sinError)
  }

  const elegirFoto = async (e) => {
    const file = e.target.files[0]
    e.target.value = ""
    if (!file) return
    try {
      const dataUrl = await reducirImagen(file)
      enviar(input, dataUrl)
    } catch (err) {
      setErrorFoto(err.message)
    }
  }

  const nuevaConversacion = () => {
    if (cargando) return
    sessionStorage.removeItem(CLAVE_SESION)
    setMensajes([BIENVENIDA])
    setInput("")
  }

  const guardarRuta = async (ruta) => {
    await onGuardarRuta(ruta)
    setMensajes(prev => prev.map(m => (m.ruta === ruta ? { ...m, ruta: { ...ruta, guardada: true } } : m)))
  }

  const soloBienvenida = mensajes.length === 1

  return (
    <div className={styles.wrapper}>
      <div className={styles.cabecera}>
        <img src={logo} alt="" className={styles.cabeceraLogo} />
        <div>
          <strong>Huily</strong>
          <span>{cargando ? "Escribiendo…" : "Asistente de rutas del Huila"}</span>
        </div>
        {!soloBienvenida && (
          <button type="button" className={styles.btnNueva} onClick={nuevaConversacion} disabled={cargando}>
            <PiChatCircleDotsDuotone size={15} aria-hidden="true" /> Nueva
          </button>
        )}
      </div>

      <div className={styles.mensajes} role="log" aria-live="polite" aria-label="Conversación con Huily">
        {mensajes.map(msg => (
          <div key={msg.id} className={`${styles.msg} ${msg.rol === "user" ? styles.msgUser : styles.msgIA}`}>
            <div className={`${styles.burbuja} ${msg.rol === "user" ? styles.burbujaUser : styles.burbujaIA} ${msg.error ? styles.burbujaError : ""}`}>
              {msg.imagen && <img src={msg.imagen} alt="Foto enviada" className={styles.imagenSubida} />}
              {msg.teniaFoto && !msg.imagen && <span className={styles.notaFoto}><PiImageDuotone size={13} aria-hidden="true" /> Foto enviada</span>}

              {msg.rol === "user"
                ? <p>{msg.texto}</p>
                : <div className={styles.texto} dangerouslySetInnerHTML={{ __html: formatear(msg.texto) }} />}

              {msg.error && (
                <button type="button" className={styles.btnSecundario} onClick={reintentar} disabled={cargando}>
                  <PiArrowClockwiseBold size={13} aria-hidden="true" /> Reintentar
                </button>
              )}

              {msg.ruta && (
                <TarjetaRuta ruta={msg.ruta} usuario={usuario} onVerEnMapa={onVerEnMapa} onGuardar={guardarRuta} />
              )}

              {!msg.ruta && msg.destinos?.length > 0 && (
                <div className={styles.chips}>
                  {msg.destinos.map(d => (
                    <button type="button" key={d.id} className={styles.chip} onClick={() => onVerEnMapa?.(msg.destinos, null, d.id)}>
                      <PiMapPinDuotone size={12} aria-hidden="true" /> {d.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {cargando && (
          <div className={`${styles.msg} ${styles.msgIA}`}>
            <div className={`${styles.burbuja} ${styles.burbujaIA}`} aria-label="Huily está escribiendo">
              <div className={styles.typing}><span /><span /><span /></div>
            </div>
          </div>
        )}
        <div ref={finalRef} />
      </div>

      {soloBienvenida && (
        <div className={styles.sugerencias}>
          {SUGERENCIAS.map(s => (
            <button type="button" key={s} className={styles.sugerencia} onClick={() => enviar(s)}>{s}</button>
          ))}
        </div>
      )}

      <form className={styles.inputArea} onSubmit={e => { e.preventDefault(); enviar() }}>
        {errorFoto && <p className={styles.errorFoto} role="alert">{errorFoto}</p>}
        <div className={styles.inputWrapper}>
          <button type="button" className={styles.btnImagen} onClick={() => fileRef.current?.click()} disabled={cargando}
            aria-label="Enviar una foto para saber qué lugar del Huila se parece" title="Enviar una foto">
            <PiImageDuotone size={20} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={elegirFoto} />
          <textarea
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar() } }}
            placeholder="Escribe a Huily…"
            aria-label="Mensaje para Huily"
            maxLength={1000}
            rows={1}
          />
          <button type="submit" className={styles.btnEnviar} disabled={!input.trim() || cargando} aria-label="Enviar mensaje">
            <PiPaperPlaneTiltFill size={17} />
          </button>
        </div>
      </form>
    </div>
  )
}
