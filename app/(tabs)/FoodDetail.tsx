import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Modal, useColorScheme } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from './FavoritesContext';
import { useReviews } from './ReviewsContext';

export default function FoodDetail({ route, navigation }: any) {
  const { food } = route.params;
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { getFoodReviews, getAverageFoodRating, refreshReviews } = useReviews();
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';
  const isFav = isFavorite(food.id);

  const [showModal, setShowModal] = React.useState(false);
  const [modalMessage, setModalMessage] = React.useState('');
  const [showAllReviews, setShowAllReviews] = React.useState(false);

  useFocusEffect(
    useCallback(() => {
      console.log('FoodDetail focused, refreshing reviews...');
      refreshReviews();
    }, [refreshReviews])
  );

  const foodReviews = getFoodReviews(food.id);
  const averageRating = getAverageFoodRating(food.id);
  const hasReviews = averageRating > 0;
  const displayedReviews = showAllReviews ? foodReviews : foodReviews.slice(0, 3);

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

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Out of Stock', color: '#F44336' };
    if (stock < 10) return { text: 'Low Stock', color: '#FF9800' };
    return { text: 'In Stock', color: '#4CAF50' };
  };

  const stockStatus = getStockStatus(food.stock);

  const renderStars = (rating: number) => {
    const roundedRating = Math.round(rating);
    return (
      <View style={styles.detailStarsContainer}>
        {[...Array(5)].map((_, i) => (
          <Ionicons key={i} name={i < roundedRating ? 'star' : 'star-outline'} size={24} color="#FFC107" />
        ))}
        <Text style={[styles.ratingText, { color: isDarkMode ? '#BDBDBD' : '#616161' }]}>
          {rating.toFixed(1)} / 5.0 {foodReviews.length > 0 && `(${foodReviews.length} ${foodReviews.length === 1 ? 'review' : 'reviews'})`}
        </Text>
      </View>
    );
  };

  const renderNoRating = () => {
    return (
      <View style={styles.detailStarsContainer}>
        {[...Array(5)].map((_, i) => (
          <Ionicons key={i} name="star-outline" size={24} color={isDarkMode ? '#424242' : '#E0E0E0'} />
        ))}
        <Text style={[styles.ratingText, { color: isDarkMode ? '#757575' : '#9E9E9E' }]}>
          No ratings yet
        </Text>
      </View>
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <ScrollView
        style={[styles.detailScroll, { backgroundColor: isDarkMode ? '#000' : '#FFEBEE' }]}
        contentContainerStyle={styles.detailContent}
      >
        <View style={styles.detailImageContainer}>
          <Image source={food.image} style={styles.detailImage} />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.detailCategoryBadge}>
            <Text style={styles.detailCategoryText}>{food.category}</Text>
          </View>
          <View style={[styles.detailStockBadge, { backgroundColor: stockStatus.color }]}>
            <Text style={styles.detailStockText}>{stockStatus.text}</Text>
          </View>
        </View>

        <View style={styles.detailInfo}>
          <Text style={[styles.detailTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
            {food.name}
          </Text>
          {hasReviews ? renderStars(averageRating) : renderNoRating()}
          <Text style={[styles.detailDesc, { color: isDarkMode ? '#BDBDBD' : '#424242' }]}>
            {food.description}
          </Text>

          {/* Price and Stock Information */}
          <View style={[styles.priceStockSection, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
              Food Information
            </Text>
            
            <View style={styles.priceStockGrid}>
              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="pricetag-outline" size={20} color={isDarkMode ? '#FF5252' : '#B71C1C'} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
                    Price
                  </Text>
                  <Text style={[styles.infoValue, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                    ₱{food.price}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="cube-outline" size={20} color={isDarkMode ? '#FF5252' : '#B71C1C'} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
                    Available Stock
                  </Text>
                  <Text style={[styles.infoValue, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                    {food.stock} servings
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="stats-chart-outline" size={20} color={isDarkMode ? '#FF5252' : '#B71C1C'} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
                    Status
                  </Text>
                  <Text style={[styles.infoValue, { color: stockStatus.color }]}>
                    {stockStatus.text}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="fast-food-outline" size={20} color={isDarkMode ? '#FF5252' : '#B71C1C'} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
                    Category
                  </Text>
                  <Text style={[styles.infoValue, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                    {food.category}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.favoriteButton,
              isFav ? styles.favoriteButtonRemove : styles.favoriteButtonAdd
            ]}
            onPress={handleFavoriteToggle}
            activeOpacity={0.8}
          >
            <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={24} color="#FFFFFF" />
            <Text style={styles.favoriteButtonText}>
              {isFav ? 'Remove from Favorites' : 'Add to Favorites'}
            </Text>
          </TouchableOpacity>

          {/* Reviews Section */}
          <View style={[styles.reviewsSection, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.reviewsHeader}>
              <Text style={[styles.reviewsSectionTitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                Customer Reviews
              </Text>
              {foodReviews.length > 0 && (
                <Text style={[styles.reviewsCount, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
                  {foodReviews.length} {foodReviews.length === 1 ? 'review' : 'reviews'}
                </Text>
              )}
            </View>

            {foodReviews.length === 0 ? (
              <View style={styles.noReviewsContainer}>
                <Ionicons name="chatbox-outline" size={48} color={isDarkMode ? '#424242' : '#E0E0E0'} />
                <Text style={[styles.noReviewsText, { color: isDarkMode ? '#757575' : '#9E9E9E' }]}>
                  No reviews yet. Be the first to review!
                </Text>
              </View>
            ) : (
              <>
                {displayedReviews.map(review => (
                  <View key={review.id} style={[styles.reviewCard, { borderColor: isDarkMode ? '#2C2C2E' : '#F0F0F0' }]}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewAuthor}>
                        <View style={[styles.reviewAvatar, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F0F0F0' }]}>
                          <Text style={[styles.reviewAvatarText, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
                            {review.username.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View>
                          <Text style={[styles.reviewUsername, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                            {review.username}
                          </Text>
                          <Text style={[styles.reviewDate, { color: isDarkMode ? '#757575' : '#9E9E9E' }]}>
                            {formatDate(review.timestamp)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.reviewRating}>
                        {[...Array(5)].map((_, i) => (
                          <Ionicons key={i} name={i < review.rating ? 'star' : 'star-outline'} size={14} color="#FFC107" />
                        ))}
                      </View>
                    </View>
                    <Text style={[styles.reviewText, { color: isDarkMode ? '#BDBDBD' : '#616161' }]}>
                      {review.review}
                    </Text>
                    {review.media && (
                      <Image source={{ uri: review.media }} style={styles.reviewImage} />
                    )}
                  </View>
                ))}

                {foodReviews.length > 3 && !showAllReviews && (
                  <TouchableOpacity
                    style={styles.showMoreButton}
                    onPress={() => setShowAllReviews(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.showMoreText, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
                      Show all {foodReviews.length} reviews
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={isDarkMode ? '#FF5252' : '#B71C1C'} />
                  </TouchableOpacity>
                )}

                {showAllReviews && foodReviews.length > 3 && (
                  <TouchableOpacity
                    style={styles.showMoreButton}
                    onPress={() => setShowAllReviews(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.showMoreText, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
                      Show less
                    </Text>
                    <Ionicons name="chevron-up" size={20} color={isDarkMode ? '#FF5252' : '#B71C1C'} />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.buttonContainer, { backgroundColor: isDarkMode ? '#000' : '#FFEBEE' }]}>
        <TouchableOpacity
          style={styles.writeReviewButton}
          onPress={() => navigation.navigate("WriteReview", { food })}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={24} color="#FFFFFF" />
          <Text style={styles.writeReviewText}>Write a Review</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalBox,
            { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }
          ]}>
            <Ionicons
              name={isFav ? "heart" : "heart-dislike"}
              size={48}
              color={isFav ? "#B71C1C" : "#757575"}
              style={{ marginBottom: 16 }}
            />
            <Text style={[styles.modalText, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
              {modalMessage}
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowModal(false)}
              activeOpacity={0.8}
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
  detailContent: { paddingBottom: 30 },
  detailImageContainer: { position: 'relative', width: '100%', height: 350 },
  detailImage: { width: '100%', height: '100%' },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
  detailCategoryBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  detailCategoryText: { fontSize: 12, fontWeight: 'bold', color: '#B71C1C' },
  detailStockBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  detailStockText: { fontSize: 12, fontWeight: 'bold', color: '#FFFFFF' },
  detailInfo: { padding: 20 },
  detailTitle: { fontSize: 32, fontWeight: 'bold', marginBottom: 12 },
  detailStarsContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  ratingText: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
  detailDesc: { fontSize: 16, lineHeight: 24, marginBottom: 24 },
  priceStockSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  priceStockGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(183, 28, 28, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    marginBottom: 24,
  },
  favoriteButtonAdd: { backgroundColor: '#B71C1C' },
  favoriteButtonRemove: { backgroundColor: '#757575' },
  favoriteButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  reviewsSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewsSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  reviewsCount: {
    fontSize: 14,
  },
  noReviewsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noReviewsText: {
    fontSize: 14,
    marginTop: 12,
  },
  reviewCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reviewAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewUsername: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  reviewDate: {
    fontSize: 12,
    marginTop: 2,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B71C1C',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  writeReviewText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalBox: {
    width: '80%',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalButton: {
    backgroundColor: '#B71C1C',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
});