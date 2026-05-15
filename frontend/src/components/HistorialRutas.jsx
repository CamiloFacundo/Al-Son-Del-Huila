import { motion, AnimatePresence } from "framer-motion"
import {
  PiMapPinDuotone,
  PiClockDuotone,
  PiTrashDuotone,
  PiArrowRightDuotone,
  PiPlusDuotone,
} from "react-icons/pi"
import styles from "./HistorialRutas.module.css"

export default function HistorialRutas({
  rutas,
  rutaActiva,
  onSeleccionar,
  onEliminar,
  onNueva,
  usuario,
}) {
  const DIFICULTAD = ["", "Fácil", "Moderada", "Difícil"]
  const DIFICULTAD_COLOR = ["", "#52c07a", "#D4A843", "#e05252"]

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.titulo}>Mis rutas</h3>
        {usuario && (
          <motion.button
            className={styles.btnNueva}
            onClick={onNueva}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PiPlusDuotone size={14} />
            Nueva
          </motion.button>
        )}
      </div>

      {rutas.length === 0 ? (
        <div className={styles.empty}>
          <span>✈️</span>
          <p>No tienes rutas guardadas</p>
          <span className={styles.emptyHint}>
            Habla con Huily para crear tu primera ruta
          </span>
        </div>
      ) : (
        <div className={styles.lista}>
          <AnimatePresence>
            {rutas.map((ruta, i) => (
              <motion.div
                key={ruta.id}
                className={`${styles.rutaCard} ${rutaActiva?.id === ruta.id ? styles.activa : ""}`}
                onClick={() => onSeleccionar(ruta)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0   }}
                exit={{   opacity: 0, x: -10   }}
                transition={{ delay: i * 0.05  }}
                whileHover={{ x: 3 }}
              >
                <div
                  className={styles.rutaImagen}
                  style={{
                    background: ruta.imagen
                      ? `url(${ruta.imagen}) center/cover`
                      : `linear-gradient(135deg, #C4622D44, #D4A84344)`
                  }}
                >
                  <span className={styles.rutaNumDestinos}>
                    {ruta.destinos?.length || 0}
                  </span>
                </div>

                <div className={styles.rutaInfo}>
                  <span className={styles.rutaNombre}>{ruta.nombre}</span>
                  <div className={styles.rutaMeta}>
                    <span>
                      <PiMapPinDuotone size={11} />
                      {ruta.destinos?.length || 0} destinos
                    </span>
                    {ruta.duracion_horas && (
                      <span>
                        <PiClockDuotone size={11} />
                        {ruta.duracion_horas}h
                      </span>
                    )}
                    {ruta.dificultad && (
                      <span style={{ color: DIFICULTAD_COLOR[ruta.dificultad] }}>
                        {DIFICULTAD[ruta.dificultad]}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.rutaAcciones}>
                  {usuario && onEliminar && (
                    <button
                      className={styles.btnEliminar}
                      onClick={e => { e.stopPropagation(); onEliminar(ruta.id) }}
                    >
                      <PiTrashDuotone size={13} />
                    </button>
                  )}
                  <PiArrowRightDuotone
                    size={14}
                    className={`${styles.arrow} ${rutaActiva?.id === ruta.id ? styles.arrowActive : ""}`}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}