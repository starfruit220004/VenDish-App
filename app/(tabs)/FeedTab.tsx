import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions, TextInput, useColorScheme, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from './FavoritesContext';
import { useReviews } from './ReviewsContext';
import WriteReview from './WriteReview';
import WriteShopReview from './WriteShopReview';
import FoodDetail from './FoodDetail';
import { Food, FeedStackParamList } from '../types';
import api from '../../api/api'; 

function FeedHome({ navigation }: any) {
  const { isFavorite } = useFavorites();
  const { getAverageFoodRating, refreshReviews } = useReviews();
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';
  const cardWidth = (Dimensions.get('window').width - 30) / 2;

  const [foods, setFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [showFilter, setShowFilter] = React.useState(false);

  const fetchFoods = async () => {
    try {
      const response = await api.get('/firstapp/products/');
      
      const mappedFoods = response.data.map((item: any) => ({
        id: item.id, 
        name: item.product_name,
        description: item.description || `Delicious ${item.category} dish`, 
        image: item.image ? { uri: item.image } : require('../../assets/images/Logo2.jpg'),
        category: item.category,
        price: Number(item.price),
        // ✅ CHANGED: Map 'is_available' from backend to 'isAvailable'
        isAvailable: item.is_available 
      }));

      setFoods(mappedFoods);
    } catch (error) {
      console.error("Failed to fetch foods:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      refreshReviews();
      fetchFoods(); 
    }, [refreshReviews])
  );

  const categories = ['All', 'Beef', 'Chicken', 'Fish', 'Vegetables', 'Combo Meal', 'Value Meal', 'Add-on', 'Others'];

  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // ✅ CHANGED: Logic to determine status text and color
  const getStatusDisplay = (isAvailable: boolean) => {
    if (isAvailable) {
      return { text: 'Available', color: '#4CAF50' }; // Green
    }
    return { text: 'Unavailable', color: '#F44336' }; // Red
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDarkMode ? '#000' : '#FFEBEE' }]}>
        <ActivityIndicator size="large" color="#B71C1C" />
      </View>
    );
  }

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
          <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 5}}>
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
        </View>
      )}

      <View style={styles.row}>
        {filteredFoods.map(food => {
          // ✅ CHANGED: Get status based on boolean
          const status = getStatusDisplay(food.isAvailable);
          
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
                <Image source={food.image} style={styles.image} resizeMode="cover" />
                {isFavorite(food.id) && (
                  <View style={styles.favoritebadge}>
                    <Ionicons name="heart" size={16} color="#FFFFFF" />
                  </View>
                )}
                
                {/* ✅ CHANGED: Display Status Badge */}
                <View style={[styles.stockBadge, { backgroundColor: status.color }]}>
                  <Text style={styles.stockText}>{status.text}</Text>
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
                
                <View style={styles.priceStockContainer}>
                  <View style={styles.priceContainer}>
                    <Text style={[styles.priceLabel, { color: isDarkMode ? '#BDBDBD' : '#757575' }]}>
                      Price:
                    </Text>
                    <Text style={[styles.priceValue, { color: isDarkMode ? '#FFFFFF' : '#424242' }]}>
                      ₱{food.price}
                    </Text>
                  </View>
                  
                  {/* ✅ CHANGED: Removed Stock Quantity number display */}
                </View>
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  // Removed stockContainer styles as they are no longer used in the layout
  
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
    borderRadius: 10,
    marginBottom: 5,
    marginRight: 5,
    backgroundColor: 'rgba(0,0,0,0.05)'
  },
  filterOptionActive: {
    backgroundColor: '#B71C1C'
  },
  filterOptionText: { fontSize: 14 },
  filterOptionTextActive: { color: '#FFFFFF', fontWeight: 'bold' }
});