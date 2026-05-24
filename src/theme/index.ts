export type ThemeMode = 'light' | 'dark';

export interface ColorsType {
  background: string;
  surface: string;
  surfaceAlt: string;
  header: string;
  nav: string;
  navBorder: string;
  primary: string;
  primaryDark: string;
  primaryShadow: string;
  gold: string;
  goldLight: string;
  missing: string;
  missingBorder: string;
  missingText: string;
  ownedBg: string;
  ownedBorder: string;
  ownedText: string;
  specialMissingBg: string;
  specialMissingBorder: string;
  specialMissingText: string;
  badge: string;
  badgeText: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  overlay: string;
  handle: string;
  tabActiveTint: string;
  tabInactiveTint: string;
  progressTrack: string;
  progressFill: string;
}

export const LightColors: ColorsType = {
  background: '#F0F4F8',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  header: '#0F172A',
  nav: '#FFFFFF',
  navBorder: '#E2E8F0',
  primary: '#10B981',
  primaryDark: '#059669',
  primaryShadow: 'rgba(16,185,129,0.3)',
  gold: '#D97706',
  goldLight: '#FEF3C7',
  missing: '#F8FAFC',
  missingBorder: '#CBD5E1',
  missingText: '#94A3B8',
  ownedBg: '#ECFDF5',
  ownedBorder: '#34D399',
  ownedText: '#065F46',
  specialMissingBg: '#FFFBEB',
  specialMissingBorder: '#FDE68A',
  specialMissingText: '#B45309',
  badge: '#F43F5E',
  badgeText: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  overlay: 'rgba(0,0,0,0.5)',
  handle: '#CBD5E1',
  tabActiveTint: '#10B981',
  tabInactiveTint: '#94A3B8',
  progressTrack: 'rgba(255,255,255,0.25)',
  progressFill: '#D97706',
};

export const DarkColors: ColorsType = {
  background: '#0B0F19',
  surface: '#161F32',
  surfaceAlt: '#1E293B',
  header: '#0E1524',
  nav: '#0E1524',
  navBorder: '#1E293B',
  primary: '#10B981',
  primaryDark: '#059669',
  primaryShadow: 'rgba(16,185,129,0.2)',
  gold: '#FBBF24',
  goldLight: '#451A03',
  missing: '#0F172A',
  missingBorder: '#1E293B',
  missingText: '#334155',
  ownedBg: '#022C22',
  ownedBorder: '#10B981',
  ownedText: '#34D399',
  specialMissingBg: '#1C1205',
  specialMissingBorder: '#78350F',
  specialMissingText: '#D97706',
  badge: '#F43F5E',
  badgeText: '#FFFFFF',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#475569',
  overlay: 'rgba(0,0,0,0.7)',
  handle: '#334155',
  tabActiveTint: '#10B981',
  tabInactiveTint: '#475569',
  progressTrack: 'rgba(255,255,255,0.15)',
  progressFill: '#FBBF24',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 999,
};
