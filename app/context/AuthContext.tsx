import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/api';
import { setLogoutHandler } from '../../api/api';

// ─── Storage Keys (single source of truth) ───────────────────────────────────
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  COUPON_WALLET: 'claimed_coupons',
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────
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
  criteria_details?: any;
  is_used?: boolean;
  valid_to?: string;
}

export interface UserData {
  username: string;
  email: string;
  fullname?: string;
  firstname?: string;
  lastname?: string;
  middlename?: string;
  profilePic?: string;
  phone?: string;
  address?: string;
}

export interface AuthContextType {
  // State
  isLoggedIn: boolean;
  userData: UserData | null;
  userToken: string | null;
  claimedCoupons: Coupon[];
  isAuthLoading: boolean;

  // Auth actions
  login: (user: UserData, access: string, refresh: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserData: (user: UserData) => Promise<void>;

  // Wallet actions
  addToWallet: (coupon: Coupon) => Promise<boolean>;
  removeFromWallet: (id: number) => Promise<void>;
  markAsRedeemed: (id: number) => Promise<void>;
  fetchMyCoupons: (showSpinner?: boolean) => Promise<void>;
  isCouponRefreshing: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────
export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  userData: null,
  userToken: null,
  claimedCoupons: [],
  isAuthLoading: true,
  login: async () => {},
  logout: async () => {},
  updateUserData: async () => {},
  addToWallet: async () => false,
  removeFromWallet: async () => {},
  markAsRedeemed: async () => {},
  fetchMyCoupons: async () => {},
  isCouponRefreshing: false,
});

// ─── Custom Hook ─────────────────────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ─── Provider ────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [claimedCoupons, setClaimedCoupons] = useState<Coupon[]>([]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isCouponRefreshing, setIsCouponRefreshing] = useState(false);

  // ── Fetch user's coupons from the API ──────────────────────────────────────
  const fetchMyCoupons = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsCouponRefreshing(true);
    try {
      const response = await api.get('/firstapp/coupons/mine/');
      const now = new Date();
      const coupons: Coupon[] = response.data.map((item: any) => {
        const expiration = item.criteria_details?.valid_to || item.valid_to;
        const isExpired = expiration ? new Date(expiration) < now : false;
        let status: Coupon['status'] = item.status || 'Active';
        if (item.is_used) status = 'Redeemed';
        else if (isExpired || status.toLowerCase() === 'expired') status = 'Expired';
        return { ...item, status, expiration };
      });
      setClaimedCoupons(coupons);
      await AsyncStorage.setItem(STORAGE_KEYS.COUPON_WALLET, JSON.stringify(coupons));
    } catch (error: any) {
      console.error('Failed to fetch coupons:', error);
      // 401s are handled by the API interceptor (auto-refresh or logout).
    } finally {
      if (showSpinner) setIsCouponRefreshing(false);
    }
  }, []);

  // ── Load persisted auth data on mount ──────────────────────────────────────
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const [token, user, coupons] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
          AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
          AsyncStorage.getItem(STORAGE_KEYS.COUPON_WALLET),
        ]);

        if (token && user) {
          const parsedUser: UserData = JSON.parse(user);
          setUserToken(token);
          setUserData(parsedUser);
          setIsLoggedIn(true);
        }

        if (coupons) {
          setClaimedCoupons(JSON.parse(coupons));
        }
      } catch (error) {
        console.error('Failed to load auth data:', error);
      } finally {
        setIsAuthLoading(false);
      }
    };
    loadAuthData();
  }, []);

  // ── Fetch fresh coupons once authenticated ────────────────────────────────
  useEffect(() => {
    if (isLoggedIn && !isAuthLoading) {
      fetchMyCoupons();
    }
  }, [isLoggedIn, isAuthLoading, fetchMyCoupons]);

  // ── Register API interceptor logout handler ────────────────────────────────
  useEffect(() => {
    setLogoutHandler(() => {
      setIsLoggedIn(false);
      setUserData(null);
      setUserToken(null);
      setClaimedCoupons([]);
    });
    return () => setLogoutHandler(null);
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (user: UserData, access: string, refresh: string) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh),
        AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user)),
      ]);
      setUserData(user);
      setUserToken(access);
      setIsLoggedIn(true);
      // Coupons fetched automatically by the useEffect that watches isLoggedIn
    } catch (error) {
      console.error('Login storage error:', error);
    }
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.COUPON_WALLET,
      ]);
      setIsLoggedIn(false);
      setUserData(null);
      setUserToken(null);
      setClaimedCoupons([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  // ── Update user data ──────────────────────────────────────────────────────
  const updateUserData = useCallback(async (user: UserData) => {
    setUserData(user);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  }, []);

  // ── Wallet: add coupon ────────────────────────────────────────────────────
  const addToWallet = useCallback(async (coupon: Coupon): Promise<boolean> => {
    const exists = claimedCoupons.some(c => c.id === coupon.id);
    if (exists) return false;
    const updated = [coupon, ...claimedCoupons];
    setClaimedCoupons(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.COUPON_WALLET, JSON.stringify(updated));
    return true;
  }, [claimedCoupons]);

  // ── Wallet: remove coupon ─────────────────────────────────────────────────
  const removeFromWallet = useCallback(async (id: number) => {
    const updated = claimedCoupons.filter(c => c.id !== id);
    setClaimedCoupons(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.COUPON_WALLET, JSON.stringify(updated));
  }, [claimedCoupons]);

  // ── Wallet: mark coupon as redeemed ───────────────────────────────────────
  const markAsRedeemed = useCallback(async (id: number) => {
    const updated = claimedCoupons.map(c =>
      c.id === id ? { ...c, status: 'Redeemed' as const } : c
    );
    setClaimedCoupons(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.COUPON_WALLET, JSON.stringify(updated));
  }, [claimedCoupons]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userData,
        userToken,
        claimedCoupons,
        isAuthLoading,
        login,
        logout,
        updateUserData,
        addToWallet,
        removeFromWallet,
        markAsRedeemed,
        fetchMyCoupons,
        isCouponRefreshing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
