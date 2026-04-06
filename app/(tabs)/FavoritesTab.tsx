import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from './FavoritesContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTheme, spacing, typography, radii, layout, palette } from '../../constants/theme';

function FavoritesTab() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = getTheme(isDark);

  const { favorites, removeFavorite } = useFavorites();

  const renderStars = (rating: number) => (
    <View style={styles.starsContainer}>
      {[...Array(5)].map((_, i) => (
        <Ionicons
          key={i}
          name={i < rating ? 'star' : 'star-outline'}
          size={12}
          color={palette.warning}
        />
      ))}
    </View>
  );

  const renderItem = ({ item }: any) => (
    <View style={[styles.card, { width: layout.cardWidth, backgroundColor: theme.surface }, theme.cardShadow]}>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} />
        <View style={[styles.categoryBadge, { backgroundColor: isDark ? theme.surfaceElevated : 'rgba(255,255,255,0.95)' }]}>
          <Text style={[styles.categoryText, { color: theme.accent }]}>{item.category}</Text>
        </View>
        <TouchableOpacity
          style={[styles.removeButton, { backgroundColor: isDark ? theme.surfaceElevated : 'rgba(255,255,255,0.95)' }]}
          onPress={() => removeFavorite(item.id)}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close-circle" size={26} color={theme.accent} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <Text style={[styles.foodName, { color: theme.accentText }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.foodDesc, { color: theme.textMuted }]} numberOfLines={2}>
          {item.description}
        </Text>
        {renderStars(item.rating)}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconWrap, { backgroundColor: theme.accentSoft }]}>
        <Ionicons name="heart-outline" size={48} color={theme.accent} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Favorites yet for now</Text>
      <Text style={[styles.emptyText, { color: theme.textMuted }]}>
        Start adding your favorite foods from the Feed tab!
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {favorites.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.accentText }]}>
              My Favorites
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
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
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Header ──────────────────────────────────────
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: layout.screenPadding,
  },
  headerTitle: { ...typography.displaySm, marginBottom: spacing.xs },
  headerSubtitle: { ...typography.bodySm },

  // ── List ────────────────────────────────────────
  listContent: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing['4xl'],
  },
  columnWrapper: { justifyContent: 'space-between' as const, marginBottom: spacing.lg },

  // ── Card ────────────────────────────────────────
  card: {
    borderRadius: radii.xl,
    overflow: 'hidden' as const,
  },
  imageContainer: {
    position: 'relative' as const,
    width: '100%',
    height: 130,
  },
  image: { width: '100%', height: '100%' },
  categoryBadge: {
    position: 'absolute' as const,
    top: spacing.sm,
    left: spacing.sm,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
  },
  categoryText: { ...typography.caption, fontWeight: '700' as const },
  removeButton: {
    position: 'absolute' as const,
    top: spacing.sm,
    right: spacing.sm,
    borderRadius: radii.full,
    padding: 2,
  },
  cardContent: { padding: spacing.md },
  foodName: { ...typography.labelMd, marginBottom: spacing.xxs },
  foodDesc: { ...typography.caption, marginBottom: spacing.sm, lineHeight: 16 },
  starsContainer: { flexDirection: 'row' as const, gap: 2 },

  // ── Empty ───────────────────────────────────────
  emptyContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing['4xl'],
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: radii.full,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: spacing.xl,
  },
  emptyTitle: { ...typography.headingMd, marginBottom: spacing.md },
  emptyText: { ...typography.bodyLg, textAlign: 'center' as const },
});

export default FavoritesTab;