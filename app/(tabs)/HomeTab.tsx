import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../api/api';
import { useAuth } from '../context/AuthContext';
import { getTheme, layout, spacing } from '../../constants/theme';
import HeroSection from './home/HeroSection';
import FeaturedProductsSection from './home/FeaturedProductsSection';
import FeaturedReviewSection from './home/FeaturedReviewSection';
import LatestPromosSection from './home/LatestPromosSection';
import BusinessFooterSection from './home/BusinessFooterSection';
import HomeTabSkeleton from './home/HomeTabSkeleton';
import { BusinessDetails, HomeProduct, HomePromo, HomeReviewSpotlight } from './home/types';

type ApiProduct = {
  id: number;
  product_name?: string;
  description?: string | null;
  category?: string | { name?: string } | null;
  price?: number | string;
  image?: string | null;
  stock_quantity?: number | string;
  is_available?: boolean;
  is_archived?: boolean;
  date_added?: string;
  average_rating?: number | string;
  review_count?: number | string;
  units_sold_weekly?: number | string;
};

type ApiReview = {
  id: number;
  review_type?: string;
  product?: number | null;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  profile_pic?: string | null;
  rating?: number | string;
  comment?: string | null;
  created_at?: string;
};

type ApiCoupon = {
  id: number;
  name?: string;
  product_name?: string;
  description?: string;
  rate?: string;
  status?: string;
  criteria_details?: {
    valid_to?: string | null;
  };
};

type ContactApiRecord = {
  email?: string;
  phone_number?: string;
  address?: string;
};

type AboutApiRecord = {
  open_hours?: string;
};

const DEFAULT_BUSINESS_DETAILS: BusinessDetails = {
  email: 'info@kuyavince.com',
  phone: '+63 123 456 7890',
  location: 'Baliwasan, Zamboanga City, Philippines',
  operatingHours: 'Everyday: 7:00 AM - 10:00 PM',
};

const BEST_SELLERS_DEFAULT_SUBTITLE = 'Top-performing dishes based on completed orders this week';
const BEST_SELLERS_FALLBACK_SUBTITLE = 'Popular dishes based on current customer review activity';

const DEFAULT_REVIEW_SPOTLIGHT: HomeReviewSpotlight = {
  reviewerName: 'No featured reviewer yet',
  rating: 0,
  text: 'No 5-star shop review is available yet. Check back soon for fresh feedback.',
  profilePic: null,
  reviewedAt: null,
  reviewTypeLabel: 'Shop Review',
};

const getLatestRecord = <T extends object>(data: T[] | T | null | undefined): T | null => {
  if (Array.isArray(data)) {
    return data[data.length - 1] || null;
  }

  if (data && typeof data === 'object') {
    return data;
  }

  return null;
};

const toNumber = (value: unknown): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatRateLabel = (rate: unknown): string => {
  if (!rate) return 'Promo';

  const value = String(rate).trim();
  if (value.toUpperCase() === 'FREE') return 'FREE ITEM';

  if (value.includes('₱')) {
    const amount = parseFloat(value.replace(/[^0-9.]/g, ''));
    return Number.isFinite(amount) ? `P${Math.trunc(amount)} OFF` : `${value} OFF`;
  }

  const numeric = parseFloat(value.replace(/[^0-9.]/g, ''));
  if (Number.isFinite(numeric)) {
    return value.includes('%') ? `${Math.trunc(numeric)}% OFF` : `${Math.trunc(numeric)}% OFF`;
  }

  return `${value} OFF`;
};

const formatExpirationLabel = (dateString?: string | null): string => {
  if (!dateString) return 'No expiration date';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'No expiration date';
  return `Expires ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
};

const parseDateMs = (dateString?: string | null): number => {
  if (!dateString) return 0;
  const ms = new Date(dateString).getTime();
  return Number.isFinite(ms) ? ms : 0;
};

const extractArrayPayload = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (value && typeof value === 'object') {
    const results = (value as { results?: unknown }).results;
    if (Array.isArray(results)) {
      return results as T[];
    }
  }

  return [];
};

const isHttpNotFoundError = (reason: unknown): boolean => {
  if (!reason || typeof reason !== 'object') {
    return false;
  }

  const response = (reason as { response?: { status?: number } }).response;
  return response?.status === 404;
};

const getCurrentWeekStartMs = (): number => {
  const reference = new Date();
  const day = reference.getDay();
  const mondayOffset = day === 0 ? 6 : day - 1;
  reference.setHours(0, 0, 0, 0);
  reference.setDate(reference.getDate() - mondayOffset);
  return reference.getTime();
};

const trimText = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const getReviewerDisplayName = (review: ApiReview): string => {
  const firstName = trimText(review.first_name, '');
  const lastName = trimText(review.last_name, '');
  const fullName = `${firstName} ${lastName}`.trim();
  if (fullName) {
    return fullName;
  }

  return trimText(review.username, 'Anonymous Customer');
};

const shorten = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}...`;
};

