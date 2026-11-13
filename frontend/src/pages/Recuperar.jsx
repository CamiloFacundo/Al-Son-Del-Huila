import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { PiEnvelopeDuotone } from "react-icons/pi"
import AuthInput from "../components/Auth/AuthInput"
import AuthButton from "../components/Auth/AuthButton"
import api from "../services/api"
import styles from "./Login.module.css"
import logo from "../assets/images/logo.png"

// Paso 1 de recuperar la contraseña: pedir el enlace por correo
export default function Recuperar() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(""); setMensaje("")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Escribe un correo válido"); return }
    setLoading(true)
    try {
      const { data } = await api.post("/auth/forgot-password", { email })
      setMensaje(data.message)
    } catch (err) {
      setError(err.response?.status === 429
        ? "Demasiados intentos. Espera un minuto y vuelve a intentarlo."
        : err.response?.data?.message || "No se pudo enviar el enlace")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow} />
      <motion.div className={styles.card} initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }}>
        <Link to="/" className={styles.logoRow}>
          <img src={logo} alt="logo" className={styles.logoImg} />
          <span className={styles.logoName}>Al Son <span>del Huila</span></span>
        </Link>

        <h1 className={styles.heading}>¿Olvidaste tu contraseña?</h1>
        <p className={styles.subheading}>Te enviaremos un enlace a tu correo para elegir una nueva.</p>

        {error && <div className={styles.errorBanner} role="alert">⚠ {error}</div>}
        {mensaje && <div className={styles.successBanner} role="status">✓ {mensaje}</div>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <AuthInput
            label="Correo electrónico"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error=""
            icon={PiEnvelopeDuotone}
            autoComplete="email"
          />
          <AuthButton loading={loading}>Enviar enlace</AuthButton>
        </form>

        <p className={styles.footer}>
          ¿La recordaste? <Link to="/login">Volver a iniciar sesión</Link>
        </p>
      </motion.div>
    </div>
  )
}
