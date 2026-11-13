import styles from "./CreditoImagen.module.css"

// Las fotos de Wikimedia Commons (CC BY / CC BY-SA) obligan a citar autor y licencia.
export default function CreditoImagen({ destino, className = "" }) {
  if (!destino?.imagen || (!destino.imagen_autor && !destino.imagen_licencia)) return null

  const texto = [destino.imagen_autor, destino.imagen_licencia].filter(Boolean).join(" · ")

  return (
    <p className={`${styles.credito} ${className}`}>
      Foto:{" "}
      {destino.imagen_fuente ? (
        <a href={destino.imagen_fuente} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
          {texto}
        </a>
      ) : (
        texto
      )}
    </p>
  )
}
