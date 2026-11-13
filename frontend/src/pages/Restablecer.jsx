import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { PiLockDuotone } from "react-icons/pi"
import AuthInput from "../components/Auth/AuthInput"
import AuthButton from "../components/Auth/AuthButton"
import api from "../services/api"
import styles from "./Login.module.css"
import logo from "../assets/images/logo.png"

// Paso 2 de recuperar la contraseña: se llega desde el enlace del correo (?token=...&email=...)
export default function Restablecer() {
  const [params] = useSearchParams()
  const token = params.get("token") || ""
  const email = params.get("email") || ""

  const [password, setPassword] = useState("")
  const [confirmacion, setConfirmacion] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [listo, setListo] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres"); return }
    if (password !== confirmacion) { setError("Las contraseñas no coinciden"); return }
    setLoading(true)
    try {
      await api.post("/auth/reset-password", { token, email, password, password_confirmation: confirmacion })
      setListo(true)
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo cambiar la contraseña")
    } finally {
      setLoading(false)
    }
  }

  const enlaceValido = token && email

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow} />
      <motion.div className={styles.card} initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }}>
        <Link to="/" className={styles.logoRow}>
          <img src={logo} alt="logo" className={styles.logoImg} />
          <span className={styles.logoName}>Al Son <span>del Huila</span></span>
        </Link>

        <h1 className={styles.heading}>Nueva contraseña</h1>

        {!enlaceValido ? (
          <>
            <div className={styles.errorBanner} role="alert">⚠ El enlace está incompleto. Ábrelo de nuevo desde el correo o pide otro.</div>
            <p className={styles.footer}><Link to="/recuperar">Pedir un enlace nuevo</Link></p>
          </>
        ) : listo ? (
          <>
            <div className={styles.successBanner} role="status">✓ Contraseña actualizada. Ya puedes iniciar sesión.</div>
            <p className={styles.footer}><Link to="/login">Iniciar sesión</Link></p>
          </>
        ) : (
          <>
            <p className={styles.subheading}>Para la cuenta <strong>{email}</strong></p>
            {error && <div className={styles.errorBanner} role="alert">⚠ {error}</div>}
            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <AuthInput label="Nueva contraseña" type="password" name="password" value={password}
                onChange={(e) => setPassword(e.target.value)} error="" icon={PiLockDuotone} autoComplete="new-password" />
              <AuthInput label="Repite la contraseña" type="password" name="confirmacion" value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)} error="" icon={PiLockDuotone} autoComplete="new-password" />
              <AuthButton loading={loading}>Guardar contraseña</AuthButton>
            </form>
            <p className={styles.footer}>¿El enlace caducó? <Link to="/recuperar">Pide uno nuevo</Link></p>
          </>
        )}
      </motion.div>
    </div>
  )
}
