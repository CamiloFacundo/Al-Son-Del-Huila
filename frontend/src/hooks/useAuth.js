import { useState } from 'react';
import api from '../services/api';  // 👈 Importa tu instancia de axios

// -------------------- VALIDACIONES --------------------
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => password.length >= 8;

// -------------------- LOGIN --------------------
export function useLogin() {
  const [fields, setFields] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (globalError) setGlobalError("");
  };

  const validate = () => {
    const err = {};
    if (!fields.email) err.email = "El email es obligatorio";
    else if (!validateEmail(fields.email)) err.email = "Email inválido";
    if (!fields.password) err.password = "La contraseña es obligatoria";
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: fields.email,
        password: fields.password,
      });
      const data = response.data;
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.user));
      alert('Inicio de sesión exitoso');
      window.location.href = '/';
    } catch (error) {
      setGlobalError(error.response?.data?.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return { fields, errors, globalError, loading, handleChange, handleSubmit };
}

// -------------------- REGISTER (CORREGIDO) --------------------
export function useRegister() {
  const [fields, setFields] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (globalError) setGlobalError("");
  };

  const validate = () => {
    const err = {};
    if (!fields.name.trim()) err.name = "Tu nombre es obligatorio";
    if (!fields.email) err.email = "El email es obligatorio";
    else if (!validateEmail(fields.email)) err.email = "Email inválido";
    if (!fields.password) err.password = "La contraseña es obligatoria";
    else if (!validatePassword(fields.password)) err.password = "Mínimo 8 caracteres";
    if (!fields.confirmPassword) err.confirmPassword = "Confirma tu contraseña";
    else if (fields.password !== fields.confirmPassword) err.confirmPassword = "Las contraseñas no coinciden";
    return err;
  };

  // 👇 La función que faltaba: handleSubmit para enviar los datos al backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }
    setLoading(true);
    try {
      // Enviamos el campo 'nombre' (con el valor de fields.name)
      const response = await api.post('/auth/register', {
        nombre: fields.name,
        email: fields.email,
        password: fields.password,
      });
      const data = response.data;
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.user));
      alert('Cuenta creada correctamente');
      window.location.href = '/';
    } catch (error) {
      console.error(error);
      setGlobalError(error.response?.data?.message || "Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return {
    fields,
    errors,
    globalError,
    loading,
    handleChange,
    handleSubmit,   // 👈 Ahora sí se exporta
  };
}

// -------------------- PASSWORD STRENGTH --------------------
export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ["Muy débil", "Débil", "Regular", "Fuerte"];
  const colors = ["#e05252", "#e08852", "#D4A843", "#52c07a"];
  return { score, label: labels[score - 1] || "", color: colors[score - 1] || "" };
}