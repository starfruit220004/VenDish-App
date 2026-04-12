import React, { PropsWithChildren } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getTheme } from '../../constants/theme';

export const TAB_LIGHT_GRADIENT_COLORS = ['#FFFFFF', '#FEE2E2', '#FFFFFF'] as const;

export default function TabScreenBackground({ children }: PropsWithChildren) {
  const isDark = useColorScheme() === 'dark';
  const theme = getTheme(isDark);

  if (isDark) {
    return <View style={[styles.container, { backgroundColor: theme.background }]}>{children}</View>;
  }

  return (
    <LinearGradient
      colors={TAB_LIGHT_GRADIENT_COLORS}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});