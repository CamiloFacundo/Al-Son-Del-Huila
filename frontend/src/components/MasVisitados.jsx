import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { PiFireDuotone, PiArrowRightBold } from "react-icons/pi"
import { getPopulares } from "../api/destinos"
import DestinoCard from "./DestinoCard"
import styles from "./MasVisitados.module.css"

// Portada: los destinos cuya ficha más se abre (y, sin visitas aún, los mejor valorados)
export default function MasVisitados() {
  const [destinos, setDestinos] = useState(null)

  useEffect(() => {
    getPopulares(6).then(setDestinos).catch(() => setDestinos([]))
  }, [])

  if (destinos && destinos.length === 0) return null

  return (
    <section className={styles.seccion} aria-labelledby="mas-visitados-titulo">
      <div className={styles.contenedor}>
        <header className={styles.cabecera}>
          <div>
            <span className={styles.etiqueta}><PiFireDuotone size={15} aria-hidden="true" /> Lo que más miran los viajeros</span>
            <h2 id="mas-visitados-titulo">Los más visitados</h2>
            <p>Los destinos del Huila que más consultan quienes usan Al Son del Huila.</p>
          </div>
          <Link to="/catalogo" className={styles.verTodos}>
            Ver todos los destinos <PiArrowRightBold size={13} aria-hidden="true" />
          </Link>
        </header>

        {destinos === null ? (
          <div className={styles.rejilla} aria-busy="true">
            {Array.from({ length: 6 }, (_, i) => <span key={i} className={styles.esqueleto} />)}
          </div>
        ) : (
          <div className={styles.rejilla}>
            {destinos.map((d, i) => (
              <div key={d.id} className={styles.celda}>
                <span className={styles.puesto} aria-label={`Puesto ${i + 1}`}>{i + 1}</span>
                <DestinoCard destino={d} index={i} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
