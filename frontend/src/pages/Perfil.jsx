import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  PiHeartDuotone, PiHeartFill, PiMapTrifoldDuotone, PiImagesDuotone, PiChatCircleFill, PiCompassDuotone,
  PiShieldCheckDuotone, PiEnvelopeSimpleDuotone, PiGoogleLogoBold, PiCameraDuotone, PiPencilSimpleDuotone,
  PiSignOutDuotone, PiTrashDuotone, PiCheckBold, PiXBold, PiCheckCircleFill, PiCircleDashedBold, PiArrowRightBold,
  PiCalendarBlankDuotone, PiMapPinDuotone, PiLockKeyDuotone, PiChatCircleDotsDuotone, PiSparkleDuotone,
  PiSquaresFourDuotone, PiUserCircleDuotone, PiImageSquareDuotone, PiWarningCircleDuotone,
} from "react-icons/pi"
import { useAuth } from "../context/AuthContext"
import { getPerfil, updatePerfil, subirFoto, cambiarPassword } from "../api/perfil"
import { getMisPublicaciones, updatePublicacion, deletePublicacion } from "../api/publicaciones"
import { getFavoritos, getDestinos, getPreferencias } from "../api/destinos"
import { getRutas, eliminarRuta } from "../api/rutas"
import DestinoCard from "../components/DestinoCard"
import PreferenciasResumen from "../components/PreferenciasResumen"
import DestinoModal from "../components/DestinoModal"
import portadaPorDefecto from "../assets/images/tatacoa.jpg"
import styles from "./Perfil.module.css"

const PESTANAS = [
  { id: "resumen", label: "Resumen", Icon: PiSquaresFourDuotone },
  { id: "favoritos", label: "Favoritos", Icon: PiHeartDuotone },
  { id: "rutas", label: "Mis rutas", Icon: PiMapTrifoldDuotone },
  { id: "publicaciones", label: "Publicaciones", Icon: PiImagesDuotone },
  { id: "cuenta", label: "Cuenta", Icon: PiShieldCheckDuotone },
]

const ACCESOS = [
  { to: "/rutas", Icon: PiChatCircleDotsDuotone, titulo: "Arma una ruta con Huily", texto: "Cuéntale qué te gusta y te propone un plan por días." },
  { to: "/mapa", Icon: PiMapPinDuotone, titulo: "Explora el mapa", texto: "Encuentra los destinos más cercanos a ti." },
  { to: "/actividades", Icon: PiCameraDuotone, titulo: "Comparte una foto", texto: "Publica tu experiencia en el muro de Actividades." },
  { to: "/quiz", Icon: PiSparkleDuotone, titulo: "Descubre tus gustos", texto: "Responde el quiz y recibe destinos a tu medida." },
]

const TIPOS_FOTO = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_FOTO_MB = 8

const iniciales = (nombre) => (nombre || "U").trim().split(/\s+/).map(p => p[0]).slice(0, 2).join("").toUpperCase()
const fechaCorta = (f) => f ? new Date(f).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }) : ""

// Cuenta que sube hasta el valor (se salta si el usuario prefiere menos movimiento)
function Cifra({ valor }) {
  const [mostrado, setMostrado] = useState(0)
  useEffect(() => {
    if (valor == null) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || valor === 0) {
      const t = setTimeout(() => setMostrado(valor), 0)
      return () => clearTimeout(t)
    }
    let frame
    const inicio = performance.now()
    const paso = (ahora) => {
      const p = Math.min((ahora - inicio) / 700, 1)
      setMostrado(Math.round(valor * (1 - Math.pow(1 - p, 3))))
      if (p < 1) frame = requestAnimationFrame(paso)
    }
    frame = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(frame)
  }, [valor])
  return <>{valor == null ? "—" : mostrado.toLocaleString("es-CO")}</>
}

