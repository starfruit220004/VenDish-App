// app/services/authServices.tsx
import api from '../../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const deactivateAccount = async (password: string, contextToken: string | null = null) => {
  // 1. Try the token passed from React Context
  let token = contextToken;

  // 2. FALLBACK: If Context is mysteriously null, fetch directly from physical storage
  if (!token) {
    console.log("Context token was missing, fetching directly from AsyncStorage...");
    token = await AsyncStorage.getItem('access_token');
  }

  // 3. Final safety check
  if (!token) {
    throw new Error("Missing authentication token. Please log out and log in again.");
  }

  console.log("Token successfully found. Proceeding with deactivation...");

  // Force the token into the headers
  return api.post(
    '/firstapp/users/deactivate/', 
    { password },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};