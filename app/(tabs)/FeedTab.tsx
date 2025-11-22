// FeedTab.tsx , FoodDetail
import React, { useCallback } from 'react';
import {View,Text,ScrollView,TouchableOpacity,Image,StyleSheet,Dimensions,Modal,TextInput,useColorScheme,} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from './FavoritesContext';
import { useReviews } from './ReviewsContext';
import WriteReview from './WriteReview'; 
import WriteShopReview from './WriteShopReview';

type Food = {
  id: number;
  name: string;
  description: string;
  image: any;
  category: string;
  price: number;
  stock: number;
};

const sampleFoods: Food[] = [
  { id: 1, name: 'Chicken Adobo', description: 'Classic Filipino dish with soy sauce and vinegar', image: require('../../assets/images/adobo.jpg'), category: 'Main Course', price: 120, stock: 15 },
  { id: 2, name: 'Pancit Canton', description: 'Stir-fried noodles with vegetables', image: require('../../assets/images/pancit-canton2.jpg'), category: 'Noodles', price: 80, stock: 20 },
  { id: 3, name: 'Lumpia', description: 'Filipino spring rolls', image: require('../../assets/images/lumpia.jpg'), category: 'Appetizer', price: 60, stock: 25 },
  { id: 4, name: 'Sinigang', description: 'Sour tamarind soup', image: require('../../assets/images/sinigang.jpg'), category: 'Soup', price: 110, stock: 12 },
  { id: 5, name: 'Tinola', description: 'Filipino chicken ginger soup', image: require('../../assets/images/tinola.jpg'), category: 'Main Course', price: 100, stock: 18 },
  { id: 6, name: 'Halo-Halo', description: 'Mixed dessert with shaved ice', image: require('../../assets/images/halohalo.jpg'), category: 'Dessert', price: 75, stock: 30 },
  { id: 7, name: 'Siomai', description: 'Filipino-style steamed dumpling', image: require('../../assets/images/siomai.jpg'), category: 'Appetizer', price: 50, stock: 40 },
  { id: 8, name: 'Leche Flan', description: 'Rich and creamy Filipino caramel custard dessert', image: require('../../assets/images/leche.jpg'), category: 'Dessert', price: 65, stock: 22 },
];

type FeedStackParamList = {
  FeedHome: undefined;
  FoodDetail: { food: Food };
  WriteReview: { food: Food };
  WriteShopReview: undefined;
};

