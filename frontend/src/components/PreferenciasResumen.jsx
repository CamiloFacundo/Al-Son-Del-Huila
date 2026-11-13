import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { PiCompassDuotone, PiArrowRightDuotone, PiArrowsClockwiseDuotone } from "react-icons/pi"
import api from "../services/api"
import { getPreferencias } from "../api/destinos"
import styles from "./PreferenciasResumen.module.css"

// Resumen en el perfil de las respuestas del quiz guardadas en la cuenta.
export default function PreferenciasResumen() {
  const navigate = useNavigate()
  const [prefs, setPrefs] = useState(undefined) // undefined = cargando, null = sin quiz
  const [nombres, setNombres] = useState({})

  useEffect(() => {
    const cargar = async () => {
      try {
        const [p, cat, ent, etq, tv] = await Promise.all([
          getPreferencias(),
          api.get("/categorias"), api.get("/entornos"), api.get("/etiquetas"), api.get("/tipos-viajero"),
        ])
        const mapa = (lista) => Object.fromEntries(lista.data.map(x => [x.id, x.nombre]))
        setNombres({ categorias: mapa(cat), entornos: mapa(ent), etiquetas: mapa(etq), tipos: mapa(tv) })
        setPrefs(p)
      } catch {
        setPrefs(null)
      }
    }
    cargar()
  }, [])

  if (prefs === undefined) return null

  if (!prefs) {
    return (
      <div className={styles.tarjeta}>
        <PiCompassDuotone size={28} className={styles.icono} />
        <div className={styles.texto}>
          <h3>Tus preferencias de viaje</h3>
          <p>Responde el quiz y guardaremos tus gustos para recomendarte rutas cuando quieras.</p>
        </div>
        <button className={styles.primario} onClick={() => navigate("/quiz")}>
          Hacer el quiz <PiArrowRightDuotone />
        </button>
      </div>
    )
  }

  const grupos = [
    ["Experiencias", prefs.categorias.map(id => nombres.categorias?.[id])],
    ["Entornos", prefs.entornos.map(id => nombres.entornos?.[id])],
    ["Actividades", prefs.etiquetas.map(id => nombres.etiquetas?.[id])],
    ["Viajas", prefs.tipo_viajero ? [nombres.tipos?.[prefs.tipo_viajero]] : []],
    ["Días", prefs.dias ? [`${prefs.dias} ${prefs.dias === 1 ? "día" : "días"}`] : []],
  ].filter(([, valores]) => valores.filter(Boolean).length > 0)

  const verRuta = () => {
    localStorage.setItem("quizRespuestas", JSON.stringify({ ...prefs, dias: prefs.dias || 2 }))
    navigate("/resultado")
  }

  return (
    <div className={styles.tarjeta}>
      <PiCompassDuotone size={28} className={styles.icono} />
      <div className={styles.texto}>
        <h3>Tus preferencias de viaje</h3>
        <dl className={styles.grupos}>
          {grupos.map(([titulo, valores]) => (
            <div key={titulo} className={styles.grupo}>
              <dt>{titulo}</dt>
              <dd>{valores.filter(Boolean).map(v => <span key={v} className={styles.chip}>{v}</span>)}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className={styles.botones}>
        <button className={styles.primario} onClick={verRuta}>
          Ver mi ruta recomendada <PiArrowRightDuotone />
        </button>
        <button className={styles.secundario} onClick={() => navigate("/quiz")}>
          <PiArrowsClockwiseDuotone /> Repetir el quiz
        </button>
      </div>
    </div>
  )
}
