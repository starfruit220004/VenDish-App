import React from 'react';
import {View,Text,Image,ScrollView,TouchableOpacity,StyleSheet,Dimensions,Modal,} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from './FavoritesContext';

const sampleFoods = [
  {
    id: 1,
    name: 'Chicken Adobo',
    description: 'Classic Filipino dish with soy sauce and vinegar',
    image: require('../../assets/images/chicken2.jpg'),
    rating: 5,
    category: 'Main Course',
  },
  {
    id: 2,
    name: 'Pancit Canton',
    description: 'Stir-fried noodles with vegetables',
    image: require('../../assets/images/chicken2.jpg'),
    rating: 4,
    category: 'Noodles',
  },
  {
    id: 3,
    name: 'Lumpia',
    description: 'Filipino spring rolls',
    image: require('../../assets/images/chicken2.jpg'),
    rating: 5,
    category: 'Appetizer',
  },
  {
    id: 4,
    name: 'Sinigang',
    description: 'Sour tamarind soup',
    image: require('../../assets/images/chicken2.jpg'),
    rating: 4,
    category: 'Soup',
  },
  {
    id: 5,
    name: 'Tinola',
    description: 'Roasted pig, crispy skin',
    image: require('../../assets/images/chicken2.jpg'),
    rating: 5,
    category: 'Main Course',
  },
  {
    id: 6,
    name: 'Halo-Halo',
    description: 'Mixed dessert with shaved ice',
    image: require('../../assets/images/chicken2.jpg'),
    rating: 5,
    category: 'Dessert',
  },
];

function FeedHome({ navigation }: any) {
  const { isFavorite } = useFavorites();
  const cardWidth = (Dimensions.get('window').width - 30) / 2;

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[...Array(5)].map((_, i) => (
          <Ionicons
            key={i}
            name={i < rating ? 'star' : 'star-outline'}
            size={14}
            color="#FFC107"
          />
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>🍽️ Food Log</Text>
        <Text style={styles.subtitle}>Discover your favorite Filipino dishes</Text>
      </View>

      <View style={styles.row}>
        {sampleFoods.map((food) => (
          <TouchableOpacity
            key={food.id}
            style={[styles.card, { width: cardWidth }]}
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
              <Text style={styles.foodName} numberOfLines={1}>
                {food.name}
              </Text>
              <Text style={styles.foodDesc} numberOfLines={2}>
                {food.description}
              </Text>
              <View style={styles.cardFooter}>
                {renderStars(food.rating)}
                <Text style={styles.tapText}>Tap to view</Text>
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
  const isFav = isFavorite(food.id);

  // ===== Modal State =====
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

  const renderStars = (rating: number) => {
    return (
      <View style={styles.detailStarsContainer}>
        {[...Array(5)].map((_, i) => (
          <Ionicons
            key={i}
            name={i < rating ? 'star' : 'star-outline'}
            size={24}
            color="#FFC107"
          />
        ))}
        <Text style={styles.ratingText}>{rating}.0 / 5.0</Text>
      </View>
    );
  };

  return (
    <>
      <ScrollView style={styles.detailScroll} contentContainerStyle={styles.detailContent}>
        <View style={styles.detailImageContainer}>
          <Image source={food.image} style={styles.detailImage} />
          <View style={styles.detailCategoryBadge}>
            <Text style={styles.detailCategoryText}>{food.category}</Text>
          </View>
        </View>

        <View style={styles.detailInfo}>
          <Text style={styles.detailTitle}>{food.name}</Text>
          {renderStars(food.rating)}
          <Text style={styles.detailDesc}>{food.description}</Text>

          <TouchableOpacity
            style={[
              styles.favoriteButton,
              isFav ? styles.favoriteButtonRemove : styles.favoriteButtonAdd,
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

      {/* ===== Modal for Favorite Feedback ===== */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const Stack = createNativeStackNavigator();

function FeedTab() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="FeedHome"
        component={FeedHome}
        options={{
          title: 'Food Log',
          headerStyle: {
            backgroundColor: '#B71C1C',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
        }}
      />
      <Stack.Screen
        name="FoodDetail"
        component={FoodDetail}
        options={{
          title: 'Food Detail',
          headerStyle: {
            backgroundColor: '#B71C1C',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#FFEBEE',
  },
  scrollContent: {
    padding: 10,
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#B71C1C',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoritebadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#B71C1C',
    borderRadius: 20,
    padding: 6,
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#B71C1C',
  },
  cardContent: {
    padding: 12,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B71C1C',
    marginBottom: 4,
  },
  foodDesc: {
    fontSize: 12,
    color: '#616161',
    marginBottom: 8,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  tapText: {
    fontSize: 10,
    color: '#9E9E9E',
    fontWeight: '600',
  },
  detailScroll: {
    flex: 1,
    backgroundColor: '#FFEBEE',
  },
  detailContent: {
    paddingBottom: 30,
  },
  detailImageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  detailImage: {
    width: '100%',
    height: '100%',
  },
  detailCategoryBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  detailCategoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#B71C1C',
  },
  detailInfo: {
    padding: 20,
  },
  detailTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#B71C1C',
    marginBottom: 12,
  },
  detailStarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 16,
    color: '#616161',
    fontWeight: '600',
    marginLeft: 8,
  },
  detailDesc: {
    fontSize: 16,
    color: '#424242',
    lineHeight: 24,
    marginBottom: 24,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  favoriteButtonAdd: {
    backgroundColor: '#B71C1C',
  },
  favoriteButtonRemove: {
    backgroundColor: '#757575',
  },
  favoriteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // ===== Modal Styles =====
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#424242',
  },
  modalButton: {
    backgroundColor: '#B71C1C',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
export default FeedTab;
