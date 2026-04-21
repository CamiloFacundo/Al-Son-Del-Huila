 import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PiMagnifyingGlassDuotone, PiGridFourDuotone, PiListDuotone } from "react-icons/pi"
import FilterSidebar from "../components/FilterSidebar"
import DestinoCard   from "../components/DestinoCard"
import { DESTINOS }  from "../data/destinos"
import styles from "./Catalogo.module.css"

export default function Catalogo() {
  const [busqueda, setBusqueda] = useState("")
  const [vista,    setVista]    = useState("grid") // grid | list
  const [filtros,  setFiltros]  = useState({
    categorias: [],
    entornos:   [],
    etiquetas:  [],
  })

  // Filtrado reactivo
  // Cuando conectes el backend, reemplaza este useMemo
  // por una llamada: GET /api/destinos?categoria=1&entorno=2&etiqueta=3
  const destinosFiltrados = useMemo(() => {
    return DESTINOS.filter(d => {
      // Búsqueda por texto
      if (busqueda) {
        const q = busqueda.toLowerCase()
        const match =
          d.nombre.toLowerCase().includes(q)      ||
          d.descripcion.toLowerCase().includes(q) ||
          d.municipio.toLowerCase().includes(q)
        if (!match) return false
      }

      // Filtro categoría
      if (filtros.categorias.length > 0) {
        if (!filtros.categorias.includes(d.categoria.id)) return false
      }

      // Filtro entorno
      if (filtros.entornos.length > 0) {
        if (!filtros.entornos.includes(d.entorno.id)) return false
      }

      // Filtro etiquetas (al menos una coincide)
      if (filtros.etiquetas.length > 0) {
        const ids = d.etiquetas.map(e => e.id)
        if (!filtros.etiquetas.some(id => ids.includes(id))) return false
      }

      return true
    })
  }, [busqueda, filtros])

  return (
    <main className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.badge}>Explora el Huila</span>
          <h1 className={styles.titulo}>Destinos Turísticos</h1>
          <p className={styles.subtitulo}>
            {destinosFiltrados.length} destinos encontrados
          </p>
        </motion.div>

        {/* Barra de búsqueda + vista */}
        <motion.div
          className={styles.toolbar}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className={styles.searchWrapper}>
            <PiMagnifyingGlassDuotone size={17} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Buscar destino, municipio..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>

          <div className={styles.vistaBtns}>
            <button
              className={`${styles.vistaBtn} ${vista === "grid" ? styles.vistaActive : ""}`}
              onClick={() => setVista("grid")}
            >
              <PiGridFourDuotone size={18} />
            </button>
            <button
              className={`${styles.vistaBtn} ${vista === "list" ? styles.vistaActive : ""}`}
              onClick={() => setVista("list")}
            >
              <PiListDuotone size={18} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Layout sidebar + grid */}
      <div className={styles.layout}>

        {/* Sidebar filtros */}
        <FilterSidebar filtros={filtros} onChange={setFiltros} />

        {/* Grid de destinos */}
        <div className={styles.content}>
          <AnimatePresence mode="popLayout">
            {destinosFiltrados.length > 0 ? (
              <motion.div
                className={`${styles.grid} ${vista === "list" ? styles.gridList : ""}`}
                layout
              >
                {destinosFiltrados.map((d, i) => (
                  <DestinoCard key={d.id} destino={d} index={i} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                className={styles.empty}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className={styles.emptyIcon}>🗺️</span>
                <h3>No encontramos destinos</h3>
                <p>Intenta con otros filtros o términos de búsqueda</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </main>
  )
}
