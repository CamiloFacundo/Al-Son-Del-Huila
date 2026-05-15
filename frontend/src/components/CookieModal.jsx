import { motion } from 'framer-motion';
import { PiXDuotone } from 'react-icons/pi';
import styles from './CookieModal.module.css';

export default function CookieModal({ isOpen, onClose, onSave }) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const analytics = e.target.analytics.checked;
    const marketing = e.target.marketing.checked;
    onSave({ analytics, marketing });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <motion.div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <div className={styles.header}>
          <h2>Configuración de cookies</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <PiXDuotone size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.section}>
            <label className={styles.option}>
              <input type="checkbox" disabled checked readOnly />
              <div>
                <strong>Cookies necesarias</strong>
                <p>Imprescindibles para el funcionamiento básico de la plataforma (sesión, seguridad).</p>
              </div>
            </label>
          </div>
          <div className={styles.section}>
            <label className={styles.option}>
              <input type="checkbox" name="analytics" defaultChecked={false} />
              <div>
                <strong>Cookies de análisis</strong>
                <p>Nos ayudan a mejorar la experiencia midiendo el uso de la página.</p>
              </div>
            </label>
          </div>
          <div className={styles.section}>
            <label className={styles.option}>
              <input type="checkbox" name="marketing" defaultChecked={false} />
              <div>
                <strong>Cookies de marketing</strong>
                <p>Permiten mostrarte contenido personalizado y publicidad relevante.</p>
              </div>
            </label>
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary}>
              Guardar preferencias
            </button>
          </div>
        </form>
        <p className={styles.footerNote}>
          Para más información, consulta nuestra{' '}
          <a href="/privacidad" target="_blank">Política de Privacidad</a>.
        </p>
      </motion.div>
    </div>
  );
}