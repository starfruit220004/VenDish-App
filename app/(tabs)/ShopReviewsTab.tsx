import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useReviews } from './ReviewsContext';
import { useAuth } from '../context/AuthContext';
import WriteShopReview from './WriteShopReview';
import { getTheme, spacing, typography, radii, layout, palette } from '../../constants/theme';

const Stack = createNativeStackNavigator();

function ShopReviewsHome({ navigation }: any) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = getTheme(isDark);
  const { shopReviews, getAverageShopRating, refreshReviews } = useReviews();
  const { isLoggedIn, userData, refreshUserData } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshReviews();
    }, [refreshReviews])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshReviews();
    if (isLoggedIn && refreshUserData) {
      await refreshUserData();
    }
    setRefreshing(false);
  }, [refreshReviews, isLoggedIn, refreshUserData]);

  const [showAllReviews, setShowAllReviews] = useState(false);
  const averageRating = getAverageShopRating();
  const displayedReviews = showAllReviews ? shopReviews : shopReviews.slice(0, 5);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderStars = (rating: number, size = 20) => {
    const roundedRating = Math.round(rating);
    return (
      <View style={styles.starsContainer}>
        {[...Array(5)].map((_, i) => (
          <Ionicons key={i} name={i < roundedRating ? 'star' : 'star-outline'} size={size} color={palette.warning} />
        ))}
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
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
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.headerIconWrap, { backgroundColor: theme.accentSoft }]}>
          <Ionicons name="restaurant" size={36} color={theme.accent} />
        </View>
        <Text style={[styles.title, { color: theme.accentText }]}>
          Kuya Vince Carenderia
        </Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          Shop Reviews
        </Text>
      </View>

      {/* Overall Rating Card */}
      <View style={[styles.ratingCard, { backgroundColor: theme.surface }, theme.cardShadow]}>
        <View style={styles.ratingContent}>
          <Text style={[styles.ratingNumber, { color: theme.accent }]}>
            {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
          </Text>
          {renderStars(averageRating)}
          <Text numberOfLines={1} style={[styles.ratingCount, { color: theme.textMuted }]}>
            {shopReviews.length} {shopReviews.length === 1 ? 'review' : 'reviews'}
          </Text>
        </View>

        {!isLoggedIn || userData?.has_completed_transaction ? (
          <TouchableOpacity
            style={[styles.writeReviewButton, { backgroundColor: theme.accent }]}
            onPress={() => {
              if (!isLoggedIn) {
                setModalMessage('Please login first to write a review');
                setShowModal(true);
                return;
              }
              navigation.navigate('WriteShopReview');
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="create-outline" size={20} color="#FFF" />
            <Text style={styles.writeReviewText}>Write a Review</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ padding: 12, backgroundColor: theme.surfaceElevated, borderRadius: radii.lg, alignItems: 'center', width: '100%' }}>
            <Ionicons name="lock-closed-outline" size={28} color={theme.textMuted} style={{ marginBottom: 6 }} />
            <Text style={{ textAlign: 'center', color: theme.textSecondary, ...typography.bodySm }}>
              You need at least one completed transaction at our physical POS before you can write a review. Please provide your registered account details to the cashier on your next visit!
            </Text>
          </View>
        )}
      </View>

      {/* Reviews Section */}
      <View style={styles.reviewsSection}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Customer Reviews
        </Text>

        {shopReviews.length === 0 ? (
          <View style={[styles.noReviewsContainer, { backgroundColor: theme.surface }, theme.cardShadow]}>
            <Ionicons name="chatbox-outline" size={48} color={theme.textDisabled} />
            <Text style={[styles.noReviewsTitle, { color: theme.textPrimary }]}>
              No reviews yet
            </Text>
            <Text style={[styles.noReviewsText, { color: theme.textMuted }]}>
              Be the first to review our shop!
            </Text>
            {!isLoggedIn || userData?.has_completed_transaction ? (
              <TouchableOpacity
                style={[styles.firstReviewButton, { backgroundColor: theme.accent }]}
                onPress={() => {
                  if (!isLoggedIn) {
                    setModalMessage('Please login first to write a review');
                    setShowModal(true);
                    return;
                  }
                  navigation.navigate('WriteShopReview');
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.firstReviewButtonText}>Write First Review</Text>
              </TouchableOpacity>
            ) : (
               <View style={{ marginTop: 12, padding: 12, backgroundColor: theme.surfaceElevated, borderRadius: radii.lg, alignItems: 'center' }}>
                 <Ionicons name="lock-closed-outline" size={24} color={theme.textMuted} style={{ marginBottom: 4 }} />
                 <Text style={{ textAlign: 'center', color: theme.textSecondary, ...typography.bodySm }}>
                    You need a completed POS transaction to review.
                 </Text>
               </View>
            )}
          </View>
        ) : (
          <>
            {displayedReviews.map(review => (
              <View
                key={review.id}
                style={[styles.reviewCard, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }, theme.cardShadow]}
              >
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAuthor}>
                    {review.profilePic ? (
                      <Image source={{ uri: review.profilePic }} style={styles.reviewAvatar} />
                    ) : (
                      <View style={[styles.reviewAvatarFallback, { backgroundColor: theme.accentSoft }]}>
                        <Text style={[styles.reviewAvatarText, { color: theme.accent }]}>
                          {review.username.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View>
                      <Text style={[styles.reviewUsername, { color: theme.textPrimary }]}>
                        {review.username}
                      </Text>
                      <Text style={[styles.reviewDate, { color: theme.textDisabled }]}>
                        {formatDate(review.timestamp)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.reviewRating}>
                    {[...Array(5)].map((_, i) => (
                      <Ionicons
                        key={i}
                        name={i < review.rating ? 'star' : 'star-outline'}
                        size={15}
                        color={palette.warning}
                      />
                    ))}
                  </View>
                </View>

                <Text style={[styles.reviewText, { color: theme.textSecondary }]}>
                  {review.review}
                </Text>

                {review.media && (
                  <Image source={{ uri: review.media }} style={styles.reviewImage} />
                )}
              </View>
            ))}

            {shopReviews.length > 5 && !showAllReviews && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => setShowAllReviews(true)}
                activeOpacity={0.8}
              >
                <Text style={[styles.showMoreText, { color: theme.accent }]}>
                  Show all {shopReviews.length} reviews
                </Text>
                <Ionicons name="chevron-down" size={20} color={theme.accent} />
              </TouchableOpacity>
            )}

            {showAllReviews && shopReviews.length > 5 && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => setShowAllReviews(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.showMoreText, { color: theme.accent }]}>
                  Show less
                </Text>
                <Ionicons name="chevron-up" size={20} color={theme.accent} />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* ── Favorite Toggle Modal ────────────────────────────── */}
      {showModal && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: theme.surface, padding: 20, borderRadius: radii.lg, width: '80%', alignItems: 'center' }}>
            <Ionicons name="alert-circle-outline" size={32} color={theme.accent} style={{ marginBottom: 10 }} />
            <Text style={{ ...typography.labelLg, color: theme.textPrimary, marginBottom: 20, textAlign: 'center' }}>
              {modalMessage}
            </Text>
            <TouchableOpacity
              style={{ paddingVertical: 10, paddingHorizontal: 20, backgroundColor: theme.accent, borderRadius: radii.md }}
              onPress={() => setShowModal(false)}
            >
              <Text style={{ ...typography.labelMd, color: '#FFF' }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

export default function ShopReviewsTab() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ShopReviewsHome" component={ShopReviewsHome} options={{ headerShown: false }} />
      <Stack.Screen name="WriteShopReview" component={WriteShopReview} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing['4xl'],
  },

  // ── Header ──────────────────────────────────────
  header: { alignItems: 'center' as const, marginBottom: spacing.xl },
  headerIconWrap: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: spacing.md,
  },
  title: { ...typography.displayMd, marginBottom: spacing.xxs },
  subtitle: { ...typography.bodyMd },

  // ── Rating Card ─────────────────────────────────
  ratingCard: {
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing['2xl'],
    alignItems: 'center' as const,
  },
  ratingContent: { alignItems: 'center' as const, marginBottom: spacing.xl },
  ratingNumber: { fontSize: 52, fontWeight: '800' as const, marginBottom: spacing.sm },
  starsContainer: { flexDirection: 'row' as const, gap: spacing.xxs, marginBottom: spacing.sm },
  ratingCount: { ...typography.bodySm },
  writeReviewButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    borderRadius: radii.lg,
    gap: spacing.sm,
    width: '100%',
  },
  writeReviewText: { color: '#FFF' },

  // ── Reviews Section ─────────────────────────────
  reviewsSection: { marginBottom: spacing.xl },
  sectionTitle: { ...typography.headingLg, marginBottom: spacing.lg },

  // ── Empty State ─────────────────────────────────
  noReviewsContainer: {
    borderRadius: radii.xl,
    padding: spacing['3xl'],
    alignItems: 'center' as const,
  },
  noReviewsTitle: { ...typography.headingMd, marginTop: spacing.lg, marginBottom: spacing.sm },
  noReviewsText: { ...typography.bodyMd, marginBottom: spacing.xl, textAlign: 'center' as const },
  firstReviewButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    borderRadius: radii.md,
  },
  firstReviewButtonText: { color: '#FFF', ...typography.labelMd },

  // ── Review Card ─────────────────────────────────
  reviewCard: {
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  reviewHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: spacing.md,
  },
  reviewAuthor: { flexDirection: 'row' as const, alignItems: 'center' as const, flex: 1 },
  reviewAvatar: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    marginRight: spacing.md,
  },
  reviewAvatarFallback: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: spacing.md,
  },
  reviewAvatarText: { ...typography.headingSm },
  reviewUsername: { ...typography.labelMd, marginBottom: 2 },
  reviewDate: { ...typography.caption },
  reviewRating: { flexDirection: 'row' as const, gap: 2 },
  reviewText: { ...typography.bodyMd, lineHeight: 22, marginBottom: spacing.md },
  reviewImage: { width: '100%', height: 220, borderRadius: radii.lg, marginTop: spacing.sm },

  // ── Show More ───────────────────────────────────
  showMoreButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  showMoreText: { ...typography.labelMd },
});