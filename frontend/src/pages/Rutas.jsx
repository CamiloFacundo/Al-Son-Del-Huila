import { useState, useEffect, useCallback, useMemo } from "react"
import { PiChatCircleDotsDuotone, PiMapTrifoldDuotone } from "react-icons/pi"
import { useAuth } from "../context/AuthContext"
import { getDestinos } from "../api/destinos"
import { getRutas, crearRuta, eliminarRuta } from "../api/rutas"
import HistorialRutas from "../components/HistorialRutas"
import ChatRutas from "../components/ChatRutas"
import MapaRutas from "../components/MapaRutas"
import DestinoModal from "../components/DestinoModal"
import styles from "./Rutas.module.css"

// Huily: chat para armar rutas + "Mis rutas" + mapa con las paradas
export default function Rutas() {
  const { user } = useAuth()

  const [todosDestinos, setTodosDestinos] = useState([])
  const [rutasApi, setRutasApi] = useState([])
  const [cargandoRutas, setCargandoRutas] = useState(true)
  const [pestana, setPestana] = useState("chat")
  const [rutaActiva, setRutaActiva] = useState(null)
  const [mapa, setMapa] = useState({ destinos: [], titulo: null, destacado: null })
  const [ficha, setFicha] = useState(null)
  const [aviso, setAviso] = useState("")

  useEffect(() => {
    getDestinos().then(setTodosDestinos).catch(() => {})
  }, [])

  // Sin sesión no se pide nada: "Mis rutas" muestra la invitación a iniciar sesión
  useEffect(() => {
    if (!user) return
    getRutas().then(setRutasApi).catch(() => setRutasApi([])).finally(() => setCargandoRutas(false))
  }, [user])

  // Las rutas guardan solo los IDs de sus destinos: se convierten en destinos completos para el mapa
  const misRutas = useMemo(() => {
    const porId = new Map(todosDestinos.map(d => [d.id, d]))
    return rutasApi
      .filter(r => user && r.user_id === user.id)
      .map(r => ({ ...r, destinos: (r.destinos || []).map(id => porId.get(Number(id))).filter(Boolean) }))
  }, [rutasApi, todosDestinos, user])

  const mostrarAviso = (texto) => { setAviso(texto); setTimeout(() => setAviso(""), 3000) }

  const verEnMapa = useCallback((destinos, ruta = null, destacado = null) => {
    setMapa({ destinos: destinos || [], titulo: ruta?.nombre || null, destacado })
  }, [])

  const seleccionarRuta = useCallback((ruta) => {
    setRutaActiva(ruta)
    setMapa({ destinos: ruta.destinos, titulo: ruta.nombre, destacado: null })
  }, [])

  const guardarRuta = useCallback(async (ruta) => {
    const nueva = await crearRuta({
      nombre: ruta.nombre,
      dias: ruta.dias,
      destinos: ruta.destinos.map(d => d.id),
      publica: false,
    })
    setRutasApi(prev => [nueva, ...prev])
    mostrarAviso("Ruta guardada en Mis rutas")
  }, [])

  const eliminar = useCallback(async (id) => {
    try {
      await eliminarRuta(id)
      setRutasApi(prev => prev.filter(r => r.id !== id))
      if (rutaActiva?.id === id) {
        setRutaActiva(null)
        setMapa({ destinos: [], titulo: null, destacado: null })
      }
      mostrarAviso("Ruta eliminada")
    } catch {
      mostrarAviso("No se pudo eliminar la ruta. Inténtalo de nuevo.")
    }
  }, [rutaActiva])

  return (
    <div className={styles.page}>
      <h1 className={styles.soloLectores}>Huily: arma tu ruta por el Huila</h1>

      <aside className={styles.panel}>
        <div className={styles.pestanas} role="tablist" aria-label="Huily">
          <button type="button" role="tab" aria-selected={pestana === "chat"} id="tab-chat" aria-controls="panel-chat"
            className={`${styles.pestana} ${pestana === "chat" ? styles.pestanaActiva : ""}`} onClick={() => setPestana("chat")}>
            <PiChatCircleDotsDuotone size={16} aria-hidden="true" /> Huily
          </button>
          <button type="button" role="tab" aria-selected={pestana === "rutas"} id="tab-rutas" aria-controls="panel-rutas"
            className={`${styles.pestana} ${pestana === "rutas" ? styles.pestanaActiva : ""}`} onClick={() => setPestana("rutas")}>
            <PiMapTrifoldDuotone size={16} aria-hidden="true" /> Mis rutas
            {user && misRutas.length > 0 && <span className={styles.contador}>{misRutas.length}</span>}
          </button>
        </div>

        {/* Los dos paneles siguen montados: la conversación no se pierde al cambiar de pestaña */}
        <div id="panel-chat" role="tabpanel" aria-labelledby="tab-chat" className={styles.contenido} hidden={pestana !== "chat"}>
          <ChatRutas rutaActiva={rutaActiva} usuario={user} onVerEnMapa={verEnMapa} onGuardarRuta={guardarRuta} />
        </div>
        <div id="panel-rutas" role="tabpanel" aria-labelledby="tab-rutas" className={styles.contenido} hidden={pestana !== "rutas"}>
          <HistorialRutas
            rutas={misRutas}
            rutaActiva={rutaActiva}
            onSeleccionar={seleccionarRuta}
            onEliminar={eliminar}
            onIrAlChat={() => setPestana("chat")}
            usuario={user}
            cargando={cargandoRutas}
          />
        </div>
      </aside>

      <section className={styles.mapaZona} aria-label="Mapa de la ruta">
        <MapaRutas destinos={mapa.destinos} titulo={mapa.titulo} destacado={mapa.destacado} onVerFicha={setFicha} />
      </section>

      {aviso && <div className={styles.aviso} role="status">{aviso}</div>}
      <DestinoModal destino={ficha} isOpen={!!ficha} onClose={() => setFicha(null)} />
    </div>
  )
}
