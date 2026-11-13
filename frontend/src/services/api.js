import axios from 'axios';
import { API_URL } from '../api/config';

const api = axios.create({
  baseURL: API_URL, // definido en frontend/.env (VITE_API_URL)
  headers: { Accept: 'application/json' },
});

// Interceptor: agrega el token a cada petición si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: si el backend responde 401 a una petición que llevaba token,
// el token caducó o fue revocado → cerrar la sesión local y mandar al login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const llevabaToken = !!error.config?.headers?.Authorization;
    if (error.response?.status === 401 && llevabaToken) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?sesion=expirada';
      }
    }
    return Promise.reject(error);
  }
);

export default api;