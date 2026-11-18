import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

// Hook personalizado para usar el contexto (exportamos 'useAuth' para consistencia)
export const useAuth = () => useContext(AuthContext);

// Usuario guardado de la última visita: se muestra al instante mientras /perfil lo confirma,
// así la barra no enseña "Ingresar" y luego cambia al nombre del usuario.
function usuarioGuardado() {
  if (!localStorage.getItem("token")) return null;
  try {
    const guardado = JSON.parse(localStorage.getItem("user"));
    return guardado && typeof guardado === "object" ? guardado : null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(usuarioGuardado);
  // Solo hay que esperar si hay token guardado (se valida contra /perfil al arrancar)
  const [loading, setLoading] = useState(() => !!localStorage.getItem("token"));

  // Función para refrescar los datos del usuario desde el token actual
  const refreshUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return null;
    }
    try {
      const response = await api.get("/perfil");
      // El backend devuelve { id, nombre, email, ... }
      setUser(response.data);
      // También guardamos en localStorage para rápido acceso (opcional)
      localStorage.setItem("user", JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      // Solo se cierra la sesión si el servidor rechaza el token; sin conexión se mantiene el usuario guardado
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        return null;
      }
      return usuarioGuardado();
    }
  };

  // Al cargar la app, si hay token, pedir los datos del usuario
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // refreshUser pide /perfil (asíncrono); el setState ocurre al llegar la respuesta
      // eslint-disable-next-line react-hooks/set-state-in-effect
      refreshUser().finally(() => setLoading(false));
    }
  }, []);

  // Registro normal (email + password)
  const register = async (nombre, email, password) => {
    try {
      const response = await api.post("/auth/register", {
        nombre,
        email,
        password,
      });
      const { user: userData, token } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error en registro:", error);
      throw error;
    }
  };

  // Login normal (email + password)
  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });
      const { user: userData, token } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  };

  // Cerrar sesión
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Error en logout:", error);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};