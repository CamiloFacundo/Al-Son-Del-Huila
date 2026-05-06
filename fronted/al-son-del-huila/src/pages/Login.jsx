import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  PiEnvelopeDuotone,
  PiLockDuotone,
} from "react-icons/pi"
import AuthInput   from "../components/auth/AuthInput"
import AuthButton  from "../components/auth/AuthButton"
import GoogleButton from "../components/auth/GoogleButton"
import { useLogin } from "../hooks/useAuth"
import styles from "./Login.module.css"
import logo from "../assets/images/logo.png"

export default function Login() {
  const { fields, errors, globalError, loading, handleChange, handleSubmit } = useLogin()

  // 🔌 GOOGLE: instala firebase y descomenta esto
  // import { signInWithPopup } from 'firebase/auth'
  // import { auth, googleProvider } from '../lib/firebase'
  // const handleGoogle = () => signInWithPopup(auth, googleProvider)
  const handleGoogle = () => alert("Conectar Google OAuth aquí")

  return (
    <div className={styles.page}>

      {/* Fondo decorativo */}
      <div className={styles.bgGlow} />

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ duration: 0.5, ease: [0.4,0,0.2,1] }}
      >
        {/* Logo */}
        <Link to="/" className={styles.logoRow}>
          <img src={logo} alt="logo" className={styles.logoImg} />
          <span className={styles.logoName}>
            Al Son <span>del Huila</span>
          </span>
        </Link>

        <h1 className={styles.heading}>Bienvenido de vuelta</h1>
        <p className={styles.subheading}>Ingresa tus datos para continuar</p>

        {/* Error global */}
        {globalError && (
          <motion.div
            className={styles.errorBanner}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ⚠ {globalError}
          </motion.div>
        )}

        {/* Google */}
        <GoogleButton onClick={handleGoogle} />

        {/* Divider */}
        <div className={styles.divider}>
          <span />
          <p>o con tu email</p>
          <span />
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
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
            autoComplete="current-password"
          />

          <div className={styles.forgotRow}>
            <Link to="/forgot-password" className={styles.forgotLink}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <AuthButton loading={loading}>
            Iniciar sesión
          </AuthButton>
        </form>

        <p className={styles.footer}>
          ¿No tienes cuenta?{" "}
          <Link to="/register">Crear una cuenta</Link>
        </p>
      </motion.div>
    </div>
  )
}