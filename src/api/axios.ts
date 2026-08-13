import axios from 'axios';
import { getAuthToken, clearAuthToken } from '../utils/authToken';
import { store } from '../store/store';
import { clearUser } from '../store/slices/authSlice';

// Public/pre-auth endpoints whose 401s should NOT trigger an auto-logout redirect.
const SKIP_LOGOUT_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh-token',
  '/auth/verify-email',
  '/auth/resend-verification-otp',
];

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const extractErrorMessage = (data: unknown, fallback: string): string => {
  if (data && typeof data === 'object') {
    const message = (data as { message?: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
    if (Array.isArray(message)) {
      const strings = message.filter((item) => typeof item === 'string');
      if (strings.length > 0) {
        return strings.join(', ');
      }
      const firstObject = message.find(
        (item) => item && typeof item === 'object' && typeof item.message === 'string',
      ) as { message?: string } | undefined;
      if (firstObject?.message) {
        return firstObject.message;
      }
    }
  }
  return fallback;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url: string = error.config?.url ?? '';

    if (status === 401 && !SKIP_LOGOUT_PATHS.some((p) => url.includes(p))) {
      clearAuthToken();
      store.dispatch(clearUser());
    }

    const message = extractErrorMessage(
      error.response?.data,
      error.message || 'An error occurred',
    );
    return Promise.reject(new Error(message));
  }
);

export default api;