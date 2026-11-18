import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, soloAdmin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation()

  // Con el usuario guardado se muestra la página de inmediato; sin él, se espera a /perfil
  if (loading && !user) return null

  if (!user) {
    // Guarda a dónde quería ir para redirigir después del login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Páginas de administración: solo usuarios con rol "admin"
  if (soloAdmin && user.rol !== "admin") {
    return <Navigate to="/" replace />
  }

  return children
}