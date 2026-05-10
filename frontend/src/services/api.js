import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Laravel corre en este puerto
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

export default api;