function FeedHome({ navigation }: any) {
  const { isFavorite } = useFavorites();
  const { getAverageFoodRating, getAverageShopRating, refreshReviews } = useReviews();
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';
  const cardWidth = (Dimensions.get('window').width - 30) / 2;

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [showFilter, setShowFilter] = React.useState(false);

  useFocusEffect(
    useCallback(() => {
      console.log('FeedHome focused, refreshing reviews...');
      refreshReviews();
    }, [refreshReviews])
  );

  const categories = ['All', 'Main Course', 'Noodles', 'Appetizer', 'Soup', 'Dessert'];

  const filteredFoods = sampleFoods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderStars = (rating: number) => {
    const displayRating = Math.round(rating);
    return (
      <View style={styles.starsContainer}>
        {[...Array(5)].map((_, i) => (
          <Ionicons key={i} name={i < displayRating ? 'star' : 'star-outline'} size={14} color="#FFC107" />
        ))}
      </View>
    );
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Out of Stock', color: '#F44336' };
    if (stock < 10) return { text: 'Low Stock', color: '#FF9800' };
    return { text: 'In Stock', color: '#4CAF50' };
  };

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: isDarkMode ? '#000' : '#FFEBEE' }]}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#B71C1C' }]}>
          🍽️ Kuya Vince Carenderia
        </Text>
        <Text style={[styles.subtitle, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
          Discover your favorite Filipino dishes
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={[
          styles.searchBar,
          { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }
        ]}>
          <Ionicons name="search" size={18} color="#757575" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search food..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}
            placeholderTextColor="#9E9E9E"
          />
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilter(!showFilter)}
          activeOpacity={0.8}
        >
          <Ionicons name="filter" size={18} color="#FFFFFF" />
          <Text style={styles.filterText}>
            {selectedCategory === 'All' ? 'Filter' : selectedCategory}
          </Text>
        </TouchableOpacity>
      </View>

      {showFilter && (
        <View style={[
          styles.filterDropdown,
          { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }
        ]}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => {
                setSelectedCategory(cat);
                setShowFilter(false);
              }}
              style={[
                styles.filterOption,
                selectedCategory === cat && styles.filterOptionActive
              ]}
            >
              <Text style={[
                styles.filterOptionText,
                { color: isDarkMode && selectedCategory !== cat ? '#FFFFFF' : '#424242' },
                selectedCategory === cat && styles.filterOptionTextActive
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.row}>
        {filteredFoods.map(food => {
          const avgRating = getAverageFoodRating(food.id);
          // Show "No rating" state if no reviews yet
          const hasReviews = avgRating > 0;
          const stockStatus = getStockStatus(food.stock);
          
          return (
            <TouchableOpacity
              key={food.id}
              style={[
                styles.card,
                {
                  width: cardWidth,
                  backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF'
                }
              ]}
              onPress={() => navigation.navigate('FoodDetail', { food })}
              activeOpacity={0.8}
            >
              <View style={styles.imageContainer}>
                <Image source={food.image} style={styles.image} />
                {isFavorite(food.id) && (
                  <View style={styles.favoritebadge}>
                    <Ionicons name="heart" size={16} color="#FFFFFF" />
                  </View>
                )}
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{food.category}</Text>
                </View>
                <View style={[styles.stockBadge, { backgroundColor: stockStatus.color }]}>
                  <Text style={styles.stockText}>{stockStatus.text}</Text>
                </View>
              </View>

              <View style={styles.cardContent}>
                <Text
                  style={[
                    styles.foodName,
                    { color: isDarkMode ? '#FF5252' : '#B71C1C' }
                  ]}
                  numberOfLines={1}
                >
                  {food.name}
                </Text>
                <Text
                  style={[
                    styles.foodDesc,
                    { color: isDarkMode ? '#BDBDBD' : '#616161' }
                  ]}
                  numberOfLines={2}
                >
                  {food.description}
                </Text>
                
                {/* Price and Stock Section */}
                <View style={styles.priceStockContainer}>
                  <View style={styles.priceContainer}>
                    <Text style={[styles.priceLabel, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
                      Price:
                    </Text>
                    <Text style={[styles.priceValue, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                      ₱{food.price}
                    </Text>
                  </View>
                  <View style={styles.stockContainer}>
                    <Text style={[styles.stockLabel, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
                      Stock:
                    </Text>
                    <Text style={[styles.stockValue, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                      {food.stock}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  {hasReviews ? (
                    <>
                      {renderStars(avgRating)}
                      <Text style={[styles.ratingValue, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
                        {avgRating.toFixed(1)}
                      </Text>
                    </>
                  ) : (
                    <Text style={[styles.noRatingText, { color: isDarkMode ? '#757575' : '#9E9E9E' }]}>
                      No reviews yet
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

function FoodDetail({ route, navigation }: any) {
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

          {/* Price and Stock Information Section */}
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

      <View style={styles.buttonContainer}>
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

const Stack = createNativeStackNavigator<FeedStackParamList>();

export default function FeedTab() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="FeedHome"
        component={FeedHome}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FoodDetail"
        component={FoodDetail}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WriteReview"
        component={WriteReview}
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
  scroll: { flex: 1 },
  scrollContent: { padding: 10, paddingBottom: 30 },
  header: { alignItems: 'center', marginVertical: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 16 },
  
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  imageContainer: { position: 'relative', width: '100%', height: 140 },
  image: { width: '100%', height: '100%' },
  favoritebadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#B71C1C',
    borderRadius: 20,
    padding: 6
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  categoryText: { fontSize: 10, fontWeight: 'bold', color: '#B71C1C' },
  stockBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  stockText: { fontSize: 10, fontWeight: 'bold', color: '#FFFFFF' },
  cardContent: { padding: 12 },
  foodName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  foodDesc: { fontSize: 12, marginBottom: 8, lineHeight: 16 },
  
  // Price and Stock styles for card
  priceStockContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 10,
    marginRight: 4,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockLabel: {
    fontSize: 10,
    marginRight: 4,
  },
  stockValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  starsContainer: { flexDirection: 'row', gap: 2 },
  ratingValue: { fontSize: 12, fontWeight: '600' },
  noRatingText: { fontSize: 12, fontStyle: 'italic' },
  
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
  
  // Price and Stock 
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
  
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  searchInput: { flex: 1, fontSize: 14 },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B71C1C',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginLeft: 10,
  },
  filterText: { color: '#FFFFFF', marginLeft: 4 },
  filterDropdown: {
    padding: 10,
    borderRadius: 12,
    marginHorizontal: 10,
    marginBottom: 10
  },
  filterOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10
  },
  filterOptionActive: {
    backgroundColor: '#B71C1C'
  },
  filterOptionText: { fontSize: 14 },
  filterOptionTextActive: { color: '#FFFFFF', fontWeight: 'bold' }
});