import { useEffect, useMemo, useState } from "react"
import { PiPlusDuotone, PiPencilDuotone, PiMagnifyingGlassDuotone, PiXDuotone, PiImageDuotone } from "react-icons/pi"
import api from "../services/api"
import styles from "./Admin.module.css"

const VACIO = {
  nombre: "", descripcion: "", categoria_id: "", municipio_id: "", entorno_id: "",
  latitud: "", longitud: "", direccion: "", horario: "", estado: true, etiquetas: [], tipos_viajero: [],
}

// Panel para usuarios con rol "admin": gestionar el catálogo de destinos.
export default function Admin() {
  const [destinos, setDestinos] = useState(null)
  const [opciones, setOpciones] = useState({ categorias: [], municipios: [], entornos: [], etiquetas: [], tipos: [] })
  const [busqueda, setBusqueda] = useState("")
  const [verInactivos, setVerInactivos] = useState(false)
  const [editando, setEditando] = useState(null) // null | { ...form, id? }
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState({})
  const [aviso, setAviso] = useState("")
  const [foto, setFoto] = useState({ archivo: null, autor: "", licencia: "", fuente: "" })

  useEffect(() => {
    const cargar = async () => {
      const [d, cat, mun, ent, etq, tv] = await Promise.all([
        api.get("/admin/destinos"), api.get("/categorias"), api.get("/municipios"),
        api.get("/entornos"), api.get("/etiquetas"), api.get("/tipos-viajero"),
      ])
      setDestinos(d.data)
      setOpciones({ categorias: cat.data, municipios: mun.data, entornos: ent.data, etiquetas: etq.data, tipos: tv.data })
    }
    cargar().catch(() => setDestinos([]))
  }, [])

  const filtrados = useMemo(() => {
    if (!destinos) return []
    const q = busqueda.trim().toLowerCase()
    return destinos.filter(d =>
      (verInactivos || d.estado) &&
      (!q || d.nombre.toLowerCase().includes(q) || d.municipio?.nombre.toLowerCase().includes(q))
    )
  }, [destinos, busqueda, verInactivos])

  const mostrarAviso = (texto) => { setAviso(texto); setTimeout(() => setAviso(""), 3000) }

  const abrir = (d) => {
    setErrores({})
    setFoto({ archivo: null, autor: d?.imagen_autor || "", licencia: d?.imagen_licencia || "", fuente: d?.imagen_fuente || "" })
    setEditando(d ? {
      id: d.id, nombre: d.nombre, descripcion: d.descripcion || "", categoria_id: d.categoria_id, municipio_id: d.municipio_id,
      entorno_id: d.entorno_id || "", latitud: d.latitud, longitud: d.longitud, direccion: d.direccion || "",
      horario: d.horario || "", estado: !!d.estado, imagen: d.imagen,
      etiquetas: d.etiquetas.map(e => e.id), tipos_viajero: d.tipos_viajero.map(t => t.id),
    } : { ...VACIO })
  }

  const campo = (nombre) => ({
    value: editando[nombre] ?? "",
    onChange: (e) => setEditando({ ...editando, [nombre]: e.target.value }),
  })

  const alternarEnLista = (lista, id) => {
    const actual = editando[lista]
    setEditando({ ...editando, [lista]: actual.includes(id) ? actual.filter(x => x !== id) : [...actual, id] })
  }

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true); setErrores({})
    const datos = {
      ...editando,
      entorno_id: editando.entorno_id || null,
      categoria_id: Number(editando.categoria_id) || null,
      municipio_id: Number(editando.municipio_id) || null,
    }
    try {
      let { data } = editando.id
        ? await api.put(`/admin/destinos/${editando.id}`, datos)
        : await api.post("/admin/destinos", datos)

      if (foto.archivo) {
        const fd = new FormData()
        fd.append("imagen", foto.archivo)
        if (foto.autor) fd.append("autor", foto.autor)
        if (foto.licencia) fd.append("licencia", foto.licencia)
        if (foto.fuente) fd.append("fuente", foto.fuente)
        data = (await api.post(`/admin/destinos/${data.id}/imagen`, fd)).data
      }

      setDestinos(prev => {
        const sin = prev.filter(d => d.id !== data.id)
        return [...sin, data].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
      })
      setEditando(null)
      mostrarAviso(editando.id ? "Destino actualizado" : "Destino creado")
    } catch (err) {
      setErrores(err.response?.data?.errors || { general: [err.response?.data?.message || "No se pudo guardar"] })
    } finally {
      setGuardando(false)
    }
  }

  const desactivar = async () => {
    if (!window.confirm(`¿Desactivar "${editando.nombre}"? Dejará de verse en la web (no se borra).`)) return
    await api.delete(`/admin/destinos/${editando.id}`)
    setDestinos(prev => prev.map(d => d.id === editando.id ? { ...d, estado: false } : d))
    setEditando(null)
    mostrarAviso("Destino desactivado")
  }

  const Error = ({ de }) => errores[de] ? <span className={styles.errorCampo}>{errores[de][0]}</span> : null

  return (
    <div className={styles.page}>
      <header className={styles.cabecera}>
        <div>
          <p className={styles.eyebrow}>Administración</p>
          <h1>Destinos</h1>
          <p className={styles.sub}>
            {destinos ? `${destinos.filter(d => d.estado).length} activos · ${destinos.filter(d => !d.imagen).length} sin foto` : "Cargando…"}
          </p>
        </div>
        <button className={styles.primario} onClick={() => abrir(null)}><PiPlusDuotone /> Nuevo destino</button>
      </header>

      {aviso && <div className={styles.aviso} role="status">{aviso}</div>}

      <div className={styles.barra}>
        <label className={styles.buscador}>
          <PiMagnifyingGlassDuotone />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por nombre o municipio" aria-label="Buscar destinos" />
        </label>
        <label className={styles.check}>
          <input type="checkbox" checked={verInactivos} onChange={e => setVerInactivos(e.target.checked)} /> Ver desactivados
        </label>
      </div>

      {!destinos ? <p className={styles.sub}>Cargando…</p> : (
        <div className={styles.tablaWrap}>
          <table className={styles.tabla}>
            <thead>
              <tr><th>Foto</th><th>Nombre</th><th>Municipio</th><th>Categoría</th><th>Reseñas</th><th></th></tr>
            </thead>
            <tbody>
              {filtrados.map(d => (
                <tr key={d.id} className={d.estado ? "" : styles.inactivo}>
                  <td>{d.imagen ? <img src={d.imagen} alt="" className={styles.miniatura} /> : <span className={styles.sinFoto}><PiImageDuotone /></span>}</td>
                  <td><strong>{d.nombre}</strong>{!d.estado && <span className={styles.badge}>Desactivado</span>}</td>
                  <td>{d.municipio?.nombre}</td>
                  <td>{d.categoria?.nombre}</td>
                  <td>{d["total_reseñas"] > 0 ? `★ ${Number(d.rating_promedio).toFixed(1)} (${d["total_reseñas"]})` : "—"}</td>
                  <td><button className={styles.iconoBtn} onClick={() => abrir(d)} aria-label={`Editar ${d.nombre}`}><PiPencilDuotone /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtrados.length === 0 && <p className={styles.sub}>No hay destinos que coincidan.</p>}
        </div>
      )}

      {editando && (
        <div className={styles.overlay} onClick={() => setEditando(null)}>
          <form className={styles.modal} onClick={e => e.stopPropagation()} onSubmit={guardar} noValidate>
            <div className={styles.modalCabecera}>
              <h2>{editando.id ? "Editar destino" : "Nuevo destino"}</h2>
              <button type="button" className={styles.iconoBtn} onClick={() => setEditando(null)} aria-label="Cerrar"><PiXDuotone /></button>
            </div>

            {errores.general && <div className={styles.errorGeneral}>{errores.general[0]}</div>}

            <div className={styles.rejilla}>
              <label className={styles.ancho}>Nombre *<input {...campo("nombre")} maxLength={150} /><Error de="nombre" /></label>
              <label className={styles.ancho}>Descripción<textarea {...campo("descripcion")} rows={4} /></label>
              <label>Categoría *
                <select {...campo("categoria_id")}><option value="">Elegir…</option>{opciones.categorias.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}</select>
                <Error de="categoria_id" />
              </label>
              <label>Municipio *
                <select {...campo("municipio_id")}><option value="">Elegir…</option>{opciones.municipios.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}</select>
                <Error de="municipio_id" />
              </label>
              <label>Entorno
                <select {...campo("entorno_id")}><option value="">Sin especificar</option>{opciones.entornos.map(o => <option key={o.id} value={o.id}>{o.nombre}</option>)}</select>
              </label>
              <label>Horario<input {...campo("horario")} maxLength={100} /></label>
              <label>Latitud *<input {...campo("latitud")} inputMode="decimal" placeholder="2.9273" /><Error de="latitud" /></label>
              <label>Longitud *<input {...campo("longitud")} inputMode="decimal" placeholder="-75.2819" /><Error de="longitud" /></label>
              <label className={styles.ancho}>Dirección<input {...campo("direccion")} maxLength={255} /></label>
            </div>

            <fieldset className={styles.grupo}>
              <legend>Etiquetas</legend>
              {opciones.etiquetas.map(o => (
                <label key={o.id} className={styles.chipCheck}>
                  <input type="checkbox" checked={editando.etiquetas.includes(o.id)} onChange={() => alternarEnLista("etiquetas", o.id)} /> {o.nombre}
                </label>
              ))}
            </fieldset>
            <fieldset className={styles.grupo}>
              <legend>Tipo de viajero</legend>
              {opciones.tipos.map(o => (
                <label key={o.id} className={styles.chipCheck}>
                  <input type="checkbox" checked={editando.tipos_viajero.includes(o.id)} onChange={() => alternarEnLista("tipos_viajero", o.id)} /> {o.nombre}
                </label>
              ))}
            </fieldset>

            <fieldset className={styles.grupo}>
              <legend>Foto</legend>
              {editando.imagen && <img src={editando.imagen} alt="" className={styles.fotoActual} />}
              <div className={styles.rejilla}>
                <label className={styles.ancho}>{editando.imagen ? "Reemplazar foto" : "Subir foto"}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setFoto({ ...foto, archivo: e.target.files[0] || null })} />
                  <Error de="imagen" />
                </label>
                <label>Autor<input value={foto.autor} onChange={e => setFoto({ ...foto, autor: e.target.value })} placeholder="Equipo Al Son del Huila" /></label>
                <label>Licencia<input value={foto.licencia} onChange={e => setFoto({ ...foto, licencia: e.target.value })} placeholder="CC BY-SA 4.0 (si aplica)" /></label>
                <label className={styles.ancho}>Enlace a la fuente<input value={foto.fuente} onChange={e => setFoto({ ...foto, fuente: e.target.value })} placeholder="https://commons.wikimedia.org/..." /><Error de="fuente" /></label>
              </div>
              <p className={styles.nota}>Se reduce a 1200 px y se convierte a WebP. Usa solo fotos propias o con licencia libre.</p>
            </fieldset>

            <div className={styles.acciones}>
              {editando.id && editando.estado && <button type="button" className={styles.peligro} onClick={desactivar}>Desactivar</button>}
              {editando.id && !editando.estado && (
                <label className={styles.check}><input type="checkbox" checked={editando.estado} onChange={e => setEditando({ ...editando, estado: e.target.checked })} /> Reactivar</label>
              )}
              <span className={styles.espacio} />
              <button type="button" className={styles.secundario} onClick={() => setEditando(null)}>Cancelar</button>
              <button type="submit" className={styles.primario} disabled={guardando}>{guardando ? "Guardando…" : "Guardar"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
