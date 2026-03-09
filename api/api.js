import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const LEGACY_ACCESS_TOKEN_KEY = '@access_token';
const LEGACY_REFRESH_TOKEN_KEY = '@refresh_token';
// const BASE_URL = 'https://vendish-food-business-sales-optimzation.onrender.com';
const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

// --- Logout handler registration (called from MainDrawer on mount) ---
let _logoutHandler = null;
export const setLogoutHandler = (handler) => {
  _logoutHandler = handler;
};

// --- Refresh queue: prevents multiple 401s from firing parallel refresh calls ---
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

// --- Helpers ---
const getStoredToken = async (primaryKey, legacyKey) => {
  const primary = await AsyncStorage.getItem(primaryKey);
  if (primary) return primary;
  return AsyncStorage.getItem(legacyKey);
};

const clearAuthTokens = async () => {
  await AsyncStorage.multiRemove([
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
    LEGACY_ACCESS_TOKEN_KEY,
    LEGACY_REFRESH_TOKEN_KEY,
  ]);
};

const handleLogout = async () => {
  await clearAuthTokens();
  if (_logoutHandler) {
    try { _logoutHandler(); } catch (_) { /* safety */ }
  }
};

// --- Axios instance ---
const api = axios.create({
  baseURL: BASE_URL, 
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "69420", 
  },
});

// 1. REQUEST INTERCEPTOR: Attach the access token to every outgoing request
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getStoredToken(ACCESS_TOKEN_KEY, LEGACY_ACCESS_TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error retrieving access token", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. RESPONSE INTERCEPTOR: Automatically refresh the token if it expires
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

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
      const refreshToken = await getStoredToken(REFRESH_TOKEN_KEY, LEGACY_REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        // No refresh token stored at all — clean up and bail
        await handleLogout();
        _isRefreshing = false;
        onRefreshFailed();
        return Promise.reject(error);
      }

      // Ask Django for a fresh access token
      const res = await axios.post(`${BASE_URL}/firstapp/token/refresh/`, {
        refresh: refreshToken,
      });

      const newAccessToken = res.data.access;
      const newRefreshToken = res.data.refresh;

      // Persist new tokens to both key sets
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
      await AsyncStorage.setItem(LEGACY_ACCESS_TOKEN_KEY, newAccessToken);

      if (newRefreshToken) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        await AsyncStorage.setItem(LEGACY_REFRESH_TOKEN_KEY, newRefreshToken);
      }

      _isRefreshing = false;
      onRefreshed(newAccessToken);

      // Retry the original request with the fresh token
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh failed — tokens are dead, clean up everything
      console.warn("Session expired. Clearing tokens and logging out.");
      await handleLogout();
      _isRefreshing = false;
      onRefreshFailed();
      return Promise.reject(error);
    }
  }
);

export default api;