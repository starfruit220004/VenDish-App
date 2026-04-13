export type HomeProduct = {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUri: string | null;
  category: string;
  rating: number;
  reviewCount: number;
  stockQuantity: number;
  isAvailable: boolean;
  weeklyUnitsSold?: number;
};

export type HomePromo = {
  id: number;
  title: string;
  productName: string;
  description: string;
  rateLabel: string;
  expirationLabel: string;
  status: string;
};

export type HomeReviewSpotlight = {
  reviewerName: string;
  rating: number;
  text: string;
  profilePic?: string | null;
  reviewedAt?: number | null;
  reviewTypeLabel?: string;
};

export type BusinessDetails = {
  email: string;
  phone: string;
  location: string;
  operatingHours: string;
};