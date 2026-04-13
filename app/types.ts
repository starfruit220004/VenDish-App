// Navigation Types
export type TabParamList = {
  Home: undefined;
  Promos: undefined;
  Feed: undefined;
  Favorites: undefined;
  About: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
  Login: { redirect?: keyof TabParamList; promoTitle?: string } | undefined;
  Signup: { redirect?: keyof TabParamList; promoTitle?: string } | undefined;
  ForgotPassword: undefined;
};

export type FeedStackParamList = {
  FeedHome: undefined;
  FoodDetail: { food: Food };
  WriteReview: {
    food: Food;
    editReview?: {
      id: string;
      rating: number;
      review: string;
      media?: string | null;
    };
  };
  WriteShopReview: {
    editReview?: {
      id: string;
      rating: number;
      review: string;
      media?: string | null;
    };
  } | undefined;
};

// Food Types 
export type Food = {
  id: number;
  name: string;
  description: string;
  image: any;
  category: string;
  price: number;
  servings: number;
  isAvailable: boolean;
};

export type FoodItem = Food;