// Ventana modal sencilla: cierra con Escape y con clic fuera
function Modal({ titulo, onCerrar, children }) {
  useEffect(() => {
    const alPulsar = (e) => { if (e.key === "Escape") onCerrar() }
    document.addEventListener("keydown", alPulsar)
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.removeEventListener("keydown", alPulsar); document.body.style.overflow = overflow }
  }, [onCerrar])

  return (
    <motion.div className={styles.modalFondo} onMouseDown={onCerrar}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-titulo"
        onMouseDown={e => e.stopPropagation()}
        initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
        <header className={styles.modalCabecera}>
          <h2 id="modal-titulo">{titulo}</h2>
          <button type="button" className={styles.iconoBoton} onClick={onCerrar} aria-label="Cerrar"><PiXBold size={14} /></button>
        </header>
        {children}
      </motion.div>
    </motion.div>
  )
}

export default function Perfil() {
  const { logout, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const pestana = PESTANAS.some(p => p.id === params.get("tab")) ? params.get("tab") : "resumen"
  const cambiarPestana = (id) => setParams(id === "resumen" ? {} : { tab: id }, { replace: true })

  const [perfil, setPerfil] = useState(null)
  const [errorCarga, setErrorCarga] = useState("")
  const [favoritos, setFavoritos] = useState(null)
  const [rutas, setRutas] = useState(null)
  const [publicaciones, setPublicaciones] = useState(null)
  const [destinos, setDestinos] = useState([])
  const [tienePreferencias, setTienePreferencias] = useState(null)

  const [aviso, setAviso] = useState(null) // { texto, tipo }
  const [editando, setEditando] = useState(false)
  const [editandoPost, setEditandoPost] = useState(null)
  const [ficha, setFicha] = useState(null)
  const [subiendo, setSubiendo] = useState({ perfil: null, portada: null }) // vista previa mientras sube
  const fotoRef = useRef(null)
  const portadaRef = useRef(null)
  const avisoTimer = useRef(null)

  const mostrarAviso = useCallback((texto, tipo = "ok") => {
    clearTimeout(avisoTimer.current)
    setAviso({ texto, tipo })
    avisoTimer.current = setTimeout(() => setAviso(null), 3200)
  }, [])

  useEffect(() => {
    getPerfil().then(setPerfil).catch(() => setErrorCarga("No se pudo cargar tu perfil. Revisa tu conexión e inténtalo de nuevo."))
    getFavoritos().then(setFavoritos).catch(() => setFavoritos([]))
    getMisPublicaciones().then(d => setPublicaciones(Array.isArray(d) ? d : [])).catch(() => setPublicaciones([]))
    getPreferencias().then(p => setTienePreferencias(!!p)).catch(() => setTienePreferencias(false))
    getDestinos().then(setDestinos).catch(() => {})
    return () => clearTimeout(avisoTimer.current)
  }, [])

  // Las rutas guardan IDs de destinos: se cruzan con el catálogo para mostrar fotos y municipios
  useEffect(() => {
    if (!perfil) return
    getRutas().then(lista => setRutas(lista.filter(r => r.user_id === perfil.id))).catch(() => setRutas([]))
  }, [perfil?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const porId = useMemo(() => new Map(destinos.map(d => [d.id, d])), [destinos])
  const rutasCompletas = useMemo(() => (rutas || []).map(r => ({
    ...r, paradas: (r.destinos || []).map(id => porId.get(Number(id))).filter(Boolean),
  })), [rutas, porId])

  const likesRecibidos = publicaciones?.reduce((s, p) => s + (p.likes_count || 0), 0) ?? null

  const pasosPerfil = perfil ? [
    { hecho: !!perfil.foto, texto: "Sube una foto de perfil", accion: () => fotoRef.current?.click() },
    { hecho: !!perfil.foto_portada, texto: "Elige una portada", accion: () => portadaRef.current?.click() },
    { hecho: !!perfil.bio, texto: "Escribe una bio corta", accion: () => setEditando(true) },
    { hecho: !!perfil.ubicacion, texto: "Indica desde dónde viajas", accion: () => setEditando(true) },
    { hecho: !!tienePreferencias, texto: "Responde el quiz de gustos", accion: () => navigate("/quiz") },
  ] : []
  const completado = pasosPerfil.length ? Math.round(pasosPerfil.filter(p => p.hecho).length / pasosPerfil.length * 100) : 0

  const subir = async (e, tipo) => {
    const archivo = e.target.files?.[0]
    e.target.value = "" // permite volver a elegir el mismo archivo
    if (!archivo) return
    if (!TIPOS_FOTO.includes(archivo.type)) return mostrarAviso("Elige una imagen JPG, PNG, WebP o GIF.", "error")
    if (archivo.size > MAX_FOTO_MB * 1024 * 1024) return mostrarAviso(`La foto no puede pesar más de ${MAX_FOTO_MB} MB.`, "error")

    const vista = URL.createObjectURL(archivo)
    setSubiendo(s => ({ ...s, [tipo]: vista }))
    try {
      await subirFoto(archivo, tipo)
      setPerfil(await getPerfil())
      refreshUser() // la barra de navegación muestra la foto nueva
      mostrarAviso(tipo === "portada" ? "Portada actualizada" : "Foto de perfil actualizada")
    } catch {
      mostrarAviso("No se pudo subir la foto. Inténtalo de nuevo.", "error")
    } finally {
      setSubiendo(s => ({ ...s, [tipo]: null }))
      URL.revokeObjectURL(vista)
    }
  }

  const guardarPerfil = async (datos) => {
    await updatePerfil(datos)
    setPerfil(await getPerfil())
    refreshUser()
    setEditando(false)
    mostrarAviso("Perfil actualizado")
  }

  const guardarPost = async (datos) => {
    await updatePublicacion(editandoPost.id, datos)
    setPublicaciones(prev => prev.map(p => (p.id === editandoPost.id ? { ...p, ...datos } : p)))
    setEditandoPost(null)
    mostrarAviso("Publicación actualizada")
  }

  const borrarPost = async (pub) => {
    if (!window.confirm("¿Eliminar esta publicación? También se borran sus comentarios y no se puede deshacer.")) return
    try {
      await deletePublicacion(pub.id)
      setPublicaciones(prev => prev.filter(p => p.id !== pub.id))
      setEditandoPost(null)
      mostrarAviso("Publicación eliminada")
    } catch {
      mostrarAviso("No se pudo eliminar la publicación.", "error")
    }
  }

  const borrarRuta = async (ruta) => {
    if (!window.confirm(`¿Eliminar la ruta «${ruta.nombre}»? No se puede deshacer.`)) return
    try {
      await eliminarRuta(ruta.id)
      setRutas(prev => prev.filter(r => r.id !== ruta.id))
      mostrarAviso("Ruta eliminada")
    } catch {
      mostrarAviso("No se pudo eliminar la ruta.", "error")
    }
  }

  if (errorCarga) {
    return (
      <div className={styles.estadoPagina}>
        <PiWarningCircleDuotone size={36} aria-hidden="true" />
        <p>{errorCarga}</p>
        <button type="button" className={styles.btnPrimario} onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    )
  }

  if (!perfil) {
    return (
      <div className={styles.page} aria-busy="true">
        <div className={`${styles.portada} ${styles.esqueleto}`} />
        <div className={styles.contenedor}>
          <div className={styles.esqueletoCabecera}>
            <span className={`${styles.esqueleto} ${styles.esqueletoAvatar}`} />
            <span className={`${styles.esqueleto} ${styles.esqueletoLinea}`} />
          </div>
        </div>
      </div>
    )
  }

  const fotoPerfil = subiendo.perfil || perfil.foto
  const fotoPortada = subiendo.portada || perfil.foto_portada
  const esGoogle = perfil.provider === "google"
  const estadisticas = [
    { id: "favoritos", valor: favoritos?.length, label: "Favoritos", Icon: PiHeartDuotone },
    { id: "rutas", valor: rutas?.length, label: "Rutas guardadas", Icon: PiMapTrifoldDuotone },
    { id: "publicaciones", valor: publicaciones?.length, label: "Publicaciones", Icon: PiImagesDuotone },
    { id: "publicaciones", valor: likesRecibidos, label: "Me gusta recibidos", Icon: PiHeartFill },
  ]

  return (
    <div className={styles.page}>
      <h1 className={styles.soloLectores}>Mi perfil</h1>

      {/* ── Portada ── */}
      <div className={styles.portada}>
        <img src={fotoPortada || portadaPorDefecto} alt="" className={`${styles.portadaImg} ${!fotoPortada ? styles.portadaDefecto : ""}`} />
        <div className={styles.portadaVelo} />
        <button type="button" className={styles.btnPortada} onClick={() => portadaRef.current?.click()} disabled={!!subiendo.portada}>
          <PiCameraDuotone size={16} aria-hidden="true" /> {subiendo.portada ? "Subiendo…" : "Cambiar portada"}
        </button>
        <input ref={portadaRef} type="file" accept={TIPOS_FOTO.join(",")} hidden onChange={e => subir(e, "portada")} />
      </div>

      <div className={styles.contenedor}>
        {/* ── Cabecera ── */}
        <section className={styles.cabecera}>
          <div className={styles.avatarZona}>
            <button type="button" className={styles.avatar} onClick={() => fotoRef.current?.click()} aria-label="Cambiar foto de perfil" disabled={!!subiendo.perfil}>
              {fotoPerfil
                ? <img src={fotoPerfil} alt="" />
                : <span className={styles.avatarLetras}>{iniciales(perfil.nombre)}</span>}
              <span className={styles.avatarVelo}>{subiendo.perfil ? <span className={styles.giro} /> : <PiCameraDuotone size={22} />}</span>
            </button>
            <input ref={fotoRef} type="file" accept={TIPOS_FOTO.join(",")} hidden onChange={e => subir(e, "perfil")} />
          </div>

          <div className={styles.identidad}>
            <h2 className={styles.nombre}>{perfil.nombre}</h2>
            <div className={styles.metas}>
              {perfil.ubicacion && <span><PiMapPinDuotone size={14} aria-hidden="true" /> {perfil.ubicacion}</span>}
              <span><PiCalendarBlankDuotone size={14} aria-hidden="true" /> Miembro desde {new Date(perfil.fecha_registro).toLocaleDateString("es-CO", { month: "long", year: "numeric" })}</span>
              {perfil.rol === "admin" && <span className={styles.insignia}>Administrador</span>}
            </div>
            {perfil.bio
              ? <p className={styles.bio}>{perfil.bio}</p>
              : <button type="button" className={styles.enlace} onClick={() => setEditando(true)}>Añade una bio para presentarte</button>}
          </div>

          <div className={styles.accionesCabecera}>
            <button type="button" className={styles.btnSecundario} onClick={() => setEditando(true)}>
              <PiPencilSimpleDuotone size={16} aria-hidden="true" /> Editar perfil
            </button>
            {perfil.rol === "admin" && <Link to="/admin" className={styles.btnSecundario}>Panel admin</Link>}
          </div>
        </section>

        {/* ── Cifras ── */}
        <section className={styles.cifras} aria-label="Tu actividad">
          {estadisticas.map(({ id, valor, label, Icon }) => (
            <button type="button" key={label} className={styles.cifra} onClick={() => cambiarPestana(id)}>
              <Icon size={20} aria-hidden="true" className={styles.cifraIcono} />
              <strong><Cifra valor={valor} /></strong>
              <span>{label}</span>
            </button>
          ))}
        </section>

        {/* ── Completar perfil ── */}
        {completado < 100 && (
          <section className={styles.completar}>
            <div className={styles.completarCabecera}>
              <div>
                <h3>Completa tu perfil</h3>
                <p>Un perfil completo hace que tus publicaciones y rutas se vean mejor.</p>
              </div>
              <span className={styles.completarPorcentaje}>{completado}%</span>
            </div>
            <div className={styles.barra} role="progressbar" aria-valuenow={completado} aria-valuemin={0} aria-valuemax={100} aria-label="Perfil completado">
              <motion.span initial={{ width: 0 }} animate={{ width: `${completado}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
            </div>
            <ul className={styles.pasos}>
              {pasosPerfil.map(p => (
                <li key={p.texto}>
                  <button type="button" className={`${styles.paso} ${p.hecho ? styles.pasoHecho : ""}`} onClick={p.accion} disabled={p.hecho}>
                    {p.hecho ? <PiCheckCircleFill size={18} aria-hidden="true" /> : <PiCircleDashedBold size={18} aria-hidden="true" />}
                    <span>{p.texto}</span>
                    {!p.hecho && <PiArrowRightBold size={12} aria-hidden="true" className={styles.pasoFlecha} />}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── Pestañas ── */}
        <nav className={styles.pestanas} role="tablist" aria-label="Secciones del perfil">
          {PESTANAS.map(({ id, label, Icon }) => (
            <button key={id} type="button" role="tab" aria-selected={pestana === id}
              className={`${styles.pestana} ${pestana === id ? styles.pestanaActiva : ""}`} onClick={() => cambiarPestana(id)}>
              <Icon size={17} aria-hidden="true" /> {label}
              {pestana === id && <motion.span className={styles.pestanaIndicador} layoutId="indicadorPerfil" />}
            </button>
          ))}
        </nav>

        <AnimatePresence mode="wait">
          <motion.div key={pestana} role="tabpanel" className={styles.panel}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>

            {pestana === "resumen" && (
              <div className={styles.resumen}>
                <div className={styles.accesos}>
                  {ACCESOS.map(({ to, Icon, titulo, texto }) => (
                    <Link key={to} to={to} className={styles.acceso}>
                      <span className={styles.accesoIcono}><Icon size={22} aria-hidden="true" /></span>
                      <span className={styles.accesoTexto}><strong>{titulo}</strong><span>{texto}</span></span>
                      <PiArrowRightBold size={14} aria-hidden="true" className={styles.accesoFlecha} />
                    </Link>
                  ))}
                </div>

                <PreferenciasResumen />

                <section className={styles.bloque}>
                  <header className={styles.bloqueCabecera}>
                    <h3>Tus últimos favoritos</h3>
                    {favoritos?.length > 0 && <button type="button" className={styles.enlace} onClick={() => cambiarPestana("favoritos")}>Ver todos</button>}
                  </header>
                  {favoritos === null ? <p className={styles.cargando}>Cargando…</p>
                    : favoritos.length === 0 ? (
                      <p className={styles.textoSuave}>Aún no guardas destinos. Toca el corazón de cualquier destino del <Link to="/catalogo">catálogo</Link>.</p>
                    ) : (
                      <ul className={styles.miniLista}>
                        {favoritos.slice(0, 4).map(d => (
                          <li key={d.id}>
                            <button type="button" onClick={() => setFicha(d)} className={styles.mini}>
                              {d.imagen ? <img src={d.imagen} alt="" loading="lazy" /> : <span className={styles.miniVacia}><PiImageSquareDuotone size={20} /></span>}
                              <span><strong>{d.nombre}</strong><small>{d.municipio?.nombre}</small></span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                </section>
              </div>
            )}

            {pestana === "favoritos" && (
              favoritos === null ? <p className={styles.cargando}>Cargando tus favoritos…</p>
                : favoritos.length === 0 ? (
                  <Vacio Icon={PiHeartDuotone} titulo="Aún no tienes favoritos" texto="Toca el corazón de un destino para guardarlo aquí y tenerlo a mano."
                    accion={<Link to="/catalogo" className={styles.btnPrimario}>Explorar destinos</Link>} />
                ) : (
                  <div className={styles.rejillaFavoritos}>
                    {favoritos.map((d, i) => (
                      <DestinoCard key={d.id} destino={d} index={i}
                        onFavoritoChange={(es) => { if (!es) { setFavoritos(prev => prev.filter(f => f.id !== d.id)); mostrarAviso("Quitado de favoritos") } }} />
                    ))}
                  </div>
                )
            )}

            {pestana === "rutas" && (
              rutas === null ? <p className={styles.cargando}>Cargando tus rutas…</p>
                : rutasCompletas.length === 0 ? (
                  <Vacio Icon={PiMapTrifoldDuotone} titulo="Aún no guardas rutas" texto="Pídele a Huily una ruta por días y pulsa «Guardar ruta» para tenerla aquí."
                    accion={<Link to="/rutas" className={styles.btnPrimario}><PiChatCircleDotsDuotone size={16} /> Hablar con Huily</Link>} />
                ) : (
                  <ul className={styles.rutas}>
                    {rutasCompletas.map(r => {
                      const portada = r.paradas.find(d => d.imagen)?.imagen
                      const municipios = [...new Set(r.paradas.map(d => d.municipio?.nombre).filter(Boolean))]
                      return (
                        <li key={r.id} className={styles.ruta}>
                          <div className={styles.rutaPortada}>
                            {portada ? <img src={portada} alt="" loading="lazy" /> : <PiMapTrifoldDuotone size={28} aria-hidden="true" />}
                            <span className={styles.rutaDias}>{r.dias || 1} {r.dias === 1 ? "día" : "días"}</span>
                          </div>
                          <div className={styles.rutaCuerpo}>
                            <h4>{r.nombre}</h4>
                            <p className={styles.rutaMeta}>{r.paradas.length} paradas · {fechaCorta(r.created_at)}</p>
                            {municipios.length > 0 && <p className={styles.rutaMunicipios}>{municipios.join(" · ")}</p>}
                            <ol className={styles.rutaParadas}>
                              {r.paradas.slice(0, 4).map(d => <li key={d.id}>{d.nombre}</li>)}
                              {r.paradas.length > 4 && <li className={styles.rutaMas}>y {r.paradas.length - 4} más</li>}
                            </ol>
                          </div>
                          <div className={styles.rutaAcciones}>
                            <Link to="/rutas" state={{ rutaId: r.id }} className={styles.btnSecundario}><PiMapTrifoldDuotone size={15} /> Ver en el mapa</Link>
                            <button type="button" className={styles.iconoBoton} onClick={() => borrarRuta(r)} aria-label={`Eliminar la ruta ${r.nombre}`}><PiTrashDuotone size={16} /></button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )
            )}

            {pestana === "publicaciones" && (
              publicaciones === null ? <p className={styles.cargando}>Cargando tus publicaciones…</p>
                : publicaciones.length === 0 ? (
                  <Vacio Icon={PiImagesDuotone} titulo="Aún no has publicado nada" texto="Comparte una foto de tu viaje por el Huila en el muro de Actividades."
                    accion={<Link to="/actividades" className={styles.btnPrimario}><PiCameraDuotone size={16} /> Ir a Actividades</Link>} />
                ) : (
                  <ul className={styles.galeria}>
                    {publicaciones.map(p => (
                      <li key={p.id}>
                        <button type="button" className={styles.foto} onClick={() => setEditandoPost(p)} aria-label={`Editar la publicación ${p.descripcion?.slice(0, 40) || ""}`}>
                          <img src={p.imagen} alt="" loading="lazy" />
                          <span className={styles.fotoVelo}>
                            <span><PiHeartFill size={15} /> {p.likes_count || 0}</span>
                            <span><PiChatCircleFill size={15} /> {p.comentarios_count || 0}</span>
                          </span>
                          {p.ubicacion && <span className={styles.fotoLugar}><PiMapPinDuotone size={12} /> {p.ubicacion}</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                )
            )}

            {pestana === "cuenta" && (
              <div className={styles.cuenta}>
                <section className={styles.tarjeta}>
                  <h3><PiUserCircleDuotone size={20} aria-hidden="true" /> Datos de acceso</h3>
                  <dl className={styles.datos}>
                    <div><dt>Correo</dt><dd><PiEnvelopeSimpleDuotone size={15} aria-hidden="true" /> {perfil.email}</dd></div>
                    <div><dt>Método de acceso</dt><dd>{esGoogle ? <><PiGoogleLogoBold size={15} aria-hidden="true" /> Cuenta de Google</> : <><PiLockKeyDuotone size={15} aria-hidden="true" /> Correo y contraseña</>}</dd></div>
                    <div><dt>Miembro desde</dt><dd>{fechaCorta(perfil.fecha_registro)}</dd></div>
                  </dl>
                </section>

                <section className={styles.tarjeta}>
                  <h3><PiLockKeyDuotone size={20} aria-hidden="true" /> Contraseña</h3>
                  {esGoogle
                    ? <p className={styles.textoSuave}>Entras con Google, así que tu contraseña se administra en tu cuenta de Google.</p>
                    : <FormularioPassword onListo={() => mostrarAviso("Contraseña actualizada")} />}
                </section>

                <section className={`${styles.tarjeta} ${styles.tarjetaSalir}`}>
                  <div>
                    <h3><PiSignOutDuotone size={20} aria-hidden="true" /> Cerrar sesión</h3>
                    <p className={styles.textoSuave}>Sales de tu cuenta en este dispositivo.</p>
                  </div>
                  <button type="button" className={styles.btnPeligro} onClick={logout}><PiSignOutDuotone size={16} /> Cerrar sesión</button>
                </section>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {editando && (
          <Modal titulo="Editar perfil" onCerrar={() => setEditando(false)}>
            <FormularioPerfil perfil={perfil} onGuardar={guardarPerfil} onCancelar={() => setEditando(false)} />
          </Modal>
        )}
        {editandoPost && (
          <Modal titulo="Tu publicación" onCerrar={() => setEditandoPost(null)}>
            <FormularioPost pub={editandoPost} onGuardar={guardarPost} onBorrar={() => borrarPost(editandoPost)} />
          </Modal>
        )}
      </AnimatePresence>

      <DestinoModal destino={ficha} isOpen={!!ficha} onClose={() => setFicha(null)} />

      <AnimatePresence>
        {aviso && (
          <motion.div className={`${styles.aviso} ${aviso.tipo === "error" ? styles.avisoError : ""}`} role="status"
            initial={{ opacity: 0, y: 16, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 10, x: "-50%" }}>
            {aviso.tipo === "error" ? <PiWarningCircleDuotone size={18} /> : <PiCheckCircleFill size={18} />} {aviso.texto}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Vacio({ Icon, titulo, texto, accion }) {
  return (
    <div className={styles.vacio}>
      <span className={styles.vacioIcono}><Icon size={30} aria-hidden="true" /></span>
      <h3>{titulo}</h3>
      <p>{texto}</p>
      {accion}
    </div>
  )
}

function Campo({ label, max, valor, children, ayuda }) {
  return (
    <label className={styles.campo}>
      <span className={styles.campoCabecera}>
        <span>{label}</span>
        {max && <small className={valor.length > max * 0.9 ? styles.contadorAlto : ""}>{valor.length}/{max}</small>}
      </span>
      {children}
      {ayuda && <small className={styles.campoAyuda}>{ayuda}</small>}
    </label>
  )
}

function FormularioPerfil({ perfil, onGuardar, onCancelar }) {
  const [form, setForm] = useState({ nombre: perfil.nombre || "", ubicacion: perfil.ubicacion || "", bio: perfil.bio || "" })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState("")
  const cambiar = (campo) => (e) => setForm(f => ({ ...f, [campo]: e.target.value }))

  const enviar = async (e) => {
    e.preventDefault()
    if (form.nombre.trim().length < 2) return setError("Escribe tu nombre (mínimo 2 letras).")
    setGuardando(true)
    setError("")
    try {
      await onGuardar({ nombre: form.nombre.trim(), ubicacion: form.ubicacion.trim(), bio: form.bio.trim() })
    } catch {
      setError("No se pudieron guardar los cambios. Inténtalo de nuevo.")
      setGuardando(false)
    }
  }

  return (
    <form className={styles.formulario} onSubmit={enviar} noValidate>
      <Campo label="Nombre" max={100} valor={form.nombre}>
        <input value={form.nombre} onChange={cambiar("nombre")} maxLength={100} autoComplete="name" autoFocus />
      </Campo>
      <Campo label="Ubicación" max={100} valor={form.ubicacion} ayuda="Por ejemplo: Neiva, Huila">
        <input value={form.ubicacion} onChange={cambiar("ubicacion")} maxLength={100} placeholder="Ciudad, departamento" />
      </Campo>
      <Campo label="Bio" max={255} valor={form.bio}>
        <textarea value={form.bio} onChange={cambiar("bio")} maxLength={255} rows={4} placeholder="Cuéntale a los demás viajeros qué te gusta del Huila" />
      </Campo>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.formAcciones}>
        <button type="button" className={styles.btnSecundario} onClick={onCancelar}>Cancelar</button>
        <button type="submit" className={styles.btnPrimario} disabled={guardando}>
          {guardando ? "Guardando…" : <><PiCheckBold size={14} /> Guardar cambios</>}
        </button>
      </div>
    </form>
  )
}

function FormularioPost({ pub, onGuardar, onBorrar }) {
  const [form, setForm] = useState({ descripcion: pub.descripcion || "", ubicacion: pub.ubicacion || "" })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState("")

  const enviar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setError("")
    try {
      await onGuardar({ descripcion: form.descripcion.trim(), ubicacion: form.ubicacion.trim() })
    } catch {
      setError("No se pudieron guardar los cambios.")
      setGuardando(false)
    }
  }

  return (
    <form className={styles.formulario} onSubmit={enviar} noValidate>
      <img src={pub.imagen} alt="" className={styles.postVista} />
      <p className={styles.postStats}>
        <span><PiHeartFill size={14} /> {pub.likes_count || 0} me gusta</span>
        <span><PiChatCircleFill size={14} /> {pub.comentarios_count || 0} comentarios</span>
        <span>{fechaCorta(pub.created_at)}</span>
      </p>
      <Campo label="Descripción" max={255} valor={form.descripcion}>
        <textarea value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} maxLength={255} rows={3} />
      </Campo>
      <Campo label="Lugar" max={100} valor={form.ubicacion}>
        <input value={form.ubicacion} onChange={e => setForm(f => ({ ...f, ubicacion: e.target.value }))} maxLength={100} />
      </Campo>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.formAcciones}>
        <button type="button" className={styles.btnPeligroSuave} onClick={onBorrar}><PiTrashDuotone size={15} /> Eliminar</button>
        <button type="submit" className={styles.btnPrimario} disabled={guardando}>{guardando ? "Guardando…" : <><PiCheckBold size={14} /> Guardar</>}</button>
      </div>
    </form>
  )
}

function FormularioPassword({ onListo }) {
  const vacio = { actual: "", nueva: "", repetir: "" }
  const [form, setForm] = useState(vacio)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState("")
  const cambiar = (campo) => (e) => setForm(f => ({ ...f, [campo]: e.target.value }))
  const fuerza = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(form.nueva)).length

  const enviar = async (e) => {
    e.preventDefault()
    setError("")
    if (form.nueva.length < 8) return setError("La nueva contraseña debe tener al menos 8 caracteres.")
    if (form.nueva !== form.repetir) return setError("Las contraseñas nuevas no coinciden.")
    setEnviando(true)
    try {
      await cambiarPassword(form.actual, form.nueva)
      setForm(vacio)
      onListo()
    } catch (err) {
      setError(err.message || "No se pudo cambiar la contraseña.")
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form className={styles.formulario} onSubmit={enviar} noValidate>
      <Campo label="Contraseña actual" valor={form.actual}>
        <input type="password" value={form.actual} onChange={cambiar("actual")} autoComplete="current-password" />
      </Campo>
      <div className={styles.dosColumnas}>
        <Campo label="Nueva contraseña" valor={form.nueva}>
          <input type="password" value={form.nueva} onChange={cambiar("nueva")} autoComplete="new-password" />
        </Campo>
        <Campo label="Repite la nueva" valor={form.repetir}>
          <input type="password" value={form.repetir} onChange={cambiar("repetir")} autoComplete="new-password" />
        </Campo>
      </div>
      {form.nueva && (
        <div className={styles.fuerza} data-nivel={fuerza}>
          <span /><span /><span /><span />
          <small>{["Muy débil", "Débil", "Aceptable", "Buena", "Fuerte"][fuerza]}</small>
        </div>
      )}
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.formAcciones}>
        <button type="submit" className={styles.btnPrimario} disabled={enviando || !form.actual || !form.nueva}>
          {enviando ? "Actualizando…" : "Actualizar contraseña"}
        </button>
      </div>
    </form>
  )
}
