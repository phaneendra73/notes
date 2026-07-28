import axios from 'axios';
import { getenv } from './getenv.js';

const api = axios.create({
  baseURL: getenv('APIURL'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach JWT token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for unified error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token on 401 if not on signin page
      if (window.location.pathname !== '/signin') {
        localStorage.removeItem('jwt');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
