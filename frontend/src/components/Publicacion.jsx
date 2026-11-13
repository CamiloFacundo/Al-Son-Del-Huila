import { useState, useRef, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  PiMapPinDuotone, PiHeartDuotone, PiHeartFill, PiChatCircleDuotone,
  PiDotsThreeBold, PiPencilSimpleDuotone, PiTrashDuotone, PiPaperPlaneRightDuotone,
} from "react-icons/pi"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"
import Avatar from "./Avatar"
import styles from "./Publicacion.module.css"

function haceCuanto(fecha) {
  const seg = Math.floor((Date.now() - new Date(fecha)) / 1000)
  const pasos = [["año", 31536000], ["mes", 2592000], ["día", 86400], ["hora", 3600], ["minuto", 60]]
  for (const [nombre, s] of pasos) {
    const n = Math.floor(seg / s)
    if (n >= 1) return `hace ${n} ${nombre}${n !== 1 ? (nombre === "mes" ? "es" : "s") : ""}`
  }
  return "hace un momento"
}

const mensajeError = (err, porDefecto) =>
  err.response?.status === 429 ? "Vas muy rápido. Espera un momento." :
  Object.values(err.response?.data?.errors || {})[0]?.[0] || err.response?.data?.message || porDefecto

// Una publicación del muro: foto, likes, comentarios y, para su autor, editar o borrar.
export default function Publicacion({ pub, onCambio, onBorrada, avisar }) {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const esAutor = user && pub.user_id === user.id
  const esAdmin = user?.rol === "admin"

  const [menu, setMenu] = useState(false)
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({ descripcion: pub.descripcion || "", ubicacion: pub.ubicacion || "" })
  const [verComentarios, setVerComentarios] = useState(false)
  const [comentarios, setComentarios] = useState(null)
  const [texto, setTexto] = useState("")
  const [enviando, setEnviando] = useState(false)
  const menuRef = useRef(null)

  // Cerrar el menú al hacer clic fuera
  useEffect(() => {
    if (!menu) return
    const cerrar = (e) => { if (!menuRef.current?.contains(e.target)) setMenu(false) }
    document.addEventListener("mousedown", cerrar)
    return () => document.removeEventListener("mousedown", cerrar)
  }, [menu])

  const irAlLogin = () => navigate("/login", { state: { from: location } })

  const like = async () => {
    if (!isAuthenticated) return irAlLogin()
    // Respuesta inmediata; si falla se revierte
    const antes = { liked_by_user: pub.liked_by_user, likes_count: pub.likes_count }
    onCambio({ ...pub, liked_by_user: !pub.liked_by_user, likes_count: pub.likes_count + (pub.liked_by_user ? -1 : 1) })
    try {
      const { data } = await api.post(`/publicaciones/${pub.id}/like`)
      onCambio({ ...pub, liked_by_user: data.liked, likes_count: data.likes })
    } catch {
      onCambio({ ...pub, ...antes })
    }
  }

  const abrirComentarios = async () => {
    const abrir = !verComentarios
    setVerComentarios(abrir)
    if (abrir && comentarios === null) {
      try {
        const { data } = await api.get(`/publicaciones/${pub.id}/comentarios`)
        setComentarios(data)
      } catch {
        setComentarios([])
      }
    }
  }

  const comentar = async (e) => {
    e.preventDefault()
    if (!texto.trim() || enviando) return
    setEnviando(true)
    try {
      const { data } = await api.post(`/publicaciones/${pub.id}/comentarios`, { texto })
      setComentarios(prev => [...(prev || []), data])
      setTexto("")
      onCambio({ ...pub, comentarios_count: pub.comentarios_count + 1 })
    } catch (err) {
      avisar(mensajeError(err, "No se pudo comentar"), "error")
    } finally {
      setEnviando(false)
    }
  }

  const borrarComentario = async (c) => {
    if (!window.confirm("¿Eliminar este comentario?")) return
    try {
      await api.delete(`/comentarios/${c.id}`)
      setComentarios(prev => prev.filter(x => x.id !== c.id))
      onCambio({ ...pub, comentarios_count: Math.max(0, pub.comentarios_count - 1) })
    } catch (err) {
      avisar(mensajeError(err, "No se pudo eliminar"), "error")
    }
  }

  const guardarEdicion = async (e) => {
    e.preventDefault()
    setEnviando(true)
    try {
      const { data } = await api.put(`/publicaciones/${pub.id}`, {
        descripcion: form.descripcion.trim() || null,
        ubicacion: form.ubicacion.trim() || null,
      })
      onCambio(data)
      setEditando(false)
      avisar("Publicación actualizada")
    } catch (err) {
      avisar(mensajeError(err, "No se pudo guardar"), "error")
    } finally {
      setEnviando(false)
    }
  }

  const borrar = async () => {
    setMenu(false)
    const texto = esAutor ? "¿Eliminar tu publicación? No se puede deshacer." : "¿Eliminar esta publicación como administrador? No se puede deshacer."
    if (!window.confirm(texto)) return
    try {
      await api.delete(`/publicaciones/${pub.id}`)
      onBorrada(pub.id)
      avisar("Publicación eliminada")
    } catch (err) {
      avisar(mensajeError(err, "No se pudo eliminar"), "error")
    }
  }

  const puedeBorrarComentario = (c) => user && (c.usuario_id === user.id || esAutor || esAdmin)

  return (
    <article className={styles.post}>
      <header className={styles.cabecera}>
        <Avatar nombre={pub.user?.nombre} foto={pub.user?.foto} tamano={42} />
        <div className={styles.autor}>
          <strong>{pub.user?.nombre || "Usuario"}</strong>
          {pub.ubicacion && (
            <span className={styles.ubicacion}><PiMapPinDuotone size={12} /> {pub.ubicacion}</span>
          )}
        </div>
        <time className={styles.tiempo} dateTime={pub.created_at}
          title={new Date(pub.created_at).toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" })}>
          {haceCuanto(pub.created_at)}
        </time>

        {(esAutor || esAdmin) && (
          <div className={styles.menuWrap} ref={menuRef}>
            <button className={styles.iconoBtn} onClick={() => setMenu(m => !m)} aria-label="Opciones de la publicación" aria-expanded={menu}>
              <PiDotsThreeBold size={18} />
            </button>
            {menu && (
              <div className={styles.menu} role="menu">
                {esAutor && (
                  <button role="menuitem" onClick={() => { setMenu(false); setEditando(true) }}>
                    <PiPencilSimpleDuotone /> Editar
                  </button>
                )}
                <button role="menuitem" className={styles.peligro} onClick={borrar}>
                  <PiTrashDuotone /> Eliminar
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <img src={pub.imagen} alt={pub.descripcion || `Foto de ${pub.user?.nombre || "un viajero"}`}
        className={styles.foto} loading="lazy" onDoubleClick={() => !pub.liked_by_user && like()} />

      <div className={styles.acciones}>
        <button className={`${styles.accion} ${pub.liked_by_user ? styles.activo : ""}`} onClick={like}
          aria-pressed={!!pub.liked_by_user} aria-label={pub.liked_by_user ? "Quitar me gusta" : "Me gusta"}>
          {pub.liked_by_user ? <PiHeartFill size={20} /> : <PiHeartDuotone size={20} />}
          <span>{pub.likes_count || 0}</span>
        </button>
        <button className={styles.accion} onClick={abrirComentarios} aria-expanded={verComentarios} aria-label="Comentarios">
          <PiChatCircleDuotone size={20} />
          <span>{pub.comentarios_count || 0}</span>
        </button>
      </div>

      {editando ? (
        <form className={styles.edicion} onSubmit={guardarEdicion}>
          <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
            maxLength={255} rows={3} placeholder="Descripción" aria-label="Descripción" />
          <input value={form.ubicacion} onChange={e => setForm({ ...form, ubicacion: e.target.value })}
            maxLength={100} placeholder="Ubicación" aria-label="Ubicación" />
          <div className={styles.botones}>
            <button type="button" className={styles.secundario} onClick={() => { setEditando(false); setForm({ descripcion: pub.descripcion || "", ubicacion: pub.ubicacion || "" }) }}>Cancelar</button>
            <button type="submit" className={styles.primario} disabled={enviando}>{enviando ? "Guardando…" : "Guardar"}</button>
          </div>
        </form>
      ) : pub.descripcion && (
        <p className={styles.descripcion}><strong>{pub.user?.nombre || "Usuario"}</strong> {pub.descripcion}</p>
      )}

      {!verComentarios && pub.comentarios_count > 0 && (
        <button className={styles.verComentarios} onClick={abrirComentarios}>
          Ver {pub.comentarios_count === 1 ? "el comentario" : `los ${pub.comentarios_count} comentarios`}
        </button>
      )}

      {verComentarios && (
        <section className={styles.comentarios} aria-label="Comentarios">
          {comentarios === null ? (
            <p className={styles.suave}>Cargando comentarios…</p>
          ) : (
            <ul>
              {comentarios.map(c => (
                <li key={c.id} className={styles.comentario}>
                  <Avatar nombre={c.user?.nombre} foto={c.user?.foto} tamano={28} />
                  <div className={styles.comentarioCuerpo}>
                    <p><strong>{c.user?.nombre || "Usuario"}</strong> {c.texto}</p>
                    <span className={styles.suave}>
                      {haceCuanto(c.created_at)}
                      {puedeBorrarComentario(c) && (
                        <button className={styles.enlace} onClick={() => borrarComentario(c)}>Eliminar</button>
                      )}
                    </span>
                  </div>
                </li>
              ))}
              {comentarios.length === 0 && <li className={styles.suave}>Aún no hay comentarios. ¡Escribe el primero!</li>}
            </ul>
          )}

          {isAuthenticated ? (
            <form className={styles.nuevoComentario} onSubmit={comentar}>
              <input value={texto} onChange={e => setTexto(e.target.value)} maxLength={500}
                placeholder="Escribe un comentario…" aria-label="Escribe un comentario" />
              <button type="submit" disabled={!texto.trim() || enviando} aria-label="Publicar comentario">
                <PiPaperPlaneRightDuotone size={18} />
              </button>
            </form>
          ) : (
            <p className={styles.suave}><Link to="/login" state={{ from: location }}>Inicia sesión</Link> para comentar.</p>
          )}
        </section>
      )}
    </article>
  )
}
