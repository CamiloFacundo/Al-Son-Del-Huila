import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// El login vive solo en AuthContext. Este hook solo maneja el formulario de registro
// y usa register() del contexto para que la sesión quede en un único sitio ('token' y 'user').

// -------------------- VALIDACIONES --------------------
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => password.length >= 8;

// -------------------- REGISTER --------------------
export function useRegister() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fields, setFields] = useState({ name: "", email: "", password: "", confirmPassword: "", aceptaTerminos: false });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFields((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
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
    // Consentimiento informado (Ley 1581 de 2012)
    if (!fields.aceptaTerminos) err.aceptaTerminos = "Debes aceptar los Términos de uso y la Política de privacidad";
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
      await register(fields.name, fields.email, fields.password, fields.aceptaTerminos);
      navigate('/');
    } catch (error) {
      const errores = error.response?.data?.errors;
      if (error.response?.status === 429) {
        setGlobalError("Demasiados intentos. Espera un minuto y vuelve a intentarlo.");
        return;
      }
      setGlobalError(
        (errores && Object.values(errores)[0]?.[0]) ||
        error.response?.data?.message ||
        "Error al crear la cuenta"
      );
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
    handleSubmit,
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