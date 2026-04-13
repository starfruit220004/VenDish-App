import React from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BusinessDetails } from './types';
import { getTheme, radii, spacing, typography } from '../../../constants/theme';

type BusinessFooterSectionProps = {
  details: BusinessDetails;
};

type InfoRowProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);

  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color={theme.accent} />
      <Text style={[styles.infoLabel, { color: theme.textMuted }]}>{label}:</Text>
      <Text style={[styles.infoValue, { color: theme.textPrimary }]}>{value}</Text>
    </View>
  );
}

export default function BusinessFooterSection({ details }: BusinessFooterSectionProps) {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);

  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}> 
      <Text style={[styles.brand, { color: theme.accentText }]}>Kuya Vince Carenderia</Text>

      <InfoRow icon="mail-outline" label="Email" value={details.email} />
      <InfoRow icon="call-outline" label="Phone" value={details.phone} />
      <InfoRow icon="location-outline" label="Location" value={details.location} />
      <InfoRow icon="time-outline" label="Hours" value={details.operatingHours} />

      <Text style={[styles.copy, { color: theme.textDisabled }]}>
        {new Date().getFullYear()} Kuya Vince Carenderia. All rights reserved.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    marginTop: spacing.sm,
    marginBottom: spacing['4xl'],
  },
  brand: {
    ...typography.headingMd,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  infoLabel: {
    ...typography.labelMd,
  },
  infoValue: {
    ...typography.bodySm,
    flex: 1,
  },
  copy: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});