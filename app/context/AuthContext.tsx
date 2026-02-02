import { createContext } from 'react';

// Define the shape of a Coupon
export interface Coupon {
  id: number;
  name: string;
  product_name: string;
  description: string;
  terms: string;
  expiration: string;
  code: string;
  rate: string; // or number, depending on your API
  status: 'Active' | 'Claimed' | 'Redeemed';
  image?: any;
}

// Define the shape of UserData
export interface UserData {
  username: string;
  email: string;
  fullname?: string;
  firstname?: string;
  lastname?: string;
  profilePic?: string;
  // ✅ ADD THESE TWO FIELDS
  phone?: string;
  address?: string;
}

// Define the shape of the Context
export interface AuthContextType {
  isLoggedIn: boolean;
  userData: UserData | null;
  claimedCoupons: Coupon[];
  login: (user: UserData, access: string, refresh: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserData: (user: UserData) => Promise<void>;
  addToWallet: (coupon: Coupon) => Promise<boolean>;
  removeFromWallet: (id: number) => Promise<void>;
}

// Create the context with default dummy values
export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  userData: null,
  claimedCoupons: [],
  login: async () => {},
  logout: async () => {},
  updateUserData: async () => {},
  addToWallet: async () => false,
  removeFromWallet: async () => {},
});