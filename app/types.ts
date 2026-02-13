// Navigation Types
export type TabParamList = {
  Promos: undefined;
  Feed: undefined;
  Favorites: undefined;
  About: undefined;
  Location: undefined;  
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
  WriteReview: { food: Food };
  WriteShopReview: undefined;
};

// Food Types 
export type Food = {
  id: number;
  name: string;
  description: string;
  image: any;
  category: string;
  price: number;
  isAvailable: boolean;
};

export type FoodItem = Food;