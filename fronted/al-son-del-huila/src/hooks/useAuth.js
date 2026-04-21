import { useState } from "react"

const validateEmail    = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
const validatePassword = p => p.length >= 8

export function useLogin() {
  const [fields,      setFields]      = useState({ email: "", password: "" })
  const [errors,      setErrors]      = useState({})
  const [globalError, setGlobalError] = useState("")
  const [loading,     setLoading]     = useState(false)

  const handleChange = e => {
    const { name, value } = e.target
    setFields(p => ({ ...p, [name]: value }))
    if (errors[name])   setErrors(p => ({ ...p, [name]: "" }))
    if (globalError)    setGlobalError("")
  }

  const validate = () => {
    const err = {}
    if (!fields.email)                  err.email    = "El email es obligatorio"
    else if (!validateEmail(fields.email)) err.email = "Email inválido"
    if (!fields.password)               err.password = "La contraseña es obligatoria"
    return err
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const err = validate()
    if (Object.keys(err).length) { setErrors(err); return }
    setLoading(true)
    try {
      // 🔌 CONECTAR BACKEND:
      // const res = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(fields)
      // })
      // const data = await res.json()
      // if (!res.ok) throw new Error(data.message)
      // localStorage.setItem('token', data.token)
      // navigate('/') ← useNavigate de react-router-dom
      await new Promise(r => setTimeout(r, 1400)) // simulación
      console.log("Login OK:", fields)
    } catch (err) {
      setGlobalError(err.message || "Credenciales incorrectas")
    } finally {
      setLoading(false)
    }
  }

  return { fields, errors, globalError, loading, handleChange, handleSubmit }
}

export function useRegister() {
  const [fields,      setFields]      = useState({ name: "", email: "", password: "", confirmPassword: "" })
  const [errors,      setErrors]      = useState({})
  const [globalError, setGlobalError] = useState("")
  const [loading,     setLoading]     = useState(false)

  const handleChange = e => {
    const { name, value } = e.target
    setFields(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }))
    if (globalError)  setGlobalError("")
  }

  const validate = () => {
    const err = {}
    if (!fields.name.trim())                          err.name            = "Tu nombre es obligatorio"
    if (!fields.email)                                err.email           = "El email es obligatorio"
    else if (!validateEmail(fields.email))            err.email           = "Email inválido"
    if (!fields.password)                             err.password        = "La contraseña es obligatoria"
    else if (!validatePassword(fields.password))      err.password        = "Mínimo 8 caracteres"
    if (!fields.confirmPassword)                      err.confirmPassword = "Confirma tu contraseña"
    else if (fields.password !== fields.confirmPassword) err.confirmPassword = "Las contraseñas no coinciden"
    return err
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const err = validate()
    if (Object.keys(err).length) { setErrors(err); return }
    setLoading(true)
    try {
      // 🔌 CONECTAR BACKEND:
      // const res = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(fields)
      // })
      // const data = await res.json()
      // if (!res.ok) throw new Error(data.message)
      // navigate('/login')
      await new Promise(r => setTimeout(r, 1400))
      console.log("Registro OK:", fields)
    } catch (err) {
      setGlobalError(err.message || "Error al crear la cuenta")
    } finally {
      setLoading(false)
    }
  }

  return { fields, errors, globalError, loading, handleChange, handleSubmit }
}

// Strength del password (para Register)
export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "" }
  let score = 0
  if (password.length >= 8)       score++
  if (/[A-Z]/.test(password))     score++
  if (/[0-9]/.test(password))     score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  const labels = ["Muy débil", "Débil", "Regular", "Fuerte"]
  const colors = ["#e05252", "#e08852", "#D4A843", "#52c07a"]
  return { score, label: labels[score - 1] || "", color: colors[score - 1] || "" }
} 
