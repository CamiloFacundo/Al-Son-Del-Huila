// =====================================================
// HUILY: asistente de rutas
// La llamada a la IA la hace el backend (POST /api/chat): la API key nunca llega al navegador.
// El backend devuelve { respuesta, destinos: [destino], ruta: {nombre, dias, destinos} | null }
// con los destinos ya validados contra la base de datos.
// =====================================================
import api from "../services/api"

const MAX_HISTORIAL = 10

/**
 * Envía la conversación a Huily.
 * @param {Array} mensajes  [{ rol: "user"|"assistant", texto, imagen? }]
 * @param {Object|null} contexto  { rutaActiva: "nombre", destinos: [ids] }
 * @throws {Error} con .status, .message (texto para el usuario) y .reintentarEn (segundos, si aplica)
 */
export async function enviarMensaje(mensajes, contexto = null) {
  const recientes = mensajes.slice(-MAX_HISTORIAL)
  // Solo se reenvía la foto del último mensaje que tenga una (las fotos pesan)
  const ultimaFoto = recientes.map(m => !!m.imagen).lastIndexOf(true)

  const payload = {
    mensajes: recientes.map((m, i) => ({
      rol: m.rol === "user" ? "user" : "assistant",
      texto: m.texto || "",
      ...(m.imagen && i === ultimaFoto ? { imagen: m.imagen } : {}),
    })),
    contexto: contexto?.rutaActiva
      ? { rutaActiva: contexto.rutaActiva, destinos: (contexto.destinos || []).map(d => d.id ?? d) }
      : null,
  }

  try {
    const { data } = await api.post("/chat", payload, { timeout: 60000 })
    return {
      respuesta: data.respuesta || "",
      destinos: data.destinos || [],
      ruta: data.ruta || null,
    }
  } catch (err) {
    const status = err.response?.status
    const e = new Error(
      status === 429 ? (err.response.data?.message || "Huily está atendiendo muchas preguntas. Espera unos segundos.")
      : status === 422 ? "No pude leer tu mensaje. Si enviaste una foto, prueba con otra más pequeña."
      : status === 503 ? "Huily no está disponible en este servidor."
      : !err.response ? "No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo."
      : (err.response.data?.message || "Huily no pudo responder. Inténtalo de nuevo.")
    )
    e.status = status
    e.reintentarEn = err.response?.data?.reintentar_en
    throw e
  }
}