const getCategoryLabel = (category: ApiProduct['category']): string => {
  if (typeof category === 'string') return trimText(category, 'Chef Special');
  return trimText(category?.name, 'Chef Special');
};

const mapHomeProduct = (item: ApiProduct): HomeProduct => {
  const category = getCategoryLabel(item.category);

  return {
    id: toNumber(item.id),
    name: trimText(item.product_name, 'Featured Dish'),
    description: shorten(
      trimText(item.description, `A flavorful ${category.toLowerCase()} dish made fresh by our kitchen.`),
      110
    ),
    category,
    price: toNumber(item.price),
    imageUri: typeof item.image === 'string' ? item.image : null,
    rating: Number(toNumber(item.average_rating).toFixed(1)),
    reviewCount: Math.max(0, Math.trunc(toNumber(item.review_count))),
    stockQuantity: Math.max(0, Math.trunc(toNumber(item.stock_quantity))),
    isAvailable: Boolean(item.is_available),
    weeklyUnitsSold: Math.max(0, Math.trunc(toNumber(item.units_sold_weekly))),
  };
};

export default function HomeTab() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const navigation = useNavigation<any>();
  const { isLoggedIn, userData } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bestSellers, setBestSellers] = useState<HomeProduct[]>([]);
  const [bestSellersSubtitle, setBestSellersSubtitle] = useState(BEST_SELLERS_DEFAULT_SUBTITLE);
  const [showBestSellerWeeklySalesLabel, setShowBestSellerWeeklySalesLabel] = useState(true);
  const [topRated, setTopRated] = useState<HomeProduct[]>([]);
  const [reviewSpotlight, setReviewSpotlight] = useState<HomeReviewSpotlight>(DEFAULT_REVIEW_SPOTLIGHT);
  const [latestPromos, setLatestPromos] = useState<HomePromo[]>([]);
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails>(DEFAULT_BUSINESS_DETAILS);

  const displayName = useMemo(() => {
    return (
      trimText(userData?.firstname, '') ||
      trimText(userData?.fullname, '') ||
      trimText(userData?.username, 'Customer')
    );
  }, [userData?.firstname, userData?.fullname, userData?.username]);

  const fetchHomeData = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setLoading(true);
    }

    try {
      const [
        bestSellersResult,
        topRatedResult,
        reviewsResult,
        productsResult,
        couponsResult,
        contactResult,
        aboutResult,
      ] =
        await Promise.allSettled([
          api.get('/firstapp/products/best-sellers/?period=weekly&limit=2'),
          api.get('/firstapp/products/top-rated/?limit=2'),
          api.get('/firstapp/reviews/'),
          api.get('/firstapp/products/'),
          api.get('/firstapp/coupons/'),
          api.get('/firstapp/contact-page/'),
          api.get('/firstapp/about/'),
        ]);

      const weeklyBestSellersRawFromEndpoint: ApiProduct[] =
        bestSellersResult.status === 'fulfilled'
          ? extractArrayPayload<ApiProduct>(bestSellersResult.value.data)
          : [];

      const topRatedRawFromEndpoint: ApiProduct[] =
        topRatedResult.status === 'fulfilled'
          ? extractArrayPayload<ApiProduct>(topRatedResult.value.data)
          : [];

      const reviewsRaw: ApiReview[] =
        reviewsResult.status === 'fulfilled'
          ? extractArrayPayload<ApiReview>(reviewsResult.value.data)
          : [];

      const productsRaw: ApiProduct[] =
        productsResult.status === 'fulfilled'
          ? extractArrayPayload<ApiProduct>(productsResult.value.data)
          : [];

      const couponsRaw: ApiCoupon[] =
        couponsResult.status === 'fulfilled'
          ? extractArrayPayload<ApiCoupon>(couponsResult.value.data)
          : [];

      const bestSellersEndpointFailed = bestSellersResult.status === 'rejected';
      const topRatedEndpointFailed = topRatedResult.status === 'rejected';

      if (bestSellersEndpointFailed && isHttpNotFoundError(bestSellersResult.reason)) {
        console.warn('Best-sellers endpoint is unavailable on this backend. Falling back to review-based ranking.');
      }

      if (topRatedEndpointFailed && isHttpNotFoundError(topRatedResult.reason)) {
        console.warn('Top-rated endpoint is unavailable on this backend. Falling back to review-based ranking.');
      }

      const productById = new Map<number, ApiProduct>();
      productsRaw.forEach((product) => {
        const normalizedId = Math.trunc(toNumber(product.id));
        if (normalizedId > 0 && product.is_archived !== true && !productById.has(normalizedId)) {
          productById.set(normalizedId, product);
        }
      });

      const topRatedFallback = (): ApiProduct[] => {
        const aggregates = new Map<number, { sum: number; count: number }>();

        reviewsRaw.forEach((review) => {
          if (review.review_type !== 'food') return;
          const productId = Math.trunc(toNumber(review.product));
          if (productId <= 0 || !productById.has(productId)) return;

          const current = aggregates.get(productId) || { sum: 0, count: 0 };
          current.sum += toNumber(review.rating);
          current.count += 1;
          aggregates.set(productId, current);
        });

        const fallbackProducts: ApiProduct[] = [];
        aggregates.forEach((stats, productId) => {
          const product = productById.get(productId);
          if (!product) return;

          fallbackProducts.push({
            ...product,
            id: productId,
            average_rating: stats.count > 0 ? Number((stats.sum / stats.count).toFixed(2)) : 0,
            review_count: stats.count,
          });
        });

        return fallbackProducts
          .sort((a, b) => {
            const ratingDiff = toNumber(b.average_rating) - toNumber(a.average_rating);
            if (ratingDiff !== 0) return ratingDiff;

            const reviewCountDiff = toNumber(b.review_count) - toNumber(a.review_count);
            if (reviewCountDiff !== 0) return reviewCountDiff;

            return toNumber(a.id) - toNumber(b.id);
          })
          .slice(0, 2);
      };

      const weeklyBestSellerFallback = (): ApiProduct[] => {
        const weekStartMs = getCurrentWeekStartMs();
        const weeklyReviewSignal = new Map<number, number>();

        reviewsRaw.forEach((review) => {
          if (review.review_type !== 'food') return;
          const productId = Math.trunc(toNumber(review.product));
          if (productId <= 0 || !productById.has(productId)) return;
          if (parseDateMs(review.created_at) < weekStartMs) return;

          weeklyReviewSignal.set(productId, (weeklyReviewSignal.get(productId) || 0) + 1);
        });

        const fallbackProducts: ApiProduct[] = [];
        weeklyReviewSignal.forEach((signalCount, productId) => {
          const product = productById.get(productId);
          if (!product) return;

          fallbackProducts.push({
            ...product,
            id: productId,
            review_count: signalCount,
          });
        });

        return fallbackProducts
          .sort((a, b) => {
            const signalDiff = toNumber(b.review_count) - toNumber(a.review_count);
            if (signalDiff !== 0) return signalDiff;

            return toNumber(a.id) - toNumber(b.id);
          })
          .slice(0, 2);
      };

      let resolvedTopRatedRaw = topRatedRawFromEndpoint;
      if (topRatedEndpointFailed) {
        resolvedTopRatedRaw = topRatedFallback();
      }

      let resolvedBestSellersRaw = weeklyBestSellersRawFromEndpoint;
      let usedBestSellerFallback = false;
      if (bestSellersEndpointFailed) {
        const weeklyFallback = weeklyBestSellerFallback();
        if (weeklyFallback.length > 0) {
          resolvedBestSellersRaw = weeklyFallback;
          usedBestSellerFallback = true;
        } else if (resolvedTopRatedRaw.length > 0) {
          resolvedBestSellersRaw = resolvedTopRatedRaw;
          usedBestSellerFallback = true;
        }
      }

      setBestSellersSubtitle(
        usedBestSellerFallback ? BEST_SELLERS_FALLBACK_SUBTITLE : BEST_SELLERS_DEFAULT_SUBTITLE
      );
      setShowBestSellerWeeklySalesLabel(!usedBestSellerFallback);

      setBestSellers(
        resolvedBestSellersRaw
          .map(mapHomeProduct)
          .filter((product) => product.id > 0)
          .slice(0, 2)
      );

      setTopRated(
        resolvedTopRatedRaw
          .map(mapHomeProduct)
          .filter((product) => product.id > 0)
          .slice(0, 2)
      );

      const fiveStarShopReview = [...reviewsRaw]
        .filter((review) => review.review_type === 'shop' && Math.round(toNumber(review.rating)) >= 5)
        .sort((a, b) => parseDateMs(b.created_at) - parseDateMs(a.created_at))[0];

      if (fiveStarShopReview) {
        const spotlightRating = Math.max(0, Math.min(5, Math.round(toNumber(fiveStarShopReview.rating))));
        setReviewSpotlight({
          reviewerName: getReviewerDisplayName(fiveStarShopReview),
          rating: spotlightRating,
          text: shorten(
            trimText(
              fiveStarShopReview.comment,
              'Great food and warm service. Highly recommended for families and friends.'
            ),
            180
          ),
          profilePic:
            typeof fiveStarShopReview.profile_pic === 'string' && fiveStarShopReview.profile_pic.trim().length > 0
              ? fiveStarShopReview.profile_pic
              : null,
          reviewedAt: parseDateMs(fiveStarShopReview.created_at) || null,
          reviewTypeLabel: 'Shop Review',
        });
      } else {
        setReviewSpotlight(DEFAULT_REVIEW_SPOTLIGHT);
      }

      const mappedPromos: HomePromo[] = [...couponsRaw]
        .sort((a, b) => toNumber(b.id) - toNumber(a.id))
        .map((coupon) => ({
          id: toNumber(coupon.id),
          title: trimText(coupon.name, 'Exclusive Promo'),
          productName: trimText(coupon.product_name, 'Selected Dishes'),
          description: shorten(
            trimText(coupon.description, 'Claim this limited offer in the Promos tab while supplies last.'),
            120
          ),
          rateLabel: formatRateLabel(coupon.rate),
          expirationLabel: formatExpirationLabel(coupon.criteria_details?.valid_to),
          status: trimText(coupon.status, 'Active'),
        }));

      const promoCandidates = mappedPromos.filter((promo) => {
        const status = promo.status.toLowerCase();
        return status === 'active' || status === 'claimed';
      });

      setLatestPromos(promoCandidates.slice(0, 2));

      const contactData =
        contactResult.status === 'fulfilled'
          ? getLatestRecord<ContactApiRecord>(contactResult.value.data)
          : null;

      const aboutData =
        aboutResult.status === 'fulfilled'
          ? getLatestRecord<AboutApiRecord>(aboutResult.value.data)
          : null;

      setBusinessDetails({
        email: trimText(contactData?.email, DEFAULT_BUSINESS_DETAILS.email),
        phone: trimText(contactData?.phone_number, DEFAULT_BUSINESS_DETAILS.phone),
        location: trimText(contactData?.address, DEFAULT_BUSINESS_DETAILS.location),
        operatingHours: trimText(aboutData?.open_hours, DEFAULT_BUSINESS_DETAILS.operatingHours),
      });
    } catch (error) {
      console.error('Failed to load home tab data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeData(true);
  }, [fetchHomeData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHomeData(false);
  }, [fetchHomeData]);

  const handleLoginPress = useCallback(() => {
    const parentNavigation = navigation.getParent?.();
    if (parentNavigation?.navigate) {
      parentNavigation.navigate('Login');
      return;
    }
    navigation.navigate('Login');
  }, [navigation]);

  const handleSignupPress = useCallback(() => {
    const parentNavigation = navigation.getParent?.();
    if (parentNavigation?.navigate) {
      parentNavigation.navigate('Signup');
      return;
    }
    navigation.navigate('Signup');
  }, [navigation]);

  const handleBrowseMenuPress = useCallback(() => {
    navigation.navigate('Feed');
  }, [navigation]);

  const handleOpenFoodDetail = useCallback(
    (product: HomeProduct) => {
      navigation.navigate('Feed', {
        screen: 'FoodDetail',
        params: {
          food: {
            id: product.id,
            name: product.name,
            description: product.description,
            image: product.imageUri ? { uri: product.imageUri } : require('../../assets/images/Logo2.jpg'),
            category: product.category,
            price: product.price,
            servings: product.stockQuantity,
            isAvailable: product.isAvailable,
          },
        },
      });
    },
    [navigation]
  );

  const handleOpenPromosPress = useCallback(() => {
    navigation.navigate('Promos');
  }, [navigation]);

  if (loading) {
    return <HomeTabSkeleton />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? theme.background : 'transparent' }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.accent]}
          tintColor={theme.accent}
        />
      }
    >
      <HeroSection
        isLoggedIn={isLoggedIn}
        displayName={displayName}
        onLoginPress={handleLoginPress}
        onSignupPress={handleSignupPress}
        onBrowseMenuPress={handleBrowseMenuPress}
      />

      <FeaturedProductsSection
        title="Best Sellers"
        subtitle={bestSellersSubtitle}
        products={bestSellers}
        onProductPress={handleOpenFoodDetail}
        showWeeklySalesLabel={showBestSellerWeeklySalesLabel}
        emptyMessage="No completed weekly sales available yet."
      />

      <FeaturedProductsSection
        title="Top Rated"
        subtitle="Highest-rated dishes based on customer reviews"
        products={topRated}
        onProductPress={handleOpenFoodDetail}
        onBrowseMenuPress={handleBrowseMenuPress}
        showViewMenuButton
        emptyMessage="No top-rated dishes available yet."
      />

      <FeaturedReviewSection review={reviewSpotlight} />

      <LatestPromosSection promos={latestPromos} onOpenPromosPress={handleOpenPromosPress} />

      <BusinessFooterSection details={businessDetails} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
});