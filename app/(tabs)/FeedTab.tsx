import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions, Modal, TextInput, useColorScheme } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from './FavoritesContext';
import { useReviews } from './ReviewsContext';
import WriteReview from './WriteReview';
import WriteShopReview from './WriteShopReview';
import FoodDetail from './FoodDetail';
import { Food, FeedStackParamList } from '../types';

const sampleFoods: Food[] = [
  { id: 1, name: 'Chicken Adobo', description: '', image: require('../../assets/images/adobo.jpg'), category: 'Chicken', price: 120, stock: 15 },
  { id: 2, name: 'Monggo', description: '', image: require('../../assets/images/monggo.jpg'), category: 'Vegetables', price: 80, stock: 20 },
  { id: 3, name: 'Paklay', description: '', image: require('../../assets/images/paklay.jpg'), category: 'Beef', price: 60, stock: 25 },
  { id: 4, name: 'Sayote', description: '', image: require('../../assets/images/sayote.jpg'), category: 'Vegetables', price: 110, stock: 12 },
  { id: 5, name: 'Chicken Curry', description: '', image: require('../../assets/images/chickencurry.jpg'), category: 'Chicken', price: 100, stock: 18 },
  { id: 6, name: 'Tinolang Isda', description: '', image: require('../../assets/images/fishsoup.jpg'), category: 'Fish', price: 75, stock: 30 },
  { id: 7, name: 'Fried Chicken', description: '', image: require('../../assets/images/friedchicken.jpg'), category: 'Chicken', price: 50, stock: 40 },
  { id: 8, name: 'Beef Tapa', description: '', image: require('../../assets/images/beeftapa.jpg'), category: 'Beef', price: 65, stock: 22 },
];

function FeedHome({ navigation }: any) {
  const { isFavorite } = useFavorites();
  const { getAverageFoodRating, refreshReviews } = useReviews();
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

  const categories = ['All', 'Beef', 'Chicken', 'Fish', 'Vegetables'];

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
        <Image 
          source={require('../../assets/images/Logo2.jpg')} 
          style={styles.headerLogo}
        />
        <Text style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#B71C1C' }]}>
          Kuya Vince Carenderia
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
                {/* <Text
                  style={[
                    styles.foodDesc,
                    { color: isDarkMode ? '#BDBDBD' : '#616161' }
                  ]}
                  numberOfLines={2}
                >
                  {food.description}
                </Text> */}
                
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

                {/* <View style={styles.cardFooter}>
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
                </View> */}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
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
  header: { alignItems: 'center', marginVertical: 5 },
  headerLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
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