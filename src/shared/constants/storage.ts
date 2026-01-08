export const STORAGE_KEYS = {
  // Auth
  ACCESS_TOKEN: '@betting/access_token',
  REFRESH_TOKEN: '@betting/refresh_token',
  USER: '@betting/user',

  // Settings
  ODDS_FORMAT: '@betting/odds_format',
  LANGUAGE: '@betting/language',
  NOTIFICATIONS_ENABLED: '@betting/notifications_enabled',
  SOUND_ENABLED: '@betting/sound_enabled',
  AUTO_ACCEPT_ODDS: '@betting/auto_accept_odds',
  THEME: '@betting/theme',

  // Betslip
  BETSLIP: '@betting/betslip',
  BOOKING_CODES: '@betting/booking_codes',

  // Cache
  RECENTLY_OPENED_GAMES: '@betting/recently_opened_games',
  FAVORITES: '@betting/favorites',

  // App state
  ONBOARDING_COMPLETED: '@betting/onboarding_completed',
  LAST_SYNC_TIME: '@betting/last_sync_time',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
