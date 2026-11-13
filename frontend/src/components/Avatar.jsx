import styles from "./Avatar.module.css"

// Colores cálidos de la marca para el fondo de las iniciales
const COLORES = ["#C4622D", "#8a4b2a", "#a8432f", "#7a6432", "#2f5d3a", "#3d6b6b", "#2e6a7a", "#6b5a7a"]

function colorPara(texto) {
  let h = 0
  for (const c of texto) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return COLORES[h % COLORES.length]
}

function iniciales(nombre) {
  const partes = (nombre || "?").trim().split(/\s+/).filter(Boolean)
  return ((partes[0]?.[0] || "?") + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase()
}

// Foto del usuario o, si no tiene, sus iniciales (sin servicios externos: no enviamos nombres a terceros)
export default function Avatar({ nombre, foto, tamano = 40, className = "" }) {
  const estilo = { width: tamano, height: tamano, fontSize: Math.round(tamano * 0.4) }

  if (foto) {
    return <img src={foto} alt="" className={`${styles.avatar} ${className}`} style={estilo} referrerPolicy="no-referrer" />
  }

  return (
    <span className={`${styles.avatar} ${styles.iniciales} ${className}`} style={{ ...estilo, background: colorPara(nombre || "?") }} aria-hidden="true">
      {iniciales(nombre)}
    </span>
  )
}
