// =====================================================
// CONFIGURACIÓN DE GROQ CON RAG (BÚSQUEDA DE DESTINOS)
// =====================================================
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

// Cache simple para búsquedas repetitivas
let busquedaCache = new Map()
const CACHE_TTL = 60000 // 1 minuto

/**
 * Busca destinos relevantes en el backend según la consulta del usuario.
 * @param {string} consulta - Texto de la pregunta del usuario.
 * @returns {Promise<Array>} - Lista de destinos (máximo 6).
 */
async function buscarDestinosRelevantes(consulta) {
  if (!consulta || consulta.trim().length < 3) return []

  // Verificar caché
  const cacheKey = consulta.toLowerCase().trim()
  if (busquedaCache.has(cacheKey)) {
    const { timestamp, data } = busquedaCache.get(cacheKey)
    if (Date.now() - timestamp < CACHE_TTL) return data
  }

  try {
    const res = await fetch(`http://127.0.0.1:8000/api/destinos/buscar?q=${encodeURIComponent(consulta)}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const relevantes = data.slice(0, 6) // máximo 6 destinos
    busquedaCache.set(cacheKey, { timestamp: Date.now(), data: relevantes })
    return relevantes
  } catch (error) {
    console.error("Error en búsqueda de destinos:", error)
    return []
  }
}

/**
 * Obtiene destinos populares (fallback cuando no hay resultados de búsqueda).
 * @returns {Promise<Array>}
 */
async function obtenerDestinosPopulares() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/destinos?limit=6")
    const data = await res.json()
    return data
  } catch {
    return []
  }
}

/**
 * Construye el prompt del sistema con los destinos relevantes.
 * @param {Array} destinos - Lista de destinos.
 * @param {Object|null} contexto - Ruta activa, etc.
 * @returns {string}
 */
function construirSistemaPrompt(destinos, contexto = null) {
  const listaDestinos = destinos.map(d => {
    const categoria = d.categoria?.nombre || d.categoria || "Sin categoría"
    const municipio = d.municipio?.nombre || d.municipio || "Ubicación no especificada"
    return `- ID ${d.id}: ${d.nombre} (${municipio} - ${categoria})`
  }).join('\n')

  let contextoStr = ""
  if (contexto?.rutaActiva) {
    contextoStr = `\nContexto: El usuario tiene seleccionada la ruta "${contexto.rutaActiva}". Destinos en esa ruta: ${contexto.destinos?.map(d => d.nombre).join(', ') || 'ninguno'}\n`
  }

  return `Eres Huily, asistente experto en turismo del departamento del Huila (Colombia). Hablas español, eres cálido, entusiasta y preciso.

REGLAS ESTRICTAS:
- SOLO puedes recomendar los destinos que aparecen en la lista siguiente. NO inventes destinos fuera de esta lista.
- Si el usuario pregunta por algo que no está en la lista, sugiere el destino más cercano o pide más detalles.
- Cuando menciones uno o varios destinos, agrega al FINAL de tu respuesta: [DESTINOS: id1,id2,id3]
- Cuando generes una ruta personalizada, usa este formato exacto: [RUTA: {"nombre": "Nombre de la ruta", "destinos": [id1,id2], "dias": N}]
- Si el usuario sube una imagen, analízala y relaciónala con destinos de la lista (puedes sugerir destinos con características similares).
- Responde en máximo 3 párrafos. Sé conciso pero útil.
${contextoStr}
DESTINOS DISPONIBLES PARA RECOMENDAR (solo estos):
${listaDestinos || "No hay destinos disponibles temporalmente. Responde con disculpa y sugiere intentar más tarde."}

Recuerda: SIEMPRE termina con la etiqueta [DESTINOS: ...] cuando recomiendes algún lugar.`
}

/**
 * Función principal para enviar mensaje a Groq (con soporte para imágenes y búsqueda RAG).
 * @param {Array} mensajes - Historial de mensajes (rol, texto, imagen opcional).
 * @param {Object|null} contexto - Contexto actual (rutaActiva, destinos).
 * @returns {Promise<string>}
 */
export async function enviarMensaje(mensajes, contexto = null) {
  // 1. Si no hay API key, usar simulación
  if (!GROQ_API_KEY || GROQ_API_KEY === "undefined") {
    console.warn("Groq API key no configurada. Usando simulación.")
    return simularRespuesta(mensajes)
  }

  try {
    // 2. Extraer la última consulta del usuario (texto, sin imagen)
    const ultimoMensajeUsuario = [...mensajes].reverse().find(m => m.rol === "user" && !m.imagen)
    const consulta = ultimoMensajeUsuario?.texto || ""

    // 3. Buscar destinos relevantes en el backend
    let destinosRelevantes = []
    if (consulta) {
      destinosRelevantes = await buscarDestinosRelevantes(consulta)
    }

    // 4. Si no hay resultados, usar destinos populares (para no dejar al usuario sin opciones)
    if (destinosRelevantes.length === 0) {
      destinosRelevantes = await obtenerDestinosPopulares()
    }

    // 5. Construir el prompt del sistema con los destinos encontrados
    const sistemaPrompt = construirSistemaPrompt(destinosRelevantes, contexto)

    // 6. Preparar los mensajes para Groq (con soporte de imágenes)
    const mensajesFormateados = []
    for (const m of mensajes) {
      if (m.imagen) {
        mensajesFormateados.push({
          role: "user",
          content: [
            { type: "image_url", image_url: { url: m.imagen } },
            { type: "text", text: m.texto || "¿Qué destino del Huila se parece a esta imagen?" }
          ]
        })
      } else {
        mensajesFormateados.push({
          role: m.rol === "user" ? "user" : "assistant",
          content: m.texto
        })
      }
    }

    // 7. Elegir modelo: con visión si hay imagen, si no el mejor para texto
    const tieneImagen = mensajes.some(m => m.imagen)
    const modelo = tieneImagen ? "llama-3.5-11b-vision-preview" : "llama-3.3-70b-versatile"

    const payload = {
      model: modelo,
      temperature: 0.7,
      max_tokens: 1024,
      messages: [
        { role: "system", content: sistemaPrompt },
        ...mensajesFormateados
      ]
    }

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Groq API error:", errorData)
      throw new Error(errorData.error?.message || "Error en la petición")
    }

    const data = await response.json()
    return data.choices[0].message.content

  } catch (error) {
    console.error("Error en enviarMensaje:", error)
    return simularRespuesta(mensajes)
  }
}

/**
 * Respuesta simulada (fallback cuando falla la API o no hay key)
 */
function simularRespuesta(mensajes) {
  const ultimoMensaje = mensajes[mensajes.length - 1]?.texto || ""
  const tieneImagen = mensajes.some(m => m.imagen)

  if (tieneImagen) {
    return "He analizado la imagen. Parece ser un paisaje natural. En el Huila, lugares como el Desierto de la Tatacoa o la Cascada de Bordones tienen características similares. ¿Te gustaría más información?\n\n[DESTINOS: 1, 140]"
  }

  if (ultimoMensaje.toLowerCase().includes("ruta")) {
    return "Claro, puedo sugerirte una ruta de 2 días por el sur del Huila:\n- Día 1: Desierto de la Tatacoa (Villavieja) y Observatorio Astronómico.\n- Día 2: Parque Arqueológico de San Agustín y Estrecho del Magdalena.\n\n[RUTA: {\"nombre\":\"Ruta Arqueológica y Desierto\",\"destinos\":[1,115,180,181],\"dias\":2}]"
  }

  return `Claro, te recomiendo visitar estos destinos del Huila:
- Desierto de la Tatacoa (Villavieja) - Naturaleza y astronomía
- Termales de Rivera (Rivera) - Relax
- Parque Arqueológico de San Agustín (San Agustín) - Cultura milenaria

[DESTINOS: 1, 5, 12]`
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