import React from 'react';
import {View,Text,ScrollView,TouchableOpacity,Image,StyleSheet,Dimensions,Modal,TextInput,useColorScheme,} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from './FavoritesContext';
import WriteReview from './WriteReview'; 

const sampleFoods = [
  { id: 1, name: 'Chicken Adobo', description: 'Classic Filipino dish with soy sauce and vinegar', image: require('../../assets/images/adobo.jpg'), rating: 5, category: 'Main Course' },
  { id: 2, name: 'Pancit Canton', description: 'Stir-fried noodles with vegetables', image: require('../../assets/images/pancit-canton2.jpg'), rating: 4, category: 'Noodles' },
  { id: 3, name: 'Lumpia', description: 'Filipino spring rolls', image: require('../../assets/images/lumpia.jpg'), rating: 5, category: 'Appetizer' },
  { id: 4, name: 'Sinigang', description: 'Sour tamarind soup', image: require('../../assets/images/sinigang.jpg'), rating: 4, category: 'Soup' },
  { id: 5, name: 'Tinola', description: 'Filipino chicken ginger soup', image: require('../../assets/images/tinola.jpg'), rating: 5, category: 'Main Course' },
  { id: 6, name: 'Halo-Halo', description: 'Mixed dessert with shaved ice', image: require('../../assets/images/halohalo.jpg'), rating: 5, category: 'Dessert' },
  { id: 7, name: 'Siomai', description: 'Filipino-style steamed dumpling', image: require('../../assets/images/siomai.jpg'), rating: 5, category: 'Appetizer' },
  { id: 8, name: 'Leche Flan', description: 'Rich and creamy Filipino caramel custard dessert', image: require('../../assets/images/leche.jpg'), rating: 5, category: 'Dessert' },
];

type FeedStackParamList = {
  FeedHome: undefined;
  FoodDetail: { food: typeof sampleFoods[0] };
  WriteReview: { food: typeof sampleFoods[0] };
};

function FeedHome({ navigation }: any) {
  const { isFavorite } = useFavorites();
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';
  const cardWidth = (Dimensions.get('window').width - 30) / 2;

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [showFilter, setShowFilter] = React.useState(false);

  const categories = ['All', 'Main Course', 'Noodles', 'Appetizer', 'Soup', 'Dessert'];

  const filteredFoods = sampleFoods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderStars = (rating: number) => (
    <View style={styles.starsContainer}>
      {[...Array(5)].map((_, i) => (
        <Ionicons key={i} name={i < rating ? 'star' : 'star-outline'} size={14} color="#FFC107" />
      ))}
    </View>
  );

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
        {filteredFoods.map(food => (
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
              <View style={styles.cardFooter}>
                {renderStars(food.rating)}
                <Text style={[styles.tapText, { color: isDarkMode ? '#757575' : '#9E9E9E' }]}>
                  Tap to view
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

function FoodDetail({ route, navigation }: any) {
  const { food } = route.params;
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const scheme = useColorScheme();
  const isDarkMode = scheme === 'dark';
  const isFav = isFavorite(food.id);

  const [showModal, setShowModal] = React.useState(false);
  const [modalMessage, setModalMessage] = React.useState('');

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

  const renderStars = (rating: number) => (
    <View style={styles.detailStarsContainer}>
      {[...Array(5)].map((_, i) => (
        <Ionicons key={i} name={i < rating ? 'star' : 'star-outline'} size={24} color="#FFC107" />
      ))}
      <Text style={[styles.ratingText, { color: isDarkMode ? '#BDBDBD' : '#616161' }]}>
        {rating}.0 / 5.0
      </Text>
    </View>
  );

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
        </View>

        <View style={styles.detailInfo}>
          <Text style={[styles.detailTitle, { color: isDarkMode ? '#FF5252' : '#B71C1C' }]}>
            {food.name}
          </Text>
          {renderStars(food.rating)}
          <Text style={[styles.detailDesc, { color: isDarkMode ? '#BDBDBD' : '#424242' }]}>
            {food.description}
          </Text>

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
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
  <TouchableOpacity
    style={[styles.writeReviewButton, { marginHorizontal: 0 }]} 

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
    </Stack.Navigator>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { padding: 10, paddingBottom: 30 },
  header: { alignItems: 'center', marginVertical: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14 },
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
  cardContent: { padding: 12 },
  foodName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  foodDesc: { fontSize: 12, marginBottom: 8, lineHeight: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  starsContainer: { flexDirection: 'row', gap: 2 },
  tapText: { fontSize: 10, fontWeight: '600' },
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
  detailInfo: { padding: 20 },
  detailTitle: { fontSize: 32, fontWeight: 'bold', marginBottom: 12 },
  detailStarsContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  ratingText: { fontSize: 16, fontWeight: '600', marginLeft: 8 },
  detailDesc: { fontSize: 16, lineHeight: 24, marginBottom: 24 },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10
  },
  favoriteButtonAdd: { backgroundColor: '#B71C1C' },
  favoriteButtonRemove: { backgroundColor: '#757575' },
  favoriteButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
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
  writeReviewButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#B71C1C', 
  paddingVertical: 16,
  borderRadius: 12,
  gap: 10,
  marginTop: 20,
},
writeReviewText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: 'bold'

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