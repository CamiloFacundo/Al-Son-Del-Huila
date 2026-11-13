import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";

export default function GoogleCallback() {
  const [params] = useSearchParams();
  const yaEjecutado = useRef(false); // StrictMode ejecuta el efecto dos veces y el código solo sirve una vez

  useEffect(() => {
    if (yaEjecutado.current) return;
    yaEjecutado.current = true;

    const redirigir = (ruta) => {
      localStorage.removeItem("redirectAfterGoogle");
      window.location.href = ruta;
    };

    // Si ya hay token, redirigir a la página guardada (o al inicio)
    if (localStorage.getItem("token")) {
      redirigir(localStorage.getItem("redirectAfterGoogle") || "/");
      return;
    }

    const code = params.get("code");
    if (params.get("error") || !code) {
      redirigir("/login?error=google_failed");
      return;
    }

    // El backend manda un código de un solo uso (no el token) y aquí lo cambiamos por el token
    api
      .post("/auth/google/exchange", { code })
      .then(({ data }) => {
        const { token, user } = data;
        if (!user.nombre) {
          user.nombre = user.email ? user.email.split("@")[0] : "Usuario";
        }
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.removeItem("usuario");

        // Volver a la página donde estaba el usuario antes de ir a Google
        redirigir(localStorage.getItem("redirectAfterGoogle") || "/");
      })
      .catch(() => redirigir("/login?error=google_failed"));
  }, [params]);

  return <div>Iniciando sesión con Google...</div>;
}
