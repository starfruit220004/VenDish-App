import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SectionHeader from './SectionHeader';
import { HomeProduct } from './types';
import { getTheme, palette, radii, spacing, typography } from '../../../constants/theme';

const FALLBACK_IMAGE = require('../../../assets/images/Logo2.jpg');

type FeaturedProductsSectionProps = {
  title: string;
  subtitle: string;
  products: HomeProduct[];
  onProductPress: (product: HomeProduct) => void;
  onBrowseMenuPress?: () => void;
  showViewMenuButton?: boolean;
  showWeeklySalesLabel?: boolean;
  emptyMessage?: string;
};

const renderStars = (rating: number) => {
  const rounded = Math.round(rating);
  return [...Array(5)].map((_, index) => (
    <Ionicons
      key={`${rating}-${index}`}
      name={index < rounded ? 'star' : 'star-outline'}
      size={12}
      color={palette.warning}
    />
  ));
};

export default function FeaturedProductsSection({
  title,
  subtitle,
  products,
  onProductPress,
  onBrowseMenuPress,
  showViewMenuButton = false,
  showWeeklySalesLabel = false,
  emptyMessage = 'No featured products available right now.',
}: FeaturedProductsSectionProps) {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);

  return (
    <View style={styles.sectionContainer}>
      <SectionHeader title={title} subtitle={subtitle} />

      {products.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: theme.surface }, theme.cardShadow]}>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>{emptyMessage}</Text>
        </View>
      ) : (
        products.map((product, index) => (
          <TouchableOpacity
          key={`${title}-${product.id}-${index}`}
          style={[styles.card, { backgroundColor: theme.surface }, theme.cardShadow]}
          activeOpacity={0.88}
          onPress={() => onProductPress(product)}
        >
          <Image
            source={product.imageUri ? { uri: product.imageUri } : FALLBACK_IMAGE}
            style={styles.image}
            resizeMode="cover"
          />

          <View style={styles.cardContent}>
            <View style={styles.headerRow}>
              <Text style={[styles.foodName, { color: theme.textPrimary }]} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={[styles.price, { color: theme.accent }]}>₱{product.price.toFixed(0)}</Text>
            </View>

            <Text style={[styles.description, { color: theme.textMuted }]} numberOfLines={2}>
              {product.description}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaInfo}>
                {showWeeklySalesLabel && typeof product.weeklyUnitsSold === 'number' ? (
                  <Text style={[styles.weeklySalesText, { color: theme.textSecondary }]}>
                    {product.weeklyUnitsSold} sold this week
                  </Text>
                ) : null}
              </View>
            </View>

            <View style={[styles.categoryChip, { backgroundColor: theme.accentSoft }]}>
              <Text style={[styles.categoryText, { color: theme.accent }]} numberOfLines={1}>
                {product.category}
              </Text>
            </View>
          </View>
          </TouchableOpacity>
        ))
      )}

      {showViewMenuButton && onBrowseMenuPress ? (
        <TouchableOpacity
          style={[styles.menuButton, { borderColor: theme.accent }]}
          onPress={onBrowseMenuPress}
          activeOpacity={0.88}
        >
          <Ionicons name="restaurant-outline" size={18} color={theme.accent} />
          <Text style={[styles.menuButtonText, { color: theme.accent }]}>View Full Menu</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: spacing['2xl'],
  },
  card: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    flexDirection: 'row',
  },
  emptyCard: {
    borderRadius: radii.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.bodySm,
    textAlign: 'center',
  },
  image: {
    width: 110,
    height: 110,
  },
  cardContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xxs,
  },
  foodName: {
    ...typography.headingSm,
    flex: 1,
  },
  price: {
    ...typography.labelLg,
  },
  description: {
    ...typography.bodySm,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  metaInfo: {
    alignItems: 'flex-end',
  },
  metaText: {
    ...typography.caption,
    textAlign: 'right',
  },
  weeklySalesText: {
    ...typography.bodySm,
    marginTop: spacing.xxs,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
  },
  categoryText: {
    ...typography.labelSm,
  },
  menuButton: {
    borderWidth: 1.5,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  menuButtonText: {
    ...typography.labelLg,
  },
});