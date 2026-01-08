// Common types used across the application

export interface PaginationParams {
  page?: number;
  perPage?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    perPage?: number;
    total?: number;
    totalPages?: number;
  };
}

// User related types
export interface UserBase {
  id: string;
  mobileNumber: string;
  dialingCode: string;
  email?: string;
  nickname?: string;
  firstName?: string;
  lastName?: string;
}

// Betting related types
export type BetType = 'single' | 'multiple' | 'system' | 'chain';
export type BetStatus = 'pending' | 'won' | 'lost' | 'cashout' | 'cancelled' | 'returned';
export type SelectionOutcome = 'pending' | 'won' | 'lost' | 'returned';

export type OddsFormat = 'decimal' | 'fractional' | 'american' | 'hongkong' | 'malay' | 'indonesian';

// Transaction types
export type TransactionType = 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus' | 'bonus_withdrawal' | 'cashout';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type PaymentProvider = 'mtn' | 'vodafone' | 'airteltigo';

// Bonus types
export type BonusType = 'welcome' | 'deposit' | 'free_bet' | 'cashback';
export type BonusStatus = 'active' | 'completed' | 'expired' | 'cancelled';
