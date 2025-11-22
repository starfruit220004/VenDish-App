import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FOOD_REVIEWS_KEY = '@food_reviews';
const SHOP_REVIEWS_KEY = '@shop_reviews';

export interface FoodReview {
  id: string;
  foodId: number;
  username: string;
  rating: number;
  review: string;
  media?: string;
  timestamp: number;
}

export interface ShopReview {
  id: string;
  username: string;
  rating: number;
  review: string;
  media?: string;
  timestamp: number;
}

interface ReviewsContextType {
  foodReviews: FoodReview[];
  shopReviews: ShopReview[];
  addFoodReview: (review: Omit<FoodReview, 'id' | 'timestamp'>) => Promise<void>;
  addShopReview: (review: Omit<ShopReview, 'id' | 'timestamp'>) => Promise<void>;
  getFoodReviews: (foodId: number) => FoodReview[];
  getAverageFoodRating: (foodId: number) => number;
  getAverageShopRating: () => number;
  refreshReviews: () => Promise<void>;
}

const ReviewsContext = createContext<ReviewsContextType>({
  foodReviews: [],
  shopReviews: [],
  addFoodReview: async () => {},
  addShopReview: async () => {},
  getFoodReviews: () => [],
  getAverageFoodRating: () => 0,
  getAverageShopRating: () => 0,
  refreshReviews: async () => {},
});

export const useReviews = () => useContext(ReviewsContext);

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const [foodReviews, setFoodReviews] = useState<FoodReview[]>([]);
  const [shopReviews, setShopReviews] = useState<ShopReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load reviews on mount
  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = useCallback(async () => {
    try {
      console.log('Loading reviews from AsyncStorage...');
      const [foodData, shopData] = await Promise.all([
        AsyncStorage.getItem(FOOD_REVIEWS_KEY),
        AsyncStorage.getItem(SHOP_REVIEWS_KEY),
      ]);

      if (foodData) {
        const parsedFoodReviews = JSON.parse(foodData);
        console.log('Loaded food reviews:', parsedFoodReviews.length);
        setFoodReviews(parsedFoodReviews);
      }
      if (shopData) {
        const parsedShopReviews = JSON.parse(shopData);
        console.log('Loaded shop reviews:', parsedShopReviews.length);
        setShopReviews(parsedShopReviews);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshReviews = useCallback(async () => {
    await loadReviews();
  }, [loadReviews]);

  const addFoodReview = useCallback(async (review: Omit<FoodReview, 'id' | 'timestamp'>) => {
    try {
      const newReview: FoodReview = {
        ...review,
        id: Date.now().toString() + Math.random().toString(36),
        timestamp: Date.now(),
      };

      console.log('Adding new food review:', newReview);

      const updatedReviews = [...foodReviews, newReview];
      
      // Update state first
      setFoodReviews(updatedReviews);
      
      // Then save to AsyncStorage
      await AsyncStorage.setItem(FOOD_REVIEWS_KEY, JSON.stringify(updatedReviews));
      
      console.log('Food review saved successfully. Total reviews:', updatedReviews.length);
    } catch (error) {
      console.error('Error adding food review:', error);
      throw error;
    }
  }, [foodReviews]);

  const addShopReview = useCallback(async (review: Omit<ShopReview, 'id' | 'timestamp'>) => {
    try {
      const newReview: ShopReview = {
        ...review,
        id: Date.now().toString() + Math.random().toString(36),
        timestamp: Date.now(),
      };

      console.log('Adding new shop review:', newReview);

      const updatedReviews = [...shopReviews, newReview];
      
      // Update state first
      setShopReviews(updatedReviews);
      
      // Then save to AsyncStorage
      await AsyncStorage.setItem(SHOP_REVIEWS_KEY, JSON.stringify(updatedReviews));
      
      console.log('Shop review saved successfully. Total reviews:', updatedReviews.length);
    } catch (error) {
      console.error('Error adding shop review:', error);
      throw error;
    }
  }, [shopReviews]);

  const getFoodReviews = useCallback((foodId: number): FoodReview[] => {
    const filtered = foodReviews
      .filter(review => review.foodId === foodId)
      .sort((a, b) => b.timestamp - a.timestamp);
    console.log(`Getting reviews for food ${foodId}:`, filtered.length);
    return filtered;
  }, [foodReviews]);

  const getAverageFoodRating = useCallback((foodId: number): number => {
    const reviews = getFoodReviews(foodId);
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  }, [getFoodReviews]);

  const getAverageShopRating = useCallback((): number => {
    if (shopReviews.length === 0) return 0;
    const sum = shopReviews.reduce((acc, review) => acc + review.rating, 0);
    const average = Number((sum / shopReviews.length).toFixed(1));
    console.log('Shop average rating:', average, 'from', shopReviews.length, 'reviews');
    return average;
  }, [shopReviews]);

  if (isLoading) {
    return null; 
  }

  return (
    <ReviewsContext.Provider
      value={{
        foodReviews,
        shopReviews,
        addFoodReview,
        addShopReview,
        getFoodReviews,
        getAverageFoodRating,
        getAverageShopRating,
        refreshReviews,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
}