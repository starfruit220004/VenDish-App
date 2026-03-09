import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, TextInput, useColorScheme, ActivityIndicator } from 'react-native';
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
import { getTheme, spacing, typography, radii, layout, palette } from '../../constants/theme';

function FeedHome({ navigation }: any) {
  const { isFavorite } = useFavorites();
  const { getAverageFoodRating, refreshReviews } = useReviews();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = getTheme(isDark);

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
        isAvailable: item.is_available,
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

  const dynamicCategories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(foods.map(food => food.category).filter(Boolean)));
    return ['All', ...uniqueCategories];
  }, [foods]);

  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusDisplay = (isAvailable: boolean) => {
    if (isAvailable) return { text: 'Available', color: palette.success };
    return { text: 'Unavailable', color: palette.error };
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={[styles.headerLogoWrap, { backgroundColor: theme.accentSoft }]}>
          <Image
            source={require('../../assets/images/Logo2.jpg')}
            style={styles.headerLogo}
          />
        </View>
        <Text style={[styles.title, { color: theme.accentText }]}>
          Kuya Vince Carenderia
        </Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          Discover your favorite Filipino dishes
        </Text>
      </View>

      {/* ── Search + Filter ────────────────────────────────────── */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.surface, ...theme.cardShadow }]}>
          <Ionicons name="search" size={18} color={theme.textMuted} style={{ marginRight: spacing.sm }} />
          <TextInput
            placeholder="Search food..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholderTextColor={theme.textDisabled}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: theme.accent }]}
          onPress={() => setShowFilter(!showFilter)}
          activeOpacity={0.8}
        >
          <Ionicons name="options-outline" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* ── Category Chips ─────────────────────────────────────── */}
      {showFilter && (
        <View style={[styles.filterDropdown, { backgroundColor: theme.surface, ...theme.cardShadow }]}>
          <View style={styles.chipRow}>
            {dynamicCategories.map(cat => {
              const isActive = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => { setSelectedCategory(cat); setShowFilter(false); }}
                  style={[
                    styles.chip,
                    { backgroundColor: isActive ? theme.accent : theme.surfaceElevated },
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.chipText,
                    { color: isActive ? '#FFFFFF' : theme.textSecondary },
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* ── Active Filter Indicator ────────────────────────────── */}
      {selectedCategory !== 'All' && (
        <View style={styles.activeFilterRow}>
          <TouchableOpacity
            style={[styles.activeFilterChip, { backgroundColor: theme.accentSoft }]}
            onPress={() => setSelectedCategory('All')}
            activeOpacity={0.7}
          >
            <Text style={[styles.activeFilterText, { color: theme.accent }]}>{selectedCategory}</Text>
            <Ionicons name="close" size={14} color={theme.accent} />
          </TouchableOpacity>
          <Text style={[styles.resultCount, { color: theme.textMuted }]}>
            {filteredFoods.length} {filteredFoods.length === 1 ? 'item' : 'items'}
          </Text>
        </View>
      )}

      {/* ── Food Grid ──────────────────────────────────────────── */}
      <View style={styles.row}>
        {filteredFoods.map(food => {
          const status = getStatusDisplay(food.isAvailable);
          return (
            <TouchableOpacity
              key={food.id}
              style={[
                styles.card,
                { width: layout.cardWidth, backgroundColor: theme.surface },
                theme.cardShadow,
              ]}
              onPress={() => navigation.navigate('FoodDetail', { food })}
              activeOpacity={0.85}
            >
              <View style={styles.imageContainer}>
                <Image source={food.image} style={styles.image} resizeMode="cover" />

                {/* Gradient overlay at bottom of image for better text readability */}
                

                {isFavorite(food.id) && (
                  <View style={[styles.favoriteBadge, { backgroundColor: theme.accent }]}>
                    <Ionicons name="heart" size={12} color="#FFFFFF" />
                  </View>
                )}

                <View style={[styles.stockBadge, { backgroundColor: status.color }]}>
                  <Text style={styles.stockText}>{status.text}</Text>
                </View>
              </View>

              <View style={styles.cardContent}>
                <Text
                  style={[styles.foodName, { color: theme.textPrimary }]}
                  numberOfLines={1}
                >
                  {food.name}
                </Text>

                <Text style={[styles.priceValue, { color: theme.accent }]}>
                  ₱{food.price.toFixed(0)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Empty State ────────────────────────────────────────── */}
      {filteredFoods.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color={theme.textDisabled} />
          <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>No dishes found</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
            Try adjusting your search or filters
          </Text>
        </View>
      )}
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
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing['4xl'],
  },

  // ── Header ──────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  headerLogoWrap: {
    width: 72,
    height: 72,
    borderRadius: radii['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  headerLogo: {
    width: 72,
    height: 72,
    borderRadius: radii['2xl'],
  },
  title: {
    ...typography.displayMd,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMd,
  },

  // ── Search ──────────────────────────────────────────────────
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    height: 44,
  },
  searchInput: {
    flex: 1,
    ...typography.bodyMd,
    paddingVertical: 0,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Filter Chips ────────────────────────────────────────────
  filterDropdown: {
    padding: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.full,
  },
  chipText: {
    ...typography.labelMd,
  },

  // ── Active Filter ───────────────────────────────────────────
  activeFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
  },
  activeFilterText: {
    ...typography.labelMd,
  },
  resultCount: {
    ...typography.bodySm,
  },

  // ── Food Grid ───────────────────────────────────────────────
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    marginBottom: spacing.lg,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',

  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  favoriteBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    borderRadius: radii.full,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockText: {
    ...typography.labelMd,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cardContent: {
    padding: spacing.md,
  },
  foodName: {
    ...typography.headingSm,
    marginBottom: spacing.xxs,
  },
  priceValue: {
    ...typography.headingMd,
  },

  // ── Empty State ─────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['5xl'],
    gap: spacing.sm,
  },
  emptyTitle: {
    ...typography.headingMd,
  },
  emptySubtitle: {
    ...typography.bodyMd,
  },
});