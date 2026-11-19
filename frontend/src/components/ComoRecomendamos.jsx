import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { PiInfoDuotone, PiCaretDownBold } from "react-icons/pi"
import api from "../services/api"
import styles from "./ComoRecomendamos.module.css"

const PREGUNTAS = [
  { clave: "categorias", ruta: "/categorias", titulo: "Tipo de experiencia", puntos: 3 },
  { clave: "entornos", ruta: "/entornos", titulo: "Entorno", puntos: 2 },
  { clave: "etiquetas", ruta: "/etiquetas", titulo: "Actividades", puntos: 1 },
  { clave: "tipo_viajero", ruta: "/tipos-viajero", titulo: "Con quién viajas", puntos: 1 },
]

/**
 * Transparencia (Ley 1712 de 2014): explica en palabras sencillas por qué salen estos destinos.
 * Refleja la lógica de RecomendadorController (pesos 3-2-1-1 y paradas a menos de 35 km por día).
 */
export default function ComoRecomendamos({ respuestas }) {
  const [nombres, setNombres] = useState({})

  useEffect(() => {
    Promise.all(PREGUNTAS.map(p => api.get(p.ruta).then(r => [p.clave, Object.fromEntries(r.data.map(x => [x.id, x.nombre]))])))
      .then(lista => setNombres(Object.fromEntries(lista)))
      .catch(() => {})
  }, [])

  const elegidos = (clave) => {
    const valor = respuestas?.[clave]
    const ids = Array.isArray(valor) ? valor : valor ? [valor] : []
    return ids.map(id => nombres[clave]?.[id]).filter(Boolean)
  }

  return (
    <details className={styles.panel}>
      <summary className={styles.resumen}>
        <PiInfoDuotone size={20} aria-hidden="true" className={styles.icono} />
        <span>¿Por qué te recomendamos estos destinos?</span>
        <PiCaretDownBold size={13} aria-hidden="true" className={styles.flecha} />
      </summary>

      <div className={styles.cuerpo}>
        <p>
          Tus recomendaciones salen de <strong>lo que respondiste en el quiz</strong> comparado con la información de
          cada destino del catálogo. No usamos tu historial, tu ubicación ni datos de otras personas, y no hay pagos
          que cambien el orden.
        </p>

        <ol className={styles.pasos}>
          <li>
            <strong>Puntuamos cada destino</strong> según cuánto se parece a tus respuestas:
            <ul className={styles.criterios}>
              {PREGUNTAS.map(p => {
                const lista = elegidos(p.clave)
                return (
                  <li key={p.clave}>
                    <span className={styles.criterio}>{p.titulo}</span>
                    <span className={styles.puntos}>+{p.puntos} {p.puntos === 1 ? "punto" : "puntos"}{p.clave === "etiquetas" ? " por cada una" : ""}</span>
                    <span className={styles.elegidos}>{!nombres[p.clave] ? "Cargando…" : lista.length ? lista.join(", ") : "Sin preferencia"}</span>
                  </li>
                )
              })}
            </ul>
          </li>
          <li><strong>Ordenamos de mayor a menor puntaje.</strong> Si dos destinos empatan, el orden es al azar para que descubras lugares distintos.</li>
          <li><strong>Armamos cada día alrededor del mejor destino libre</strong>, con paradas a menos de unos 35 km entre sí, para que no pases el día en la carretera.</li>
        </ol>

        <p className={styles.nota}>
          ¿No te convence? <Link to="/quiz">Responde el quiz de nuevo</Link> o pídele a Huily una ruta a tu medida.
          Puedes borrar tus preferencias o tu cuenta cuando quieras desde tu perfil.
        </p>
      </div>
    </details>
  )
}
