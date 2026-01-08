export type BetType = 'single' | 'multiple' | 'system' | 'chain';
export type BetStatus = 'pending' | 'won' | 'lost' | 'cashout' | 'cancelled' | 'returned';
export type SelectionOutcome = 'pending' | 'won' | 'lost' | 'returned';
export type BalanceSource = 'main_balance' | 'bonus_balance';

export interface BetSelection {
  id: string;
  betId: string;
  gameId: string;
  marketId: string;
  eventId: string;
  sportAlias: string;
  team1Name: string;
  team2Name: string;
  marketName: string;
  eventName: string;
  oddsAtPlacement: number;
  outcome: SelectionOutcome;
  isLive: boolean;
  createdAt: Date;
}

export interface Bet {
  id: string;
  userId: string;
  betType: BetType;
  systemVariant?: string;
  stake: number;
  totalOdds: number;
  potentialWin: number;
  status: BetStatus;
  payout?: number;
  source: BalanceSource;
  bookingCode?: string;
  cashoutAmount?: number;
  autoCashoutValue?: number;
  settledAt?: Date;
  createdAt: Date;
  selections?: BetSelection[];
}

export interface PlaceBetSelection {
  gameId: string;
  marketId: string;
  eventId: string;
  odds: number;
  isLive?: boolean;
}

export interface PlaceBetRequest {
  betType: BetType;
  systemVariant?: string;
  stake: number;
  selections: PlaceBetSelection[];
  acceptOddsChanges?: 'none' | 'higher' | 'any';
  source?: BalanceSource;
  freeBetId?: string;
  autoCashoutValue?: number;
}

export interface PlaceBetResponse {
  bet: Bet;
  bookingCode: string;
}

export interface BetHistoryQuery {
  status?: BetStatus;
  betType?: BetType;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface BetHistoryResponse {
  bets: Bet[];
  total: number;
  limit: number;
  offset: number;
}

export interface CashoutRequest {
  amount?: number;
  type: 'full' | 'partial';
}

export interface CashoutResponse {
  success: boolean;
  amount: number;
  newBalance: number;
}

export interface BookingCodeResponse {
  bookingCode: string;
  selections: PlaceBetSelection[];
  totalOdds: number;
  expiresAt: Date;
}

export interface BettingRule {
  id: number;
  betType: BetType;
  minSelections: number;
  maxSelections: number;
  bonusPercent: number;
  minOdds: number;
  ignoreLowOdds: boolean;
  isActive: boolean;
}

export interface BetValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  totalOdds: number;
  potentialWin: number;
  bonusPercent: number;
}
