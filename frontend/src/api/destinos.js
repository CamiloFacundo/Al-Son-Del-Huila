import api from '../services/api'

// Se usa la instancia de axios (manda el token si hay sesión), así la API marca es_favorito.

// GET /api/destinos — con filtros opcionales
export async function getDestinos(filtros = {}) {
  const params = {}
  if (filtros.categoria)         params.categoria = filtros.categoria
  if (filtros.entorno)           params.entorno   = filtros.entorno
  if (filtros.municipio)         params.municipio = filtros.municipio
  if (filtros.busqueda)          params.busqueda  = filtros.busqueda
  if (filtros.etiquetas?.length) params.etiquetas = filtros.etiquetas.join(',')

  const { data } = await api.get('/destinos', { params })
  return data
}

// GET /api/destinos/:id
export async function getDestino(id) {
  const { data } = await api.get(`/destinos/${id}`)
  return data
}

// ── Reseñas ──
// GET → { promedio, total, mi_resena, resenas: [...] }
export const getResenas = (destinoId) =>
  api.get(`/destinos/${destinoId}/resenas`).then(r => r.data)

export const guardarResena = (destinoId, rating, comentario) =>
  api.post(`/destinos/${destinoId}/resenas`, { rating, comentario }).then(r => r.data)

export const borrarResena = (destinoId) =>
  api.delete(`/destinos/${destinoId}/resenas`).then(r => r.data)

// ── Favoritos ──
// POST → { favorito: true|false }
export const toggleFavorito = (destinoId) =>
  api.post(`/destinos/${destinoId}/favorito`).then(r => r.data)

export const getFavoritos = () =>
  api.get('/perfil/favoritos').then(r => r.data)

// ── Preferencias del quiz ──
// GET → null si aún no hay | { categorias, entornos, etiquetas, tipo_viajero, dias }
export const getPreferencias = () =>
  api.get('/perfil/preferencias').then(r => (r.data && r.data.categorias ? r.data : null))

export const guardarPreferencias = (prefs) =>
  api.put('/perfil/preferencias', {
    categorias:   prefs.categorias || [],
    entornos:     prefs.entornos || [],
    etiquetas:    prefs.etiquetas || [],
    tipo_viajero: prefs.tipo_viajero ?? null,
    dias:         prefs.dias ?? null,
  }).then(r => r.data)

// «Los más visitados»
export const getPopulares = (limite = 6) =>
  api.get('/destinos/populares', { params: { limite } }).then(r => r.data)

// Suma una visita al abrir la ficha (el backend cuenta una por persona cada 6 horas). No bloquea ni muestra errores.
export const registrarVisita = (destinoId) => {
  if (destinoId) api.post(`/destinos/${destinoId}/visita`).catch(() => {})
}
