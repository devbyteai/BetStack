export const COLORS = {
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

  // Sport colors
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

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  xxxl: 32,
} as const;

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
} as const;

export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;
