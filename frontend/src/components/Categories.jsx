import { motion } from "framer-motion"
import {
  PiMountainsDuotone,
  PiBuildingsDuotone,
  PiBankDuotone,
  PiBookOpenDuotone,
  PiPlanetDuotone,
  PiConfettiDuotone,
} from "react-icons/pi"
import styles from "./Categories.module.css"

// Mapeo de etiquetas a IDs de categoría en la base de datos
const CATEGORIAS = [
  { Icon: PiMountainsDuotone, label: "Aventura",    id: 4 },
  { Icon: PiBuildingsDuotone, label: "Cultural",    id: 2 },
  { Icon: PiBankDuotone,      label: "Arqueológico",id: 3 },
  { Icon: PiBookOpenDuotone,  label: "Histórico",   id: 7 },
  { Icon: PiPlanetDuotone,    label: "Astronomía",  id: 8 },
  { Icon: PiConfettiDuotone,  label: "Festivales",  id: 9 },
]

export default function Categories({ onSelectCategory }) {
  return (
    <div className={styles.wrapper}>
      {CATEGORIAS.map(({ Icon, label, id }, i) => (
        <motion.button
          key={label}
          className={styles.chip}
          initial={{ opacity: 0, y: 12, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.8 + i * 0.07, duration: 0.4 }}
          whileHover={{ scale: 1.07, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectCategory?.(id)}
        >
          <Icon size={16} className={styles.chipIcon} />
          <span>{label}</span>
        </motion.button>
      ))}
    </div>
  )
}