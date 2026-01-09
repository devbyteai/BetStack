export type BetType = 'single' | 'multiple' | 'system' | 'chain';
export type BetStatus = 'pending' | 'won' | 'lost' | 'cashout' | 'cancelled' | 'returned';
export type SelectionOutcome = 'pending' | 'won' | 'lost' | 'returned';
export type BalanceSource = 'main_balance' | 'bonus_balance';
export type OddsAcceptance = 'none' | 'higher' | 'any';

export interface BetSelection {
  id: string;
  gameId: string;
  marketId: string;
  eventId: string;
  sportAlias: string;
  team1Name: string;
  team2Name: string;
  competitionName: string;
  marketName: string;
  eventName: string;
  odds: number;
  initialOdds: number;
  isLive: boolean;
  isSuspended: boolean;
  gameStartTime?: string;
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
  settledAt?: string;
  createdAt: string;
  selections: BetSelectionResult[];
}

export interface BetSelectionResult {
  id: string;
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
}

export interface PlaceBetRequest {
  betType: BetType;
  systemVariant?: string;
  stake: number;
  selections: {
    gameId: string;
    marketId: string;
    eventId: string;
    odds: number;
    isLive?: boolean;
  }[];
  acceptOddsChanges?: OddsAcceptance;
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

export interface BetValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  totalOdds: number;
  potentialWin: number;
  bonusPercent: number;
}

export interface BookingCode {
  bookingCode: string;
  selections: PlaceBetRequest['selections'];
  totalOdds: number;
  expiresAt: string;
}

export interface BetslipState {
  selections: BetSelection[];
  betType: BetType;
  systemVariant?: string;
  stakes: Record<string, number>; // selectionId -> stake (for singles)
  totalStake: number; // For multiples
  oddsAcceptance: OddsAcceptance;
  source: BalanceSource;
  freeBetId?: string;
  isOpen: boolean;
  isPlacing: boolean;
  error: string | null;
  lastBookingCode?: string;
  // Quick Bet state
  quickBetEnabled: boolean;
  quickBetStake: number;
  quickBetSelection: BetSelection | null;
  isQuickBetDialogOpen: boolean;
  // Auto-Cashout state
  autoCashoutEnabled: boolean;
  autoCashoutValue: number | null;
  // Persistence state
  savedAt: number | null; // Timestamp when betslip was last saved
}

// Quick bet preset stakes (GHS)
export const QUICK_BET_PRESETS = [5, 10, 20, 50, 100] as const;
