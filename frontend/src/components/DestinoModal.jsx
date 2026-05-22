import { motion, AnimatePresence } from "framer-motion";
import {
  PiMapPinDuotone,
  PiTagDuotone,
  PiTreeDuotone,
  PiHouseLineDuotone,
  PiClockDuotone,
  PiStarDuotone,
  PiTextAlignLeftDuotone,
  PiXDuotone,
} from "react-icons/pi";
import styles from "./DestinoModal.module.css";

export default function DestinoModal({ destino, isOpen, onClose }) {
  if (!isOpen || !destino) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.modalOverlay}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
          >
            <button className={styles.closeBtn} onClick={onClose}>
              <PiXDuotone size={20} />
            </button>

            {/* Imagen */}
            <div className={styles.modalImage}>
              {destino.imagen ? (
                <img src={destino.imagen} alt={destino.nombre} />
              ) : (
                <div className={styles.modalImagePlaceholder}>
                  <span>🏞️</span>
                </div>
              )}
            </div>

            {/* Título */}
            <h2 className={styles.modalTitle}>{destino.nombre}</h2>

            {/* Información detallada */}
            <div className={styles.modalInfo}>
              {/* 📝 Descripción */}
              {destino.descripcion && (
                <div className={styles.modalRow}>
                  <PiTextAlignLeftDuotone size={18} className={styles.modalIcon} />
                  <div className={styles.modalColumn}>
                    <strong>Descripción</strong>
                    <p>{destino.descripcion}</p>
                  </div>
                </div>
              )}

              {/* 🏷️ Categoría */}
              <div className={styles.modalRow}>
                <PiTagDuotone size={18} className={styles.modalIcon} />
                <div className={styles.modalColumn}>
                  <strong>Categoría</strong>
                  <span>{destino.categoria?.nombre || destino.categoria || "No especificada"}</span>
                </div>
              </div>

              {/* 🌳 Entorno */}
              {(destino.entorno?.nombre || destino.entorno) && (
                <div className={styles.modalRow}>
                  <PiTreeDuotone size={18} className={styles.modalIcon} />
                  <div className={styles.modalColumn}>
                    <strong>Entorno</strong>
                    <span>{destino.entorno?.nombre || destino.entorno}</span>
                  </div>
                </div>
              )}

              {/* 📍 Ubicación (Municipio) */}
              <div className={styles.modalRow}>
                <PiMapPinDuotone size={18} className={styles.modalIcon} />
                <div className={styles.modalColumn}>
                  <strong>Ubicación</strong>
                  <span>{destino.municipio?.nombre || destino.municipio || "No especificada"}, Huila</span>
                </div>
              </div>

              {/* 🏠 Dirección */}
              {destino.direccion && (
                <div className={styles.modalRow}>
                  <PiHouseLineDuotone size={18} className={styles.modalIcon} />
                  <div className={styles.modalColumn}>
                    <strong>Dirección</strong>
                    <span>{destino.direccion}</span>
                  </div>
                </div>
              )}

              {/* 🕒 Horario */}
              {destino.horario && (
                <div className={styles.modalRow}>
                  <PiClockDuotone size={18} className={styles.modalIcon} />
                  <div className={styles.modalColumn}>
                    <strong>Horario</strong>
                    <span>{destino.horario}</span>
                  </div>
                </div>
              )}

              {/* ⭐ Valoración */}
              {destino.rating_promedio > 0 && (
                <div className={styles.modalRow}>
                  <PiStarDuotone size={18} className={styles.modalIcon} />
                  <div className={styles.modalColumn}>
                    <strong>Valoración</strong>
                    <span>{destino.rating_promedio} / 5 ({destino.total_reseñas || 0} reseñas)</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}