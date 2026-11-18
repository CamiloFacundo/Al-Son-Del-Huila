import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/images/logo.png";
import styles from "./GoogleCallback.module.css";

// Vuelta del login con Google: cambia el código de un solo uso por el token y lleva al usuario
// a donde estaba, sin recargar la página (así la barra ya muestra la sesión iniciada).
export default function GoogleCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [fallo, setFallo] = useState(false);
  const yaEjecutado = useRef(false); // StrictMode ejecuta el efecto dos veces y el código solo sirve una vez

  useEffect(() => {
    if (yaEjecutado.current) return;
    yaEjecutado.current = true;

    const destino = localStorage.getItem("redirectAfterGoogle") || "/";
    const irA = (ruta) => {
      localStorage.removeItem("redirectAfterGoogle");
      navigate(ruta, { replace: true });
    };

    if (localStorage.getItem("token")) {
      irA(destino);
      return;
    }

    const code = params.get("code");
    if (params.get("error") || !code) {
      irA("/login?error=google_failed");
      return;
    }

    api
      .post("/auth/google/exchange", { code })
      .then(async ({ data }) => {
        const { token, user } = data;
        if (!user.nombre) user.nombre = user.email ? user.email.split("@")[0] : "Usuario";
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.removeItem("usuario");
        await refreshUser();
        irA(destino);
      })
      .catch(() => {
        setFallo(true);
        setTimeout(() => irA("/login?error=google_failed"), 1200);
      });
  }, [params, navigate, refreshUser]);

  return (
    <div className={styles.pagina} role="status" aria-live="polite">
      <img src={logo} alt="" className={styles.logo} />
      {!fallo && <span className={styles.giro} aria-hidden="true" />}
      <p className={styles.texto}>{fallo ? "No se pudo iniciar sesión con Google" : "Iniciando sesión con Google…"}</p>
    </div>
  );
}
