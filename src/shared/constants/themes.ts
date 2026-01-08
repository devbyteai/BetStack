/**
 * Theme definitions for the app
 * Contains color palettes for both dark and light modes
 */

// Dark theme colors (current default)
export const DARK_COLORS = {
  // Primary
  primary: '#1E88E5',
  primaryDark: '#1565C0',
  primaryLight: '#42A5F5',
  primaryAlpha10: 'rgba(30, 136, 229, 0.1)',
  primaryAlpha20: 'rgba(30, 136, 229, 0.2)',

  // Secondary
  secondary: '#FF9800',
  secondaryDark: '#F57C00',
  secondaryLight: '#FFB74D',

  // Background
  background: '#121212',
  backgroundLight: '#1E1E1E',
  backgroundCard: '#252525',
  backgroundInput: '#1A1A1A',
  surface: '#1E1E1E',
  surfaceLight: '#2A2A2A',

  // Text
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textMuted: '#757575',
  textDisabled: '#666666',
  textInverse: '#000000',
  textOnPrimary: '#FFFFFF',

  // Status
  success: '#4CAF50',
  successDark: '#388E3C',
  error: '#F44336',
  errorDark: '#D32F2F',
  warning: '#FF9800',
  info: '#2196F3',

  // Betting specific
  oddsUp: '#4CAF50',
  oddsDown: '#F44336',
  oddsSuspended: '#757575',
  selectionActive: '#1E88E5',
  selectionWon: '#4CAF50',
  selectionLost: '#F44336',

  // Sport colors (same for both themes)
  sports: {
    soccer: '#4CAF50',
    basketball: '#FF9800',
    tennis: '#FFEB3B',
    icehockey: '#03A9F4',
    volleyball: '#9C27B0',
    baseball: '#795548',
    americanfootball: '#8D6E63',
    handball: '#E91E63',
    boxing: '#F44336',
    mma: '#F44336',
    esports: '#9C27B0',
    rugby: '#795548',
    cricket: '#8BC34A',
    darts: '#607D8B',
    snooker: '#388E3C',
    tabletennis: '#FF5722',
    badminton: '#00BCD4',
    cycling: '#FFC107',
    motorsport: '#F44336',
    golf: '#4CAF50',
  },

  // Border
  border: '#333333',
  borderLight: '#444444',
  divider: '#2A2A2A',

  // Transparent
  overlay: 'rgba(0, 0, 0, 0.5)',
  ripple: 'rgba(255, 255, 255, 0.1)',
} as const;

// Light theme colors
export const LIGHT_COLORS = {
  // Primary (keep same for brand consistency)
  primary: '#1E88E5',
  primaryDark: '#1565C0',
  primaryLight: '#42A5F5',
  primaryAlpha10: 'rgba(30, 136, 229, 0.1)',
  primaryAlpha20: 'rgba(30, 136, 229, 0.2)',

  // Secondary
  secondary: '#FF9800',
  secondaryDark: '#F57C00',
  secondaryLight: '#FFB74D',

  // Background
  background: '#F5F5F5',
  backgroundLight: '#FFFFFF',
  backgroundCard: '#FFFFFF',
  backgroundInput: '#EEEEEE',
  surface: '#FFFFFF',
  surfaceLight: '#FAFAFA',

  // Text
  text: '#212121',
  textSecondary: '#757575',
  textMuted: '#9E9E9E',
  textDisabled: '#BDBDBD',
  textInverse: '#FFFFFF',
  textOnPrimary: '#FFFFFF',

  // Status
  success: '#4CAF50',
  successDark: '#388E3C',
  error: '#F44336',
  errorDark: '#D32F2F',
  warning: '#FF9800',
  info: '#2196F3',

  // Betting specific
  oddsUp: '#4CAF50',
  oddsDown: '#F44336',
  oddsSuspended: '#9E9E9E',
  selectionActive: '#1E88E5',
  selectionWon: '#4CAF50',
  selectionLost: '#F44336',

  // Sport colors (same for both themes)
  sports: {
    soccer: '#4CAF50',
    basketball: '#FF9800',
    tennis: '#FFEB3B',
    icehockey: '#03A9F4',
    volleyball: '#9C27B0',
    baseball: '#795548',
    americanfootball: '#8D6E63',
    handball: '#E91E63',
    boxing: '#F44336',
    mma: '#F44336',
    esports: '#9C27B0',
    rugby: '#795548',
    cricket: '#8BC34A',
    darts: '#607D8B',
    snooker: '#388E3C',
    tabletennis: '#FF5722',
    badminton: '#00BCD4',
    cycling: '#FFC107',
    motorsport: '#F44336',
    golf: '#4CAF50',
  },

  // Border
  border: '#E0E0E0',
  borderLight: '#EEEEEE',
  divider: '#E0E0E0',

  // Transparent
  overlay: 'rgba(0, 0, 0, 0.3)',
  ripple: 'rgba(0, 0, 0, 0.1)',
} as const;

export type ThemeColors = typeof DARK_COLORS;
export type ThemeMode = 'dark' | 'light' | 'system';
