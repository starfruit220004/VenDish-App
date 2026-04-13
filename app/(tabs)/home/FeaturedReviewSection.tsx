import React from 'react';
import { Image, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SectionHeader from './SectionHeader';
import { HomeReviewSpotlight } from './types';
import { getTheme, palette, radii, spacing, typography } from '../../../constants/theme';

type FeaturedReviewSectionProps = {
  review: HomeReviewSpotlight;
};

const formatReviewDate = (timestamp?: number | null): string => {
  if (!timestamp) {
    return 'Recent review';
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return 'Recent review';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function FeaturedReviewSection({ review }: FeaturedReviewSectionProps) {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);
  const reviewerInitial = (review.reviewerName || 'U').trim().charAt(0).toUpperCase() || 'U';

  return (
    <View style={styles.sectionContainer}>
      <SectionHeader
        title="Review Spotlight"
        subtitle="A highlighted 5-star customer experience"
      />

      <View style={[styles.card, { backgroundColor: theme.surfaceElevated }, theme.cardShadow]}>
        
        {/* Header: Avatar, Name, Date on the left; Icon on the right */}
        <View style={styles.topRow}>
          <View style={styles.reviewerProfile}>
            {review.profilePic ? (
              <Image source={{ uri: review.profilePic }} style={styles.reviewerAvatar} />
            ) : (
              <View style={[styles.reviewerAvatarFallback, { backgroundColor: theme.accentSoft }]}>
                <Text style={[styles.reviewerAvatarText, { color: theme.accent }]}>{reviewerInitial}</Text>
              </View>
            )}

            <View style={styles.reviewerMeta}>
              <Text style={[styles.reviewerName, { color: theme.accentText }]} numberOfLines={1}>
                {review.reviewerName}
              </Text>
              <Text style={[styles.reviewerDate, { color: theme.textMuted }]}>
                {formatReviewDate(review.reviewedAt)}
              </Text>
            </View>
          </View>

          <View style={[styles.quoteBadge, { backgroundColor: theme.accentSoft }]}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.accent} />
          </View>
        </View>

        {/* Stars */}
        <View style={styles.starsRow}>
          {[...Array(5)].map((_, index) => (
            <Ionicons
              key={`spotlight-star-${index}`}
              name={index < review.rating ? 'star' : 'star-outline'}
              size={16}
              color={palette.warning}
            />
          ))}
        </View>

        {/* Review Text */}
        <Text style={[styles.reviewText, { color: theme.textSecondary }]}>&quot;{review.text}&quot;</Text>

        {/* Footer: Type Pill */}
        {review.reviewTypeLabel ? (
          <View style={styles.bottomRow}>
            <View style={[styles.typePill, { backgroundColor: theme.accentSoft }]}>
              <Text style={[styles.typePillText, { color: theme.accent }]}>{review.reviewTypeLabel}</Text>
            </View>
          </View>
        ) : null}
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: spacing['2xl'],
  },
  card: {
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  reviewerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1, // Allows text truncation to work if the name is too long
  },
  reviewerAvatar: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
  },
  reviewerAvatarFallback: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerAvatarText: {
    ...typography.labelMd,
  },
  reviewerMeta: {
    flex: 1,
  },
  reviewerName: {
    ...typography.labelMd,
  },
  reviewerDate: {
    ...typography.caption,
    marginTop: spacing.xxs,
  },
  quoteBadge: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.xxs,
    marginBottom: spacing.sm,
  },
  reviewText: {
    ...typography.bodyMd,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  typePill: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  typePillText: {
    ...typography.labelSm,
  },
});