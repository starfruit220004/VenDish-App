import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In React Native, we typically define the key here or import it.
// This key matches the one used in your MainDrawer.tsx
const ACCESS_TOKEN_KEY = '@access_token';

const api = axios.create({
  // NOTE: 'http://127.0.0.1:8000/' works on Web/iOS Simulator but NOT Android Emulator.
  // Use 'http://10.0.2.2:8000/' for Android Emulator to reach localhost.
  // Use your LAN IP (e.g., 192.168.x.x) for physical devices.
  baseURL: 'https://unfluvial-epicontinental-jeffery.ngrok-free.dev', 
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    // Changed from localStorage (synchronous) to AsyncStorage (asynchronous)
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
  (error) => {
    return Promise.reject(error);
  }
);

export default api;