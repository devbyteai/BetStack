// ============================================
// PRODUCTION CONFIGURATION - MUST BE SET BEFORE RELEASE
// ============================================
// Replace these with your actual production URLs before building for release
const PRODUCTION_API_DOMAIN = 'api.yourdomain.com'; // TODO: Set your production API domain
const PRODUCTION_API_URL = `https://${PRODUCTION_API_DOMAIN}/api/v1`;
const PRODUCTION_WS_URL = `wss://${PRODUCTION_API_DOMAIN}`;

// Development URLs (Android emulator uses 10.0.2.2 to reach host machine)
// For iOS simulator, use 'localhost' instead of '10.0.2.2'
const DEV_API_URL = 'http://10.0.2.2:3000/api/v1';
const DEV_WS_URL = 'ws://10.0.2.2:3000';

// Environment-based URL selection
export const API_BASE_URL = __DEV__ ? DEV_API_URL : PRODUCTION_API_URL;
export const WS_URL = __DEV__ ? DEV_WS_URL : PRODUCTION_WS_URL;

export const APP_CONFIG = {
  MIN_BET_AMOUNT: 1,
  MAX_BET_AMOUNT: 100000,
  MAX_SELECTIONS_IN_MULTIPLE: 16,
  MAX_ODDS_FOR_MULTIPLE: 10000,
  BOOKING_CODE_EXPIRY_HOURS: 72,
};

export const ODDS_FORMATS = {
  DECIMAL: 'decimal',
  FRACTIONAL: 'fractional',
  AMERICAN: 'american',
  HONGKONG: 'hongkong',
  MALAY: 'malay',
  INDONESIAN: 'indonesian',
} as const;

export type OddsFormat = (typeof ODDS_FORMATS)[keyof typeof ODDS_FORMATS];
