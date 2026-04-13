import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SectionHeader from './SectionHeader';
import { HomePromo } from './types';
import { getTheme, radii, spacing, typography } from '../../../constants/theme';

type LatestPromosSectionProps = {
  promos: HomePromo[];
  onOpenPromosPress: () => void;
};

const getStatusColor = (status: string, accent: string, muted: string) => {
  const value = status.toLowerCase();
  if (value === 'active') return accent;
  if (value === 'claimed') return '#16A34A';
  return muted;
};

export default function LatestPromosSection({ promos, onOpenPromosPress }: LatestPromosSectionProps) {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);

  return (
    <View style={styles.sectionContainer}>
      <SectionHeader
        title="Latest Promos"
        subtitle="Fresh deals you can claim right now"
      />

      {promos.map((promo, index) => (
        <TouchableOpacity
          key={`promo-${promo.id}-${index}`}
          style={[styles.card, { backgroundColor: theme.surface }, theme.cardShadow]}
          onPress={onOpenPromosPress}
          activeOpacity={0.88}
        >
          <View style={[styles.discountBadge, { backgroundColor: theme.accent }]}> 
            <Text style={styles.discountText}>{promo.rateLabel}</Text>
          </View>

          <View style={styles.content}>
            <Text style={[styles.promoTitle, { color: theme.textPrimary }]}>{promo.title}</Text>
            <Text style={[styles.promoProduct, { color: theme.accentText }]}>{promo.productName}</Text>
            <Text style={[styles.description, { color: theme.textMuted }]} numberOfLines={2}>
              {promo.description}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={theme.textMuted} />
                <Text style={[styles.metaText, { color: theme.textMuted }]}>{promo.expirationLabel}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons
                  name="ellipse"
                  size={10}
                  color={getStatusColor(promo.status, theme.accent, theme.textMuted)}
                />
                <Text style={[styles.metaText, { color: theme.textMuted }]}>{promo.status}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.viewButton, { backgroundColor: theme.accent }]}
        onPress={onOpenPromosPress}
        activeOpacity={0.88}
      >
        <Ionicons name="pricetag-outline" size={18} color="#FFF" />
        <Text style={styles.viewButtonText}>Open Promos</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: spacing['2xl'],
  },
  card: {
    borderRadius: radii.xl,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  discountBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
  },
  discountText: {
    color: '#FFF',
    ...typography.labelMd,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  promoTitle: {
    ...typography.headingSm,
  },
  promoProduct: {
    ...typography.bodyMd,
    fontWeight: '600',
    marginTop: spacing.xxs,
  },
  description: {
    ...typography.bodySm,
    marginTop: spacing.xs,
  },
  metaRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  metaText: {
    ...typography.caption,
  },
  viewButton: {
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  viewButtonText: {
    color: '#FFF',
    ...typography.labelLg,
  },
});