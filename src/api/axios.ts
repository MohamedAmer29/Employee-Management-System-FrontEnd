import axios from 'axios';
import { toast } from 'react-toastify';
import { getAuthToken, clearAuthToken } from '../utils/authToken';
import { store } from '../store/store';
import { clearUser } from '../store/slices/authSlice';
import { queryClient } from './queryClient';

// Public/pre-auth endpoints whose 401s should NOT trigger an auto-logout redirect.
const SKIP_LOGOUT_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh-token',
  '/auth/logout',
  '/auth/logout-all',
  '/auth/verify-email',
  '/auth/resend-verification-otp',
];

// Logout requests must rely on the httpOnly refresh_token cookie, NOT the
// (possibly expired) access token. Sending an expired access token causes some
// backends to reject the request with 401 before the logout handler runs, so
// the refresh token is never revoked. Omitting the header lets the backend
// revoke/delete the refresh token regardless of access token expiry.
const LOGOUT_PATHS = ['/auth/logout', '/auth/logout-all'];

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const url: string = config.url ?? '';
  const token = getAuthToken();
  if (token && !LOGOUT_PATHS.some((path) => url.includes(path))) {
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

let isHandlingExpiredSession = false;

// Clears local auth state and notifies the backend so the refresh token is
// revoked. Safe to call even when the access token is already invalid.
const forceLogout = () => {
  if (isHandlingExpiredSession) return;
  isHandlingExpiredSession = true;

  try {
    if (getAuthToken()) {
      // Fire-and-forget so the backend deletes the refresh token (cookie).
      const baseUrl = String(import.meta.env.VITE_BACKEND_URL ?? '').replace(
        /\/+$/,
        '',
      );
      axios
        .post(`${baseUrl}/auth/logout`, undefined, {
          withCredentials: true,
          timeout: 10000,
        })
        .catch(() => undefined);
    }
  } finally {
    clearAuthToken();
    queryClient.clear();
    store.dispatch(clearUser());
    toast.error('Your session has expired. Please log in again.', {
      toastId: 'session-expired',
    });
  }
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url: string = error.config?.url ?? '';

    if (status === 401 && !SKIP_LOGOUT_PATHS.some((p) => url.includes(p))) {
      forceLogout();
    }

    const message = extractErrorMessage(
      error.response?.data,
      error.message || 'An error occurred',
    );
    return Promise.reject(new Error(message));
  }
);

export default api;