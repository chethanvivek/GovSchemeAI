import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token if present in localStorage
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token') || localStorage.getItem('scheme_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor for unified error formatting
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Clear all tokens and cache if expired
      const isAuthRoute = window.location.pathname === '/login' || window.location.pathname === '/register';
      if (!isAuthRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('onboarding');
        localStorage.removeItem('onboarding_completed');
        localStorage.removeItem('scheme_auth_token');
        localStorage.removeItem('scheme_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
