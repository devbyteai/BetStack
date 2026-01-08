// WebSocket Event Types

export type SubscriptionType = 'sport' | 'game' | 'live' | 'user';

export interface SubscriptionData {
  type: SubscriptionType;
  id: number | string;
}

// Odds update from server
export interface OddsUpdateData {
  eventId: string;
  marketId: string;
  gameId: string;
  price: number;
  previousPrice: number;
  direction: 'up' | 'down' | 'same';
}

// Game status update
export interface GameStatusData {
  gameId: string;
  isLive: boolean;
  info: {
    score1?: number;
    score2?: number;
    currentPeriod?: string;
    currentTime?: string;
    stats?: Record<string, unknown>;
  };
}

// Market suspension
export interface MarketSuspendData {
  marketId: string;
  gameId: string;
  isSuspended: boolean;
}

// Bet updates
export type BetStatus = 'pending' | 'won' | 'lost' | 'cashout' | 'cancelled' | 'returned';

export interface BetPlacedData {
  betId: string;
  bookingCode: string;
  status: string;
}

export interface BetSettledData {
  betId: string;
  status: BetStatus;
  payout?: number;
}

// Cashout updates
export interface CashoutUpdateData {
  betId: string;
  currentValue: number;
}

export interface CashoutResultData {
  betId: string;
  amount: number;
  success: boolean;
}

// Balance update
export interface BalanceUpdateData {
  balance: number;
  bonusBalance: number;
}

// Subscription acknowledgements
export interface SubscriptionAckData {
  room: string;
}

// Error from server
export interface WSErrorData {
  message: string;
  code?: string;
}

// WebSocket event names
export const WS_EVENTS = {
  // Client -> Server
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
  PING: 'ping',

  // Server -> Client
  SUBSCRIBED: 'subscribed',
  UNSUBSCRIBED: 'unsubscribed',
  PONG: 'pong',
  ERROR: 'error',

  // Live betting
  ODDS_UPDATE: 'odds:update',
  ODDS_UPDATE_BATCH: 'odds:update:batch',
  GAME_STATUS: 'game:status',
  GAME_START: 'game:start',
  GAME_END: 'game:end',
  MARKET_SUSPEND: 'market:suspend',

  // User-specific
  BET_PLACED: 'bet:placed',
  BET_SETTLED: 'bet:settled',
  CASHOUT_UPDATE: 'cashout:update',
  CASHOUT_RESULT: 'cashout:result',
  BALANCE_UPDATE: 'balance:update',
} as const;
