import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const BASE_URL = 'https://vendish-food-business-sales-optimzation.onrender.com';

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
      const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
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
  (response) => response, // If the response is successful, just return it
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 (Unauthorized) and we haven't tried to retry yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Prevent infinite loops

      try {
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        
        if (refreshToken) {
          // Ask Django for a fresh access token
          const res = await axios.post(`${BASE_URL}/firstapp/token/refresh/`, { 
            refresh: refreshToken 
          });

          const newAccessToken = res.data.access;

          // Save the new token to storage
          await AsyncStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);

          // Update the failed request with the new token and retry it!
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Refresh token expired or invalid. User must log in again.");
        // Optional: You could trigger a full logout sequence here
      }
    }

    return Promise.reject(error);
  }
);

export default api;