import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { PiStarFill, PiStarDuotone } from "react-icons/pi"
import { useAuth } from "../context/AuthContext"
import { getResenas, guardarResena, borrarResena } from "../api/destinos"
import styles from "./Resenas.module.css"

function Estrellas({ valor, onElegir, tamano = 18 }) {
  const [hover, setHover] = useState(0)
  const mostrar = hover || valor
  return (
    <div className={styles.estrellas} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map(n => {
        const Icono = n <= mostrar ? PiStarFill : PiStarDuotone
        return onElegir ? (
          <button
            key={n}
            type="button"
            className={styles.estrellaBtn}
            onMouseEnter={() => setHover(n)}
            onClick={() => onElegir(n)}
            aria-label={`${n} de 5`}
            aria-pressed={valor === n}
          >
            <Icono size={tamano} />
          </button>
        ) : (
          <Icono key={n} size={tamano} className={n <= mostrar ? styles.llena : styles.vacia} />
        )
      })}
    </div>
  )
}

// Reseñas de un destino: media, formulario (con sesión) y listado.
export default function Resenas({ destinoId, onCambio }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()
  const [datos, setDatos] = useState(null)
  const [rating, setRating] = useState(0)
  const [comentario, setComentario] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState("")

  const cargar = async () => {
    try {
      const d = await getResenas(destinoId)
      setDatos(d)
      setRating(d.mi_resena?.rating || 0)
      setComentario(d.mi_resena?.comentario || "")
      return d
    } catch {
      setDatos({ promedio: 0, total: 0, mi_resena: null, resenas: [] })
    }
  }

  useEffect(() => { cargar() }, [destinoId]) // eslint-disable-line react-hooks/exhaustive-deps

  const enviar = async (e) => {
    e.preventDefault()
    if (!rating) { setError("Elige de 1 a 5 estrellas"); return }
    setEnviando(true); setError("")
    try {
      await guardarResena(destinoId, rating, comentario.trim() || null)
      const d = await cargar()
      onCambio?.(d)
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo guardar la reseña")
    } finally {
      setEnviando(false)
    }
  }

  const eliminar = async () => {
    if (!window.confirm("¿Eliminar tu reseña?")) return
    setEnviando(true)
    try {
      await borrarResena(destinoId)
      const d = await cargar()
      onCambio?.(d)
    } finally {
      setEnviando(false)
    }
  }

  if (!datos) return <section className={styles.seccion}><p className={styles.cargando}>Cargando reseñas…</p></section>

  const otras = datos.resenas.filter(r => r.usuario_id !== user?.id)

  return (
    <section className={styles.seccion} aria-labelledby={`resenas-${destinoId}`}>
      <div className={styles.cabecera}>
        <h3 id={`resenas-${destinoId}`}>Reseñas</h3>
        {datos.total > 0 ? (
          <div className={styles.media}>
            <Estrellas valor={Math.round(datos.promedio)} tamano={15} />
            <span>{datos.promedio.toFixed(1)} · {datos.total} {datos.total === 1 ? "reseña" : "reseñas"}</span>
          </div>
        ) : (
          <span className={styles.sinResenas}>Aún no hay reseñas</span>
        )}
      </div>

      {isAuthenticated ? (
        <form className={styles.form} onSubmit={enviar}>
          <label className={styles.etiqueta}>{datos.mi_resena ? "Tu reseña" : "¿Lo visitaste? Cuéntanos"}</label>
          <Estrellas valor={rating} onElegir={(n) => { setRating(n); setError("") }} tamano={24} />
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Comentario (opcional)"
            maxLength={1000}
            rows={3}
          />
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.acciones}>
            {datos.mi_resena && (
              <button type="button" className={styles.secundario} onClick={eliminar} disabled={enviando}>Eliminar</button>
            )}
            <button type="submit" className={styles.primario} disabled={enviando}>
              {enviando ? "Guardando…" : datos.mi_resena ? "Actualizar reseña" : "Publicar reseña"}
            </button>
          </div>
        </form>
      ) : (
        <p className={styles.invitacion}>
          <Link to="/login" state={{ from: location }}>Inicia sesión</Link> para dejar tu reseña.
        </p>
      )}

      {otras.length > 0 && (
        <ul className={styles.lista}>
          {otras.map(r => (
            <li key={r.id} className={styles.item}>
              <div className={styles.autor}>
                <strong>{r.user?.nombre || "Viajero"}</strong>
                <Estrellas valor={r.rating} tamano={13} />
                <time dateTime={r.fecha}>{new Date(r.fecha).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" })}</time>
              </div>
              {r.comentario && <p>{r.comentario}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
