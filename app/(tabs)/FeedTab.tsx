import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  TextInput, 
  useColorScheme, 
  ActivityIndicator, 
  RefreshControl, 
  NativeScrollEvent, 
  NativeSyntheticEvent,
  Modal,
  Platform
} from 'react-native';
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

const FEED_PAGE_SIZE = 8;
const FEED_SCROLL_TOP_THRESHOLD = 550;

function FeedHome({ navigation }: any) {
  const { isFavorite } = useFavorites();
  const { refreshReviews } = useReviews();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = getTheme(isDark);

  const [foods, setFoods] = useState<Food[]>([]);
  const [apiCategories, setApiCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [visibleFoodCount, setVisibleFoodCount] = useState(FEED_PAGE_SIZE);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const feedListRef = useRef<FlatList<Food> | null>(null);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [showFilter, setShowFilter] = React.useState(false);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/firstapp/categories/');
      const catNames = response.data.map((c: any) => c.name).filter(Boolean);
      setApiCategories(catNames);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

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
        servings: Number(item.stock_quantity ?? 0), 
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
      fetchCategories();
    }, [refreshReviews])
  );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      setVisibleFoodCount(FEED_PAGE_SIZE);
      setShowScrollTop(false);
      await Promise.all([fetchFoods(), fetchCategories(), refreshReviews()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshReviews]);

  const dynamicCategories = useMemo(() => {
    return ['All', ...apiCategories];
  }, [apiCategories]);

  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    setVisibleFoodCount(FEED_PAGE_SIZE);
    setShowScrollTop(false);
  }, [searchQuery, selectedCategory, foods.length]);

  const displayedFoods = useMemo(
    () => filteredFoods.slice(0, visibleFoodCount),
    [filteredFoods, visibleFoodCount]
  );

  const hasMoreFoods = displayedFoods.length < filteredFoods.length;

  const loadMoreFoods = useCallback(() => {
    if (!hasMoreFoods) return;
    setVisibleFoodCount((prev) => Math.min(prev + FEED_PAGE_SIZE, filteredFoods.length));
  }, [hasMoreFoods, filteredFoods.length]);

  const handleFeedScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const shouldShow = offsetY > FEED_SCROLL_TOP_THRESHOLD;
    setShowScrollTop((prev) => (prev === shouldShow ? prev : shouldShow));
  }, []);

  const scrollToTop = useCallback(() => {
    feedListRef.current?.scrollToOffset({ offset: 0, animated: true });
    setShowScrollTop(false);
  }, []);

  const getStatusDisplay = (isAvailable: boolean) => {
    if (!isAvailable) return { text: 'Unavailable', color: palette.error };
    return { text: 'Available', color: palette.success };
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? theme.background : 'transparent' }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  const renderFoodItem = ({ item: food }: { item: Food }) => {
    const status = getStatusDisplay(food.isAvailable);

    return (
      <TouchableOpacity
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
          <View style={styles.cardTopRow}>
            <View style={styles.cardTextColumn}>
              <Text
                style={[styles.foodName, { color: theme.textPrimary }]}
                numberOfLines={2}
              >
                {food.name}
              </Text>
              <Text style={[styles.servingsValue, { color: theme.textMuted }]}>
                {food.servings} {food.servings === 1 ? 'serving' : 'servings'} left
              </Text> 
            </View>
            <Text style={[styles.priceValue, { color: theme.accent }]}> 
              ₱{food.price.toFixed(0)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <FlatList
        ref={feedListRef}
        style={[styles.scroll, { backgroundColor: isDark ? theme.background : 'transparent' }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        data={displayedFoods}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={renderFoodItem}
        onEndReached={loadMoreFoods}
        onEndReachedThreshold={0.35}
        onScroll={handleFeedScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[theme.accent]}
            tintColor={theme.accent}
          />
        }
        ListHeaderComponent={
          <>
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

            <View style={styles.searchContainer}>
              <View style={[styles.searchBar, { backgroundColor: theme.surface }, theme.cardShadow]}> 
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
                style={[
                  styles.filterButton, 
                  { backgroundColor: showFilter || selectedCategory !== 'All' ? theme.accent : theme.surface },
                  (showFilter || selectedCategory === 'All') && theme.cardShadow
                ]}
                onPress={() => setShowFilter(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="options-outline" size={20} color={showFilter || selectedCategory !== 'All' ? '#FFFFFF' : theme.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Active Category Display */}
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
            
            {/* If All is selected, still show result count cleanly */}
            {selectedCategory === 'All' && (
              <View style={[styles.activeFilterRow, { justifyContent: 'flex-end' }]}>
                <Text style={[styles.resultCount, { color: theme.textMuted }]}> 
                  {filteredFoods.length} {filteredFoods.length === 1 ? 'item' : 'items'}
                </Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={theme.textDisabled} />
            <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>No dishes found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}> 
              Try adjusting your search or filters
            </Text>
          </View>
        }
        ListFooterComponent={
          hasMoreFoods ? (
            <View style={styles.paginationHint}>
              <Text style={[styles.paginationHintText, { color: theme.textMuted }]}>Loading more dishes as you scroll...</Text>
            </View>
          ) : null
        }
      />

      {showScrollTop && (
        <TouchableOpacity
          style={[styles.scrollTopButton, { backgroundColor: theme.accent }, theme.cardShadowHeavy]}
          onPress={scrollToTop}
          activeOpacity={0.9}
        >
          <Ionicons name="arrow-up" size={20} color="#FFF" />
        </TouchableOpacity>
      )}

      {/* Popover Dropdown Modal */}
      <Modal visible={showFilter} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.popoverOverlay} 
          activeOpacity={1} 
          onPress={() => setShowFilter(false)}
        >
          <View style={[styles.popoverMenu, { backgroundColor: theme.surface }, theme.cardShadowHeavy]}>
            <Text style={[styles.popoverTitle, { color: theme.textMuted }]}>Select Category</Text>
            <View style={styles.popoverDivider} />
            
            {dynamicCategories.map(cat => {
              const isActive = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => { setSelectedCategory(cat); setShowFilter(false); }}
                  style={[
                    styles.popoverItem,
                    isActive && { backgroundColor: theme.accentSoft }
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.popoverItemText,
                    { 
                      color: isActive ? theme.accent : theme.textPrimary,
                      fontWeight: isActive ? '700' : '500' 
                    },
                  ]}>
                    {cat}
                  </Text>
                  {isActive && <Ionicons name="checkmark" size={18} color={theme.accent} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const Stack = createNativeStackNavigator<FeedStackParamList>();

export default function FeedTab() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);

  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: isDark ? theme.background : 'transparent' },
      }}
    >
      <Stack.Screen
        name="FeedHome"
        component={FeedHome}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FoodDetail"
        component={FoodDetail}
        options={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
        }}
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
    height: 48,
  },
  searchInput: {
    flex: 1,
    ...typography.bodyLg,
    paddingVertical: 0,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
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
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTextColumn: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  foodName: {
    ...typography.headingSm,
  },
  priceValue: {
    ...typography.headingMd,
    textAlign: 'right',
  },
  servingsValue: {
    ...typography.bodySm,
    marginTop: spacing.xxs,
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
  paginationHint: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  paginationHintText: {
    ...typography.bodySm,
  },
  scrollTopButton: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing['5xl'],
    width: 46,
    height: 46,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Popover Menu ────────────────────────────────────────────
  popoverOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  popoverMenu: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 220 : 200, // Anchored just below the search bar
    right: spacing.lg,
    width: 220,
    borderRadius: radii.xl,
    padding: spacing.xs,
    zIndex: 100,
  },
  popoverTitle: {
    ...typography.caption,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  popoverDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginHorizontal: spacing.sm,
    marginBottom: spacing.xs,
  },
  popoverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    marginBottom: 2,
  },
  popoverItemText: {
    ...typography.bodyMd,
  },
});