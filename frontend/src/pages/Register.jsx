import { Link } from "react-router-dom"
import { API_URL } from "../api/config"
import { motion } from "framer-motion"
import {
  PiUserDuotone,
  PiEnvelopeDuotone,
  PiLockDuotone,
  PiShieldDuotone,
} from "react-icons/pi"
import AuthInput    from "../components/Auth/AuthInput"
import AuthButton   from "../components/Auth/AuthButton"
import GoogleButton from "../components/Auth/GoogleButton"
import { useRegister, getPasswordStrength } from "../hooks/useAuth"
import styles from "./Register.module.css"
import logo from "../assets/images/logo.png"

function PasswordStrength({ password }) {
  const { score, label, color } = getPasswordStrength(password)
  if (!password) return null
  return (
    <div className={styles.strength}>
      <div className={styles.strengthBars}>
        {[0,1,2,3].map(i => (
          <div
            key={i}
            className={styles.strengthBar}
            style={{ backgroundColor: i < score ? color : "#1e1b17" }}
          />
        ))}
      </div>
      {label && <span style={{ color, fontSize: "0.72rem" }}>{label}</span>}
    </div>
  )
}

export default function Register() {
  const { fields, errors, globalError, loading, handleChange, handleSubmit } = useRegister()
const handleGoogle = () => {
  window.location.href = `${API_URL}/auth/google`
}
  return (
    <div className={styles.page}>
      <div className={styles.bgGlow} />

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ duration: 0.5, ease: [0.4,0,0.2,1] }}
      >
        <Link to="/" className={styles.logoRow}>
          <img src={logo} alt="logo" className={styles.logoImg} />
          <span className={styles.logoName}>
            Al Son <span>del Huila</span>
          </span>
        </Link>

        <h1 className={styles.heading}>Crea tu cuenta</h1>
        <p className={styles.subheading}>Únete gratis y descubre el Huila</p>

        {globalError && (
          <motion.div
            className={styles.errorBanner}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ⚠ {globalError}
          </motion.div>
        )}

        <GoogleButton onClick={handleGoogle} label="Registrarse con Google" />

        <div className={styles.divider}>
          <span /><p>o con tu email</p><span />
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <AuthInput
            label="Nombre completo"
            type="text"
            name="name"
            value={fields.name}
            onChange={handleChange}
            error={errors.name}
            icon={PiUserDuotone}
            autoComplete="name"
          />
          <AuthInput
            label="Correo electrónico"
            type="email"
            name="email"
            value={fields.email}
            onChange={handleChange}
            error={errors.email}
            icon={PiEnvelopeDuotone}
            autoComplete="email"
          />
          <AuthInput
            label="Contraseña"
            type="password"
            name="password"
            value={fields.password}
            onChange={handleChange}
            error={errors.password}
            icon={PiLockDuotone}
            autoComplete="new-password"
          />
          <PasswordStrength password={fields.password} />
          <AuthInput
            label="Confirmar contraseña"
            type="password"
            name="confirmPassword"
            value={fields.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            icon={PiShieldDuotone}
            autoComplete="new-password"
          />

          <label className={`${styles.consentimiento} ${errors.aceptaTerminos ? styles.consentimientoError : ""}`}>
            <input type="checkbox" name="aceptaTerminos" checked={fields.aceptaTerminos} onChange={handleChange}
              aria-invalid={!!errors.aceptaTerminos} aria-describedby={errors.aceptaTerminos ? "error-terminos" : undefined} />
            <span>
              Acepto los <Link to="/terminos" target="_blank" rel="noopener">Términos de uso</Link> y autorizo el
              tratamiento de mis datos según la <Link to="/privacidad" target="_blank" rel="noopener">Política de privacidad</Link>.
            </span>
          </label>
          {errors.aceptaTerminos && <p id="error-terminos" className={styles.consentimientoMensaje}>{errors.aceptaTerminos}</p>}

          <AuthButton loading={loading}>Crear cuenta</AuthButton>
        </form>

        <p className={styles.terms}>
          Si te registras con Google, al continuar aceptas los{" "}
          <Link to="/terminos" target="_blank" rel="noopener">Términos de uso</Link> y la{" "}
          <Link to="/privacidad" target="_blank" rel="noopener">Política de privacidad</Link>.
        </p>

        <p className={styles.footer}>
          ¿Ya tienes cuenta?{" "}
          <Link to="/login">Iniciar sesión</Link>
        </p>
      </motion.div>
    </div>
  )
}