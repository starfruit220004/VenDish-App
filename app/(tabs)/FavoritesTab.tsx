import React from 'react';
import {View,Text,FlatList,Image,StyleSheet,TouchableOpacity,Dimensions,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from './FavoritesContext';

function FavoritesTab() {
  const { favorites, removeFavorite } = useFavorites();
  const cardWidth = (Dimensions.get('window').width - 30) / 2;

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[...Array(5)].map((_, i) => (
          <Ionicons
            key={i}
            name={i < rating ? 'star' : 'star-outline'}
            size={12}
            color="#FFC107"
          />
        ))}
      </View>
    );
  };

  const renderItem = ({ item }: any) => (
    <View style={[styles.card, { width: cardWidth }]}>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFavorite(item.id)}
          activeOpacity={0.8}
        >
          <Ionicons name="close-circle" size={28} color="#B71C1C" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.foodName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.foodDesc} numberOfLines={2}>
          {item.description}
        </Text>
        {renderStars(item.rating)}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💝</Text>
      <Text style={styles.emptyTitle}>No favorites yet</Text>
      <Text style={styles.emptyText}>
        Start adding your favorite foods from the Feed tab!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {favorites.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>⭐ My Favorites</Text>
            <Text style={styles.headerSubtitle}>
              {favorites.length} {favorites.length === 1 ? 'dish' : 'dishes'} saved
            </Text>
          </View>
          <FlatList
            data={favorites}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCE4EC',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#B71C1C',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#757575',
  },
  listContent: {
    padding: 10,
  },
  columnWrapper: {
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
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
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
    fontSize: 9,
    fontWeight: 'bold',
    color: '#B71C1C',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
  },
  cardContent: {
    padding: 10,
  },
  foodName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#B71C1C',
    marginBottom: 4,
  },
  foodDesc: {
    fontSize: 11,
    color: '#616161',
    marginBottom: 6,
    lineHeight: 14,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 24,
  },
});
export default FavoritesTab;