/**
 * VenDish Design System — 2026 Edition
 * ──────────────────────────────────────
 * Centralized design tokens for consistent, premium UI.
 * Based on an 8pt grid, fluid typography scale, and WCAG 2.2+ contrast ratios.
 */

import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── 8pt Spacing Scale ────────────────────────────────────────────────────────
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

// ─── Typography Scale (Modular — Major Third 1.25) ───────────────────────────
export const typography = {
  // Display
  displayLg: { fontSize: 36, lineHeight: 44, fontWeight: '800' as const, letterSpacing: -0.5 },
  displayMd: { fontSize: 30, lineHeight: 38, fontWeight: '700' as const, letterSpacing: -0.3 },
  displaySm: { fontSize: 26, lineHeight: 34, fontWeight: '700' as const, letterSpacing: -0.2 },

  // Headings
  headingLg: { fontSize: 22, lineHeight: 30, fontWeight: '700' as const },
  headingMd: { fontSize: 18, lineHeight: 26, fontWeight: '600' as const },
  headingSm: { fontSize: 16, lineHeight: 22, fontWeight: '600' as const },

  // Body
  bodyLg: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyMd: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  bodySm: { fontSize: 12, lineHeight: 18, fontWeight: '400' as const },

  // Labels / Caps
  labelLg: { fontSize: 16, lineHeight: 18, fontWeight: '600' as const },
  labelMd: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const },
  labelSm: { fontSize: 10, lineHeight: 14, fontWeight: '700' as const, letterSpacing: 0.5 },

  // Caption
  caption: { fontSize: 13, lineHeight: 15, fontWeight: '500' as const },
} as const;

// ─── Color Palette ────────────────────────────────────────────────────────────
// Light mode: warm neutral + deep crimson accent
// Dark mode: rich charcoal + vibrant coral accent
export const palette = {
  // Brand
  crimson: '#C62828',       // Primary accent — deeper, richer red
  crimsonLight: '#EF5350',  // Light mode hover / active state
  coral: '#FF6B6B',         // Dark mode primary accent (higher contrast)
  coralSoft: '#FF8A80',     // Dark mode secondary

  // Neutrals – Light
  white: '#FFFFFF',
  cream: '#FAFAF8',         // Main background (warm white, not pink)
  sand: '#F5F3F0',          // Secondary background / card surface
  mist: '#EEECE9',          // Borders, dividers
  stone: '#C4C0BA',         // Disabled / placeholder
  slate: '#8A8580',         // Secondary text
  charcoal: '#4A4540',      // Primary text
  ink: '#1A1815',           // Heading text

  // Neutrals – Dark
  darkBg: '#0C0C0E',         // Main background (rich black, not pure)
  darkSurface: '#1A1A1E',    // Card surface
  darkElevated: '#242428',   // Elevated surface / inputs
  darkBorder: '#2E2E34',     // Borders
  darkMuted: '#6E6E78',      // Muted text
  darkSecondary: '#A0A0AA',  // Secondary text
  darkPrimary: '#EAEAEE',    // Primary text

  // Semantic
  success: '#2E7D32',
  successSoft: '#E8F5E9',
  warning: '#F57C00',
  warningSoft: '#FFF3E0',
  error: '#D32F2F',
  errorSoft: '#FFEBEE',
  info: '#1565C0',
  infoSoft: '#E3F2FD',

  // Accent
  gold: '#FFB300',
  goldSoft: 'rgba(255,179,0,0.15)',
} as const;

// ─── Semantic Themes ──────────────────────────────────────────────────────────
export const lightTheme = {
  background: palette.cream,
  surface: palette.white,
  surfaceElevated: palette.sand,
  border: palette.mist,
  borderSubtle: 'rgba(0,0,0,0.06)',

  textPrimary: palette.ink,
  textSecondary: palette.charcoal,
  textMuted: palette.slate,
  textDisabled: palette.stone,

  accent: palette.crimson,
  accentSoft: 'rgba(198,40,40,0.08)',
  accentText: palette.crimson,

  statusBar: palette.crimson,
  headerBg: palette.crimson,
  tabBarBg: palette.white,
  tabBarBorder: palette.mist,
  tabBarActive: palette.crimson,
  tabBarInactive: palette.slate,

  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardShadowHeavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  modalOverlay: 'rgba(0,0,0,0.4)',
} as const;

export const darkTheme = {
  background: palette.darkBg,
  surface: palette.darkSurface,
  surfaceElevated: palette.darkElevated,
  border: palette.darkBorder,
  borderSubtle: 'rgba(255,255,255,0.06)',

  textPrimary: palette.darkPrimary,
  textSecondary: palette.darkSecondary,
  textMuted: palette.darkMuted,
  textDisabled: '#4A4A52',

  accent: palette.coral,
  accentSoft: 'rgba(255,107,107,0.12)',
  accentText: palette.coral,

  statusBar: palette.darkSurface,
  headerBg: palette.darkSurface,
  tabBarBg: palette.darkSurface,
  tabBarBorder: palette.darkBorder,
  tabBarActive: palette.coral,
  tabBarInactive: palette.darkMuted,

  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  cardShadowHeavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  modalOverlay: 'rgba(0,0,0,0.7)',
} as const;

// ─── Theme Hook Helper ────────────────────────────────────────────────────────
export type AppTheme = typeof lightTheme | typeof darkTheme;

export function getTheme(isDark: boolean): AppTheme {
  return isDark ? darkTheme : lightTheme;
}

// ─── Border Radius Scale ──────────────────────────────────────────────────────
export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

// ─── Common Layout Constants ──────────────────────────────────────────────────
export const layout = {
  screenPadding: spacing.lg,
  cardPadding: spacing.lg,
  sectionGap: spacing['2xl'],
  tabBarHeight: Platform.OS === 'ios' ? 84 : 80,
  headerHeight: 56,
  cardWidth: (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2, // 2-col grid
} as const;
