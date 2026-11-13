import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { PiHeartFill, PiHeartDuotone } from "react-icons/pi"
import { useAuth } from "../context/AuthContext"
import { toggleFavorito } from "../api/destinos"
import styles from "./BotonFavorito.module.css"

// Corazón para guardar un destino en favoritos. Sin sesión, lleva al login.
export default function BotonFavorito({ destino, className = "", onChange }) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [favorito, setFavorito] = useState(!!destino.es_favorito)
  const [enviando, setEnviando] = useState(false)

  const alternar = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } })
      return
    }
    if (enviando) return
    setEnviando(true)
    setFavorito(f => !f) // respuesta inmediata; se corrige si falla
    try {
      const { favorito: nuevo } = await toggleFavorito(destino.id)
      setFavorito(nuevo)
      onChange?.(nuevo)
    } catch {
      setFavorito(f => !f)
    } finally {
      setEnviando(false)
    }
  }

  const etiqueta = favorito ? "Quitar de favoritos" : "Guardar en favoritos"

  return (
    <button
      type="button"
      className={`${styles.boton} ${favorito ? styles.activo : ""} ${className}`}
      onClick={alternar}
      aria-pressed={favorito}
      aria-label={etiqueta}
      title={etiqueta}
    >
      {favorito ? <PiHeartFill /> : <PiHeartDuotone />}
    </button>
  )
}
