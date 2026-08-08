import axios from 'axios';

const BASE_URL = import.meta.env.VITE_APIURL || 'https://notes-backend.phaneendra73.workers.dev';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// Attach JWT token to every request if present
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear stale JWT and redirect to signin (HashRouter-aware)
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('jwt');
      if (typeof window !== 'undefined' && !window.location.hash.includes('/signin')) {
        window.location.hash = '#/signin';
      }
    }
    return Promise.reject(err);
  }
);

export default client;
