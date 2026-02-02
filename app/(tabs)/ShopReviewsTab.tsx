import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useReviews } from './ReviewsContext';
import WriteShopReview from './WriteShopReview';

const Stack = createNativeStackNavigator();

function ShopReviewsHome({ navigation }: any) {
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';
  const { shopReviews, getAverageShopRating } = useReviews();
  
  const [showAllReviews, setShowAllReviews] = useState(false);
  const averageRating = getAverageShopRating();
  const displayedReviews = showAllReviews ? shopReviews : shopReviews.slice(0, 5);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderStars = (rating: number) => {
    const roundedRating = Math.round(rating);
    return (
      <View style={styles.starsContainer}>
        {[...Array(5)].map((_, i) => (
          <Ionicons key={i} name={i < roundedRating ? 'star' : 'star-outline'} size={20} color="#FFC107" />
        ))}
      </View>
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#FFEBEE' }]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="restaurant" size={64} color={isDarkMode ? '#FF5252' : '#B71C1C'} />
        <Text style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#B71C1C' }]}>
          Kuya Vince Carenderia
        </Text>
        <Text style={[styles.subtitle, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
          Shop Reviews
        </Text>
      </View>

      {/* Overall Rating Card */}
      <View style={[styles.ratingCard, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}>
        <View style={styles.ratingContent}>
          <Text style={[styles.ratingNumber, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
            {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
          </Text>
          {renderStars(averageRating)}
          <Text style={[styles.ratingCount, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
            {shopReviews.length} {shopReviews.length === 1 ? 'review' : 'reviews'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.writeReviewButton}
          onPress={() => navigation.navigate('WriteShopReview')}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={20} color="#FFFFFF" />
          <Text style={styles.writeReviewText}>Write a Review</Text>
        </TouchableOpacity>
      </View>

      {/* Reviews Section */}
      <View style={styles.reviewsSection}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
          Customer Reviews
        </Text>

        {shopReviews.length === 0 ? (
          <View style={[styles.noReviewsContainer, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}>
            <Ionicons name="chatbox-outline" size={64} color={isDarkMode ? '#424242' : '#E0E0E0'} />
            <Text style={[styles.noReviewsTitle, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
              No reviews yet
            </Text>
            <Text style={[styles.noReviewsText, { color: isDarkMode ? '#757575' : '#9E9E9E' }]}>
              Be the first to review our shop!
            </Text>
            <TouchableOpacity
              style={styles.firstReviewButton}
              onPress={() => navigation.navigate('WriteShopReview')}
              activeOpacity={0.8}
            >
              <Text style={styles.firstReviewButtonText}>Write First Review</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {displayedReviews.map(review => (
              <View 
                key={review.id} 
                style={[
                  styles.reviewCard, 
                  { 
                    backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
                    borderColor: isDarkMode ? '#2C2C2E' : '#F0F0F0'
                  }
                ]}
              >
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
                      <Ionicons 
                        key={i} 
                        name={i < review.rating ? 'star' : 'star-outline'} 
                        size={16} 
                        color="#FFC107" 
                      />
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

            {shopReviews.length > 5 && !showAllReviews && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => setShowAllReviews(true)}
                activeOpacity={0.8}
              >
                <Text style={[styles.showMoreText, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
                  Show all {shopReviews.length} reviews
                </Text>
                <Ionicons name="chevron-down" size={20} color={isDarkMode ? '#FF5252' : '#B71C1C'} />
              </TouchableOpacity>
            )}

            {showAllReviews && shopReviews.length > 5 && (
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
    </ScrollView>
  );
}

// Export with Stack Navigator
export default function ShopReviewsTab() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ShopReviewsHome"
        component={ShopReviewsHome}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WriteShopReview"
        component={WriteShopReview}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginVertical: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  ratingCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  ratingContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  ratingCount: {
    fontSize: 14,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B71C1C',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    width: '100%',
  },
  writeReviewText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  noReviewsContainer: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  noReviewsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  noReviewsText: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  firstReviewButton: {
    backgroundColor: '#B71C1C',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  firstReviewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  reviewCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reviewAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  reviewUsername: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  reviewImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginTop: 8,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  showMoreText: {
    fontSize: 15,
    fontWeight: '600',
  },
});