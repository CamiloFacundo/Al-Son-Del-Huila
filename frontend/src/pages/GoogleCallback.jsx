import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"

export default function GoogleCallback() {
  const [params] = useSearchParams()

  useEffect(() => {
    const token = params.get("token")
    const id = params.get("id")
    const name = params.get("name")
    const email = params.get("email")
    const foto = params.get("foto")
    const provider = params.get("provider")
    const error = params.get("error")

    if (error || !token) {
      window.location.href = "/login?error=google_failed"
      return
    }

    // Guardar datos en localStorage (sin contexto para simplificar)
    const userData = { id, name, email, foto, provider, token }
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(userData))

    // Redirigir a /perfil (recarga la página)
    window.location.href = "/perfil"
  }, [])

  return <div>Iniciando sesión con Google...</div>
}