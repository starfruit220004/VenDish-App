import React from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { getTheme, spacing, typography } from '../../../constants/theme';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
};

export default function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.headingLg,
  },
  subtitle: {
    ...typography.bodySm,
    marginTop: spacing.xxs,
  },
});