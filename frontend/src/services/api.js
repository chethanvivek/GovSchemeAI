import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper to notify UI of cold start / wakeup state
function notifyServerWakeup(active = true) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('server-wakeup-notice', {
        detail: {
          active,
          message: 'Server is waking up. Connecting...'
        }
      })
    );
  }
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s timeout for Render free-tier cold starts
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

// Retryable status codes for gateway/cold-start issues
const RETRY_STATUS_CODES = [502, 503, 504];

// Response interceptor for automatic retry on 502/503/504 and unified error formatting
api.interceptors.response.use(
  response => {
    // Successful response dismisses any active wakeup notice
    notifyServerWakeup(false);
    return response;
  },
  async error => {
    const config = error.config;
    const status = error.response?.status;
    const isRetryable =
      (status && RETRY_STATUS_CODES.includes(status)) ||
      error.code === 'ECONNABORTED' ||
      (error.message && error.message.toLowerCase().includes('network error')) ||
      (!error.response && Boolean(error.request));

    // Auto-retry up to 2 times with a 2-second delay for cold start / 502 errors
    if (config && isRetryable && !config.skipRetry) {
      config.__retryCount = config.__retryCount || 0;
      if (config.__retryCount < 2) {
        config.__retryCount += 1;
        console.warn(`[API] Server cold start detected (status ${status || error.code}). Retrying attempt ${config.__retryCount}/2 in 2s...`);
        notifyServerWakeup(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return api(config);
      }
    }

    notifyServerWakeup(false);

    // If still failing with 502 / network error, provide a friendly message instead of a raw Axios error
    if (isRetryable) {
      const friendlyNotice = 'Server is waking up. Connecting...';
      if (!error.response) {
        error.response = { status: status || 502, data: {} };
      }
      if (!error.response.data || typeof error.response.data !== 'object') {
        error.response.data = {};
      }
      error.response.data.error = friendlyNotice;
      error.response.data.message = friendlyNotice;
      error.message = friendlyNotice;
    }

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
