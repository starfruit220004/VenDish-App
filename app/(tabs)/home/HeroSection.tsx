import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTheme, radii, spacing, typography } from '../../../constants/theme';

type HeroSectionProps = {
  isLoggedIn: boolean;
  displayName: string;
  onLoginPress: () => void;
  onSignupPress: () => void;
  onBrowseMenuPress: () => void;
};

export default function HeroSection({
  isLoggedIn,
  displayName,
  onLoginPress,
  onSignupPress,
  onBrowseMenuPress,
}: HeroSectionProps) {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }, theme.cardShadow]}>
      <View style={[styles.iconWrap, { backgroundColor: theme.accentSoft }]}>
        <Ionicons name={isLoggedIn ? 'sparkles' : 'restaurant'} size={24} color={theme.accent} />
      </View>

      {isLoggedIn ? (
        <>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Welcome back, {displayName}</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>Fresh dishes and new promos are ready for you today.</Text>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.accent }]}
            onPress={onBrowseMenuPress}
            activeOpacity={0.88}
          >
            <Ionicons name="restaurant-outline" size={18} color="#FFF" />
            <Text style={styles.primaryButtonText}>Browse Menu</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Welcome to VenDish</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>Discover best sellers, top-rated dishes, and exclusive promos all in one place.</Text>
          <View style={styles.ctaRow}>
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: theme.accent }]}
              onPress={onLoginPress}
              activeOpacity={0.88}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>Log In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.accent, flex: 1 }]}
              onPress={onSignupPress}
              activeOpacity={0.88}
            >
              <Ionicons name="rocket-outline" size={18} color="#FFF" />
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.headingLg,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMd,
    marginBottom: spacing.lg,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  primaryButton: {
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  primaryButtonText: {
    color: '#FFF',
    ...typography.labelLg,
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    ...typography.labelLg,
  },
});