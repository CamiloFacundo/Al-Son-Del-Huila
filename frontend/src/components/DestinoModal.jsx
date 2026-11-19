import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PiMapPinDuotone,
  PiTagDuotone,
  PiTreeDuotone,
  PiHouseLineDuotone,
  PiClockDuotone,
  PiTextAlignLeftDuotone,
  PiXDuotone,
} from "react-icons/pi";
import styles from "./DestinoModal.module.css";
import CreditoImagen from "./CreditoImagen";
import BotonFavorito from "./BotonFavorito";
import Resenas from "./Resenas";
import { visualCategoria } from "../utils/categoriaVisual";
import { registrarVisita } from "../api/destinos";

export default function DestinoModal({ destino, isOpen, onClose }) {
  // Cada ficha abierta cuenta como visita (alimenta «Los más visitados» de la portada)
  useEffect(() => {
    if (isOpen && destino?.id) registrarVisita(destino.id);
  }, [isOpen, destino?.id]);

  if (!isOpen || !destino) return null;

  const { Icon: IconoCategoria, fondo } = visualCategoria(destino.categoria_id);

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
                <div className={styles.modalImagePlaceholder} style={{ background: fondo }}>
                  <IconoCategoria aria-hidden="true" />
                </div>
              )}
            </div>
            <CreditoImagen destino={destino} />

            {/* Título */}
            <div className={styles.modalTituloFila}>
              <h2 className={styles.modalTitle}>{destino.nombre}</h2>
              <BotonFavorito destino={destino} />
            </div>

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

            </div>

            <Resenas destinoId={destino.id} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}