import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../api/api';

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
  addFoodReview: (review: { foodId: number; username: string; rating: number; review: string; media?: string }) => Promise<void>;
  addShopReview: (review: { username: string; rating: number; review: string; media?: string }) => Promise<void>;
  getFoodReviews: (foodId: number) => FoodReview[];
  getAverageFoodRating: (foodId: number) => number;
  getAverageShopRating: () => number;
  refreshReviews: () => Promise<void>;
  hasReviewedFood: (foodId: number, username: string) => boolean;
  hasReviewedShopToday: (username: string) => boolean;
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
  hasReviewedFood: () => false,
  hasReviewedShopToday: () => false,
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
      console.log('Fetching reviews from API...');
      const response = await api.get('/firstapp/reviews/');
      const allReviews = response.data;

      // 1. Process Shop Reviews
      const fetchedShopReviews = allReviews
        .filter((r: any) => r.review_type === 'shop')
        .map((r: any) => ({
          id: r.id.toString(),
          username: r.username || 'Anonymous',
          rating: r.rating,
          review: r.comment, // Map 'comment' to 'review'
          media: r.image,    // Map 'image' to 'media'
          timestamp: new Date(r.created_at).getTime(),
        }));

      // 2. Process Food Reviews
      const fetchedFoodReviews = allReviews
        .filter((r: any) => r.review_type === 'food')
        .map((r: any) => ({
          id: r.id.toString(),
          foodId: r.product, // The product ID
          username: r.username || 'Anonymous',
          rating: r.rating,
          review: r.comment,
          media: r.image,
          timestamp: new Date(r.created_at).getTime(),
        }));

      setShopReviews(fetchedShopReviews);
      setFoodReviews(fetchedFoodReviews);
      
    } catch (error) {
      console.error('Error loading reviews from API:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshReviews = useCallback(async () => {
    await loadReviews();
  }, [loadReviews]);

  // ✅ UPDATED: Send Food Review to API
  const addFoodReview = useCallback(async (reviewData: { foodId: number; username: string; rating: number; review: string; media?: string }) => {
    try {
      const formData = new FormData();
      formData.append('review_type', 'food');
      formData.append('product', reviewData.foodId.toString()); // Send product ID
      formData.append('rating', reviewData.rating.toString());
      formData.append('comment', reviewData.review);

      if (reviewData.media) {
        // @ts-ignore
        formData.append('image', {
          uri: reviewData.media,
          name: 'food_review.jpg',
          type: 'image/jpeg',
        });
      }

      await api.post('/firstapp/reviews/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Refresh list after posting
      await loadReviews();

    } catch (error) {
      console.error('Error posting food review:', error);
      throw error;
    }
  }, [loadReviews]);

  // ✅ UPDATED: Send Shop Review to API (If used by other components)
  const addShopReview = useCallback(async (reviewData: { username: string; rating: number; review: string; media?: string }) => {
    try {
      const formData = new FormData();
      formData.append('review_type', 'shop');
      formData.append('rating', reviewData.rating.toString());
      formData.append('comment', reviewData.review);

      if (reviewData.media) {
        // @ts-ignore
        formData.append('image', {
          uri: reviewData.media,
          name: 'shop_review.jpg',
          type: 'image/jpeg',
        });
      }

      await api.post('/firstapp/reviews/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await loadReviews();
    } catch (error) {
      console.error('Error posting shop review:', error);
      throw error;
    }
  }, [loadReviews]);

  const getFoodReviews = useCallback((foodId: number): FoodReview[] => {
    return foodReviews
      .filter(review => review.foodId === foodId)
      .sort((a, b) => b.timestamp - a.timestamp);
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
    return Number((sum / shopReviews.length).toFixed(1));
  }, [shopReviews]);

  const hasReviewedFood = useCallback((foodId: number, username: string): boolean => {
    return foodReviews.some(r => r.foodId === foodId && r.username === username);
  }, [foodReviews]);

  const hasReviewedShopToday = useCallback((username: string): boolean => {
    const today = new Date().setHours(0, 0, 0, 0);
    return shopReviews.some(r => {
      const reviewDate = new Date(r.timestamp).setHours(0, 0, 0, 0);
      return r.username === username && reviewDate === today;
    });
  }, [shopReviews]);

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
        hasReviewedFood,
        hasReviewedShopToday,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
}