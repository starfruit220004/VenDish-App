// app/services/authServices.tsx
//
// The api instance (../../api/api) automatically attaches the access token
// to every request via its request interceptor, and handles 401 refresh
// automatically via its response interceptor.
//
// There is NO need to manually pass tokens or read from AsyncStorage here.

import api from '../../api/api';

export const deactivateAccount = async (password: string) => {
  // Token is auto-attached by the API interceptor — no manual header needed
  return api.post('/firstapp/users/deactivate/', { password });
};