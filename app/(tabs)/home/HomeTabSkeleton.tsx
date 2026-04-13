import React from 'react';
import { ScrollView, StyleSheet, useColorScheme, View } from 'react-native';
import { getTheme, layout, radii, spacing } from '../../../constants/theme';

function SkeletonBlock({ height, width = '100%', style }: { height: number; width?: number | string; style?: object }) {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);

  return (
    <View
      style={[
        {
          width,
          height,
          backgroundColor: theme.surfaceElevated,
          borderRadius: radii.md,
        },
        style,
      ]}
    />
  );
}

function ProductSectionSkeleton() {
  return (
    <View style={styles.sectionWrap}>
      <SkeletonBlock height={24} width="42%" />
      <SkeletonBlock height={14} width="68%" style={{ marginTop: spacing.sm, marginBottom: spacing.md }} />

      <SkeletonBlock height={112} style={{ marginBottom: spacing.md }} />
      <SkeletonBlock height={112} />
    </View>
  );
}

export default function HomeTabSkeleton() {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? theme.background : 'transparent' }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <SkeletonBlock height={196} style={{ borderRadius: radii.xl, marginBottom: spacing['2xl'] }} />

      <ProductSectionSkeleton />
      <ProductSectionSkeleton />

      <View style={styles.sectionWrap}>
        <SkeletonBlock height={24} width="48%" />
        <SkeletonBlock height={14} width="72%" style={{ marginTop: spacing.sm, marginBottom: spacing.md }} />
        <SkeletonBlock height={156} style={{ borderRadius: radii.xl }} />
      </View>

      <View style={styles.sectionWrap}>
        <SkeletonBlock height={24} width="42%" />
        <SkeletonBlock height={14} width="68%" style={{ marginTop: spacing.sm, marginBottom: spacing.md }} />
        <SkeletonBlock height={148} style={{ marginBottom: spacing.md, borderRadius: radii.xl }} />
        <SkeletonBlock height={148} style={{ borderRadius: radii.xl }} />
      </View>

      <SkeletonBlock height={182} style={{ borderRadius: radii.xl, marginBottom: spacing['4xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lg,
  },
  sectionWrap: {
    marginBottom: spacing['2xl'],
  },
});