import { Link } from "react-router-dom"
import { PiMapTrifoldDuotone, PiTrashDuotone, PiCalendarBlankDuotone, PiMapPinDuotone, PiChatCircleDotsDuotone } from "react-icons/pi"
import styles from "./HistorialRutas.module.css"

const fecha = (f) => f ? new Date(f).toLocaleDateString("es-CO", { day: "numeric", month: "short" }) : ""

// "Mis rutas": las rutas guardadas por el usuario (con sus destinos ya como objetos)
export default function HistorialRutas({ rutas, rutaActiva, onSeleccionar, onEliminar, onIrAlChat, usuario, cargando }) {
  if (!usuario) {
    return (
      <div className={styles.vacio}>
        <PiMapTrifoldDuotone size={34} aria-hidden="true" />
        <p>Inicia sesión para guardar las rutas que armes con Huily y volver a ellas cuando quieras.</p>
        <Link to="/login" state={{ from: { pathname: "/rutas" } }} className={styles.btnPrimario}>Iniciar sesión</Link>
      </div>
    )
  }

  if (cargando) return <p className={styles.estado}>Cargando tus rutas…</p>

  if (rutas.length === 0) {
    return (
      <div className={styles.vacio}>
        <PiMapTrifoldDuotone size={34} aria-hidden="true" />
        <p>Aún no tienes rutas guardadas. Pídele una a Huily y pulsa «Guardar ruta».</p>
        <button type="button" className={styles.btnPrimario} onClick={onIrAlChat}>
          <PiChatCircleDotsDuotone size={15} aria-hidden="true" /> Hablar con Huily
        </button>
      </div>
    )
  }

  const eliminar = (ruta) => {
    if (window.confirm(`¿Eliminar la ruta «${ruta.nombre}»? No se puede deshacer.`)) onEliminar(ruta.id)
  }

  return (
    <ul className={styles.lista}>
      {rutas.map(ruta => {
        const portada = ruta.destinos.find(d => d.imagen)?.imagen
        const municipios = [...new Set(ruta.destinos.map(d => d.municipio?.nombre).filter(Boolean))]
        const activa = rutaActiva?.id === ruta.id
        return (
          <li key={ruta.id} className={`${styles.ruta} ${activa ? styles.activa : ""}`}>
            <button type="button" className={styles.rutaBoton} onClick={() => onSeleccionar(ruta)} aria-current={activa || undefined}>
              {portada
                ? <img className={styles.portada} src={portada} alt="" loading="lazy" />
                : <span className={styles.portada}><PiMapTrifoldDuotone size={22} aria-hidden="true" /></span>}
              <span className={styles.info}>
                <strong>{ruta.nombre}</strong>
                <span className={styles.meta}>
                  <span><PiCalendarBlankDuotone size={12} aria-hidden="true" /> {ruta.dias || 1} {ruta.dias === 1 ? "día" : "días"}</span>
                  <span><PiMapPinDuotone size={12} aria-hidden="true" /> {ruta.destinos.length} paradas</span>
                  <span>{fecha(ruta.created_at)}</span>
                </span>
                {municipios.length > 0 && (
                  <span className={styles.municipios}>{municipios.slice(0, 3).join(" · ")}{municipios.length > 3 ? ` y ${municipios.length - 3} más` : ""}</span>
                )}
              </span>
            </button>
            <button type="button" className={styles.eliminar} onClick={() => eliminar(ruta)} aria-label={`Eliminar la ruta ${ruta.nombre}`}>
              <PiTrashDuotone size={16} />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
