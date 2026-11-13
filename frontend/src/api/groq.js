// =====================================================
// ASISTENTE HUILY
// La llamada a Groq la hace el backend (POST /api/chat).
// La API key NUNCA debe estar en el frontend: todo lo que
// empieza por VITE_ termina dentro del JS del navegador.
// =====================================================
import api from "../services/api"

/**
 * Envía el historial al backend y devuelve el texto de respuesta de Huily.
 * Lanza un error si el asistente no está disponible (el componente lo muestra).
 * @param {Array} mensajes - Historial de mensajes ({ rol, texto, imagen? }).
 * @param {Object|null} contexto - Ruta activa ({ rutaActiva, destinos }).
 * @returns {Promise<string>}
 */
export async function enviarMensaje(mensajes, contexto = null) {
  const payload = {
    mensajes: mensajes.map(m => ({
      rol: m.rol === "user" ? "user" : "assistant",
      texto: m.texto || "",
      ...(m.imagen ? { imagen: m.imagen } : {}),
    })),
    contexto: contexto?.rutaActiva
      ? {
          rutaActiva: contexto.rutaActiva,
          destinos: (contexto.destinos || []).map(d => d?.nombre ?? String(d)),
        }
      : null,
  }

  const { data } = await api.post("/chat", payload)
  return data.respuesta || ""
}

/**
 * Extrae los IDs de destinos desde la respuesta de la IA.
 */
export function extraerDestinos(texto, todosDestinos) {
  const match = texto.match(/\[DESTINOS:\s*([\d,\s]+)\]/)
  if (!match) return []
  const ids = match[1].split(",").map(id => parseInt(id.trim()))
  return todosDestinos.filter(d => ids.includes(d.id))
}

/**
 * Extrae una ruta en formato JSON desde la respuesta de la IA.
 */
export function extraerRuta(texto, todosDestinos) {
  const match = texto.match(/\[RUTA:\s*({.*?})\]/)
  if (!match) return null
  try {
    const datos = JSON.parse(match[1])
    return {
      ...datos,
      destinos: todosDestinos.filter(d => datos.destinos?.includes(d.id))
    }
  } catch {
    return null
  }
}