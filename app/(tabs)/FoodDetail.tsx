import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Modal, useColorScheme } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from './FavoritesContext';
import { useReviews } from './ReviewsContext';
import { useAuth } from '../context/AuthContext';
import { getTheme, spacing, typography, radii, palette } from '../../constants/theme';

export default function FoodDetail({ route, navigation }: any) {
  const { food } = route.params;
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { getFoodReviews, getAverageFoodRating, refreshReviews } = useReviews();
  const { isLoggedIn, userData } = useAuth();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = getTheme(isDark);
  const isFav = isFavorite(food.id);

  const [showModal, setShowModal] = React.useState(false);
  const [modalMessage, setModalMessage] = React.useState('');
  const [showAllReviews, setShowAllReviews] = React.useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshReviews();
    }, [refreshReviews])
  );

  const foodReviews = getFoodReviews(food.id);
  const averageRating = getAverageFoodRating(food.id);
  const hasReviews = averageRating > 0;
  const displayedReviews = showAllReviews ? foodReviews : foodReviews.slice(0, 3);
  const canWriteReview = !isLoggedIn || Boolean(userData?.has_completed_transaction);

  const isOwnReview = (reviewUsername: string) => {
    if (!isLoggedIn || !userData?.username) return false;
    return reviewUsername.toLowerCase() === userData.username.toLowerCase();
  };

  const handleFavoriteToggle = () => {
    if (isFav) {
      removeFavorite(food.id);
      setModalMessage(`${food.name} removed from favorites!`);
    } else {
      addFavorite(food);
      setModalMessage(`${food.name} added to favorites!`);
    }
    setShowModal(true);
  };

  const getStockStatus = (isAvailable: boolean, stock: number) => {
    // 1. Ultimate source of truth: If explicitly set to unavailable, it's unavailable.
    // Also, if stock is mathematically 0, force it to be unavailable.
    if (!isAvailable || stock === 0) {
      return { text: 'Unavailable', color: palette.error };
    }
    
    // 2. Optional: Keep the low stock warning ONLY if it's currently available
    if (stock > 0 && stock < 10) {
      return { text: 'Limited Availability', color: palette.warning };
    }
    
    // 3. Otherwise, it is good to go
    return { text: 'Available', color: palette.success };
  };

  // Update the call to pass both properties
  const stockStatus = getStockStatus(food.isAvailable, food.stock);

  const renderStars = (rating: number) => {
    const roundedRating = Math.round(rating);
    return (
      <View style={styles.detailStarsContainer}>
        {[...Array(5)].map((_, i) => (
          <Ionicons key={i} name={i < roundedRating ? 'star' : 'star-outline'} size={20} color={palette.gold} />
        ))}
        <Text style={[styles.ratingText, { color: theme.textMuted }]}>
          {rating.toFixed(1)} / 5.0 {foodReviews.length > 0 && `(${foodReviews.length} ${foodReviews.length === 1 ? 'review' : 'reviews'})`}
        </Text>
      </View>
    );
  };

  const renderNoRating = () => (
    <View style={styles.detailStarsContainer}>
      {[...Array(5)].map((_, i) => (
        <Ionicons key={i} name="star-outline" size={20} color={theme.textDisabled} />
      ))}
      <Text style={[styles.ratingText, { color: theme.textDisabled }]}>No ratings yet</Text>
    </View>
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <ScrollView
        style={[styles.detailScroll, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.detailContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Image ─────────────────────────────────────── */}
        <View style={styles.detailImageContainer}>
          <Image source={food.image} style={styles.detailImage} />

          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: 'rgba(0,0,0,0.35)' }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={[styles.detailCategoryBadge, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.92)' }]}>
            <Text style={[styles.detailCategoryText, { color: theme.accent }]}>{food.category}</Text>
          </View>

          <View style={[styles.detailStockBadge, { backgroundColor: stockStatus.color }]}>
            <Text style={styles.detailStockText}>{stockStatus.text}</Text>
          </View>
        </View>

        {/* ── Content ─────────────────────────────────────────── */}
        <View style={styles.detailInfo}>
          {/* Title + Price Row */}
          <View style={styles.titlePriceRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.detailTitle, { color: theme.textPrimary }]}>
                {food.name}
              </Text>
              {hasReviews ? renderStars(averageRating) : renderNoRating()}
            </View>
            <View style={[styles.pricePill, { backgroundColor: theme.accentSoft }]}>
              <Text style={[styles.pricePillText, { color: theme.accent }]}>₱{food.price}</Text>
            </View>
          </View>

          <Text style={[styles.detailDesc, { color: theme.textSecondary }]}>
            {food.description}
          </Text>

          {/* ── Info Bento Grid ──────────────────────────────── */}
          <View style={[styles.priceStockSection, { backgroundColor: theme.surface }, theme.cardShadow]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Food Information
            </Text>
            <View style={styles.priceStockGrid}>
              {[
                { icon: 'pricetag-outline' as const, label: 'Price', value: `₱${food.price}`, valueColor: theme.textPrimary },
                { icon: 'cube-outline' as const, label: 'Stock', value: `${food.stock ?? '—'} servings`, valueColor: theme.textPrimary },
                { icon: 'pulse-outline' as const, label: 'Status', value: stockStatus.text, valueColor: stockStatus.color },
                { icon: 'fast-food-outline' as const, label: 'Category', value: food.category, valueColor: theme.textPrimary },
              ].map((item, idx) => (
                <View key={idx} style={styles.infoItem}>
                  <View style={[styles.infoIconContainer, { backgroundColor: theme.accentSoft }]}>
                    <Ionicons name={item.icon} size={18} color={theme.accent} />
                  </View>
                  <View style={styles.infoTextContainer}>
                    <Text style={[styles.infoLabel, { color: theme.textMuted }]}>{item.label}</Text>
                    <Text style={[styles.infoValue, { color: item.valueColor }]}>{item.value}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* ── Favorite Button ──────────────────────────────── */}
          <TouchableOpacity
            style={[
              styles.favoriteButton,
              { backgroundColor: isFav ? theme.textMuted : theme.accent },
            ]}
            onPress={handleFavoriteToggle}
            activeOpacity={0.85}
          >
            <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={22} color="#FFFFFF" />
            <Text style={styles.favoriteButtonText}>
              {isFav ? 'Remove from Favorites' : 'Add to Favorites'}
            </Text>
          </TouchableOpacity>

          {/* ── Reviews Section ──────────────────────────────── */}
          <View style={[styles.reviewsSection, { backgroundColor: theme.surface }, theme.cardShadow]}>
            <View style={styles.reviewsHeader}>
              <Text style={[styles.reviewsSectionTitle, { color: theme.textPrimary }]}>
                Customer Reviews
              </Text>
              {foodReviews.length > 0 && (
                <Text style={[styles.reviewsCount, { color: theme.textMuted }]}>
                  {foodReviews.length} {foodReviews.length === 1 ? 'review' : 'reviews'}
                </Text>
              )}
            </View>

            {foodReviews.length === 0 ? (
              <View style={styles.noReviewsContainer}>
                <Ionicons name="chatbox-outline" size={40} color={theme.textDisabled} />
                <Text style={[styles.noReviewsText, { color: theme.textMuted }]}>
                  No reviews yet. Be the first to review!
                </Text>
              </View>
            ) : (
              <>
                {displayedReviews.map(review => (
                  <View key={review.id} style={[styles.reviewCard, { borderColor: theme.border }]}>
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
                          <Text style={[styles.reviewDate, { color: theme.textMuted }]}>
                            {formatDate(review.timestamp)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.reviewHeaderActions}>
                        <View style={styles.reviewRating}>
                          {[...Array(5)].map((_, i) => (
                            <Ionicons key={i} name={i < review.rating ? 'star' : 'star-outline'} size={13} color={palette.gold} />
                          ))}
                        </View>
                        {isOwnReview(review.username) && (
                          <TouchableOpacity
                            style={[styles.editReviewButton, { backgroundColor: theme.accentSoft }]}
                            onPress={() => navigation.navigate('WriteReview', {
                              food,
                              editReview: {
                                id: review.id,
                                rating: review.rating,
                                review: review.review,
                                media: review.media || null,
                              },
                            })}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="create-outline" size={14} color={theme.accent} />
                            <Text style={[styles.editReviewButtonText, { color: theme.accent }]}>Edit</Text>
                          </TouchableOpacity>
                        )}
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

                {foodReviews.length > 3 && !showAllReviews && (
                  <TouchableOpacity style={styles.showMoreButton} onPress={() => setShowAllReviews(true)} activeOpacity={0.8}>
                    <Text style={[styles.showMoreText, { color: theme.accent }]}>
                      Show all {foodReviews.length} reviews
                    </Text>
                    <Ionicons name="chevron-down" size={18} color={theme.accent} />
                  </TouchableOpacity>
                )}

                {showAllReviews && foodReviews.length > 3 && (
                  <TouchableOpacity style={styles.showMoreButton} onPress={() => setShowAllReviews(false)} activeOpacity={0.8}>
                    <Text style={[styles.showMoreText, { color: theme.accent }]}>Show less</Text>
                    <Ionicons name="chevron-up" size={18} color={theme.accent} />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* ── Sticky Review CTA ────────────────────────────────── */}
      <View style={[styles.buttonContainer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        {canWriteReview ? (
          <TouchableOpacity
            style={[styles.writeReviewButton, { backgroundColor: theme.accent }]}
            onPress={() => {
              if (!isLoggedIn) {
                setModalMessage('Please login first to write a review');
                setShowModal(true);
                return;
              }
              navigation.navigate("WriteReview", { food });
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            <Text style={styles.writeReviewText}>Write a Review</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ padding: 12, backgroundColor: theme.surfaceElevated, borderRadius: 12, alignItems: 'center' }}>
            <Ionicons name="lock-closed-outline" size={24} color={theme.textMuted} style={{ marginBottom: 4 }} />
            <Text style={{ textAlign: 'center', color: theme.textSecondary, fontSize: 13, lineHeight: 18 }}>
              You need at least one completed transaction at our physical POS before you can write a review. Please provide your registered account details to the cashier on your next visit!
            </Text>
          </View>
        )}
      </View>

      {/* ── Favorite Toggle Modal ────────────────────────────── */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.modalBox, { backgroundColor: theme.surface }, theme.cardShadowHeavy]}>
            <View style={[styles.modalIconWrap, { backgroundColor: isFav ? theme.accentSoft : theme.surfaceElevated }]}>
              <Ionicons
                name={isFav ? "heart" : "heart-dislike"}
                size={32}
                color={isFav ? theme.accent : theme.textMuted}
              />
            </View>
            <Text style={[styles.modalText, { color: theme.textPrimary }]}>
              {modalMessage}
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.accent }]}
              onPress={() => setShowModal(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  detailScroll: { flex: 1 },
  detailContent: { paddingBottom: spacing['3xl'] },

  // ── Hero ────────────────────────────────────────────────────
  detailImageContainer: { position: 'relative', width: '100%', height: 320 },
  detailImage: { width: '100%', height: '100%' },
  heroGradientTop: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 80,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  heroGradientBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  backButton: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    borderRadius: radii.full,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  detailCategoryBadge: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCategoryText: { ...typography.labelMd },
  detailStockBadge: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  detailStockText: { ...typography.labelMd, color: '#FFFFFF' },

  // ── Content ─────────────────────────────────────────────────
  detailInfo: { padding: spacing.xl },
  titlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  detailTitle: { ...typography.displayMd, marginBottom: spacing.sm },
  pricePill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    marginLeft: spacing.md,
  },
  pricePillText: { ...typography.headingLg },
  detailStarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    marginBottom: spacing.md,
  },
  ratingText: { ...typography.labelLg, marginLeft: spacing.sm },
  detailDesc: { ...typography.bodyLg, marginBottom: spacing['2xl'] },

  // ── Info Grid (Bento) ───────────────────────────────────────
  priceStockSection: {
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionTitle: { ...typography.headingMd, marginBottom: spacing.lg },
  priceStockGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: spacing.lg,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoTextContainer: { flex: 1 },
  infoLabel: { ...typography.caption, marginBottom: spacing.xxs },
  infoValue: { ...typography.headingSm },

  // ── Favorite Button ─────────────────────────────────────────
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },
  favoriteButtonText: { color: '#FFFFFF', flexShrink: 1, textAlign: 'center'},

  // ── Reviews ─────────────────────────────────────────────────
  reviewsSection: {
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  reviewsSectionTitle: { ...typography.headingLg },
  reviewsCount: { ...typography.bodyMd },
  noReviewsContainer: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.md,
  },
  noReviewsText: { ...typography.bodyMd },
  reviewCard: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  reviewAuthor: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    marginRight: spacing.md,
  },
  reviewAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  reviewAvatarText: { ...typography.headingSm },
  reviewUsername: { ...typography.labelLg },
  reviewDate: { ...typography.caption, marginTop: spacing.xxs },
  reviewHeaderActions: { alignItems: 'flex-end', gap: spacing.xs },
  reviewRating: { flexDirection: 'row', gap: spacing.xxs },
  editReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.full,
    gap: spacing.xxs,
  },
  editReviewButtonText: { ...typography.labelSm },
  reviewText: { ...typography.bodyMd, marginBottom: spacing.sm },
  reviewImage: {
    width: '100%',
    height: 200,
    borderRadius: radii.md,
    marginTop: spacing.sm,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  showMoreText: { ...typography.labelLg },

  // ── Sticky Button ───────────────────────────────────────────
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radii.lg,
    gap: spacing.sm,
  },
  writeReviewText: { color: '#FFFFFF'},

  // ── Modal ───────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '82%',
    borderRadius: radii['2xl'],
    padding: spacing['3xl'],
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  modalText: {
    ...typography.headingSm,
    marginBottom: spacing['2xl'],
    textAlign: 'center',
  },
  modalButton: {
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['3xl'],
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonText: { color: '#FFFFFF', ...typography.labelLg },
});