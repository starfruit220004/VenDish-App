import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Storage Keys (must match AuthContext.STORAGE_KEYS) ───────────────────────
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

const PRODUCTION_BASE_URL = 'https://vendish-food-business-sales-optimzation.onrender.com';
const ENV_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL?.trim();

const BASE_URL = (() => {
  if (!ENV_BASE_URL) return PRODUCTION_BASE_URL;

  const normalized = ENV_BASE_URL.replace(/\/+$/, '');
  // if (normalized.includes('ngrok-free.dev')) return PRODUCTION_BASE_URL;

  return normalized;
})();

const PUBLIC_PATH_PREFIXES = [
  '/firstapp/products/',
  '/firstapp/categories/',
  '/firstapp/coupons/',
  '/firstapp/contact-page/',
  '/firstapp/about/',
  '/firstapp/services-page/',
  '/firstapp/home/',
  '/firstapp/reviews/',
  '/firstapp/users/register/',
  '/firstapp/users/verify-email/',
  '/firstapp/users/resend-verification-email/',
  '/request-otp/',
  '/verify-otp/',
  '/change-password-token/',
  '/firstapp/token/',
  '/firstapp/token/refresh/',
];

const isPublicPath = (url = '') => {
  if (!url) return false;

  const pathOnly = url.startsWith('http')
    ? `/${url.split('/').slice(3).join('/')}`
    : url;

  return PUBLIC_PATH_PREFIXES.some((prefix) => pathOnly.startsWith(prefix));
};

// ─── Logout handler registration ─────────────────────────────────────────────
// AuthProvider registers a callback so the interceptor can reset React state
// when a refresh token dies. Tokens are already cleared from AsyncStorage here.
let _logoutHandler = null;
export const setLogoutHandler = (handler) => {
  _logoutHandler = handler;
};

// ─── Refresh queue: prevents parallel 401s from firing multiple refreshes ────
let _isRefreshing = false;
let _refreshSubscribers = [];

const onRefreshed = (newToken) => {
  _refreshSubscribers.forEach((cb) => cb(newToken));
  _refreshSubscribers = [];
};

const onRefreshFailed = () => {
  _refreshSubscribers.forEach((cb) => cb(null));
  _refreshSubscribers = [];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const clearAuthTokens = async () => {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
};

const handleLogout = async () => {
  await clearAuthTokens();
  if (_logoutHandler) {
    try { _logoutHandler(); } catch (_) { /* safety */ }
  }
};

// ─── Axios instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420',
  },
  timeout: 20000,
});

// 1. REQUEST INTERCEPTOR — attach the access token to every outgoing request
api.interceptors.request.use(
  async (config) => {
    try {
      const publicEndpoint = isPublicPath(config.url);

      if (!publicEndpoint) {
        const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('Error retrieving access token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. RESPONSE INTERCEPTOR — automatically refresh the token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh for 401 errors, and only once per request
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If another request is already refreshing, queue this one
    if (_isRefreshing) {
      return new Promise((resolve, reject) => {
        _refreshSubscribers.push((newToken) => {
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          } else {
            reject(error);
          }
        });
      });
    }

    originalRequest._retry = true;
    _isRefreshing = true;

    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        await handleLogout();
        _isRefreshing = false;
        onRefreshFailed();
        return Promise.reject(error);
      }

      // Ask the backend for a fresh access token
      const res = await axios.post(`${BASE_URL}/firstapp/token/refresh/`, {
        refresh: refreshToken,
      });

      const newAccessToken = res.data.access;
      const newRefreshToken = res.data.refresh;

      // Persist new tokens
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
      if (newRefreshToken) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
      }

      _isRefreshing = false;
      onRefreshed(newAccessToken);

      // Retry the original request with the fresh token
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (_refreshError) {
      // Refresh failed — tokens are dead, clean up everything
      console.warn('Session expired. Clearing tokens and logging out.');
      await handleLogout();
      _isRefreshing = false;
      onRefreshFailed();
      return Promise.reject(error);
    }
  }
);

export default api;
