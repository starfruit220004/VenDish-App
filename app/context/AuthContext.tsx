import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/api'; // Adjust path if necessary

export interface Coupon {
  id: number;
  name: string;
  product_name: string;
  description: string;
  terms: string;
  expiration: string;
  code: string;
  rate: string; 
  status: 'Active' | 'Claimed' | 'Redeemed' | 'Expired';
  image?: any;
}

export interface UserData {
  username: string;
  email: string;
  fullname?: string;
  firstname?: string;
  lastname?: string;
  middlename?: string; // [NEW] Added middle name
  profilePic?: string;
  phone?: string;
  address?: string;
}
export interface AuthContextType {
  isLoggedIn: boolean;
  userData: UserData | null;
  claimedCoupons: Coupon[];
  login: (user: UserData, access: string, refresh: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserData: (user: UserData) => Promise<void>;
  addToWallet: (coupon: Coupon) => Promise<boolean>;
  removeFromWallet: (id: number) => Promise<void>;
  // [NEW] Add deactivate function type
  deactivateAccount: (password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  userData: null,
  claimedCoupons: [],
  login: async () => {},
  logout: async () => {},
  updateUserData: async () => {},
  addToWallet: async () => false,
  removeFromWallet: async () => {},
  deactivateAccount: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [claimedCoupons, setClaimedCoupons] = useState<Coupon[]>([]);

  // Load data on startup
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const user = await AsyncStorage.getItem('user_data');
        const coupons = await AsyncStorage.getItem('claimed_coupons');

        if (token && user) {
          setIsLoggedIn(true);
          setUserData(JSON.parse(user));
        }
        if (coupons) {
          setClaimedCoupons(JSON.parse(coupons));
        }
      } catch (error) {
        console.error('Failed to load auth data', error);
      }
    };
    loadAuthData();
  }, []);

  const login = async (user: UserData, access: string, refresh: string) => {
    try {
      await AsyncStorage.setItem('access_token', access);
      await AsyncStorage.setItem('refresh_token', refresh);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      
      setUserData(user);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('user_data');
      // Optional: Clear coupons on logout? 
      // await AsyncStorage.removeItem('claimed_coupons'); 
      
      setIsLoggedIn(false);
      setUserData(null);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const updateUserData = async (user: UserData) => {
    setUserData(user);
    await AsyncStorage.setItem('user_data', JSON.stringify(user));
  };

  const addToWallet = async (coupon: Coupon): Promise<boolean> => {
    const exists = claimedCoupons.some(c => c.id === coupon.id);
    if (exists) return false;

    const newCoupons = [...claimedCoupons, coupon];
    setClaimedCoupons(newCoupons);
    await AsyncStorage.setItem('claimed_coupons', JSON.stringify(newCoupons));
    return true;
  };

  const removeFromWallet = async (id: number) => {
    const newCoupons = claimedCoupons.filter(c => c.id !== id);
    setClaimedCoupons(newCoupons);
    await AsyncStorage.setItem('claimed_coupons', JSON.stringify(newCoupons));
  };

  // [NEW] Deactivate Account Function
  const deactivateAccount = async (password: string) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) throw new Error("No token found");

      // Call Backend
      await api.post('/firstapp/users/deactivate/', 
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Log out locally on success
      await logout();
      
    } catch (error: any) {
      console.error("Deactivation error:", error);
      throw error; // Re-throw to handle in UI
    }
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      userData,
      claimedCoupons,
      login,
      logout,
      updateUserData,
      addToWallet,
      removeFromWallet,
      deactivateAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
};