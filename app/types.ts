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
  FoodDetail: { food: FoodItem };
  WriteReview: { food: FoodItem };
};

export interface FoodItem {
  id: number;
  name: string;
  description: string;
  image: any;
  rating: number;
  category: string;
}
