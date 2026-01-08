export type BonusType = 'welcome' | 'deposit' | 'free_bet' | 'cashback';
export type UserBonusStatus = 'active' | 'completed' | 'expired' | 'cancelled';

export interface Bonus {
  id: string;
  name: string;
  description: string | null;
  type: BonusType;
  amount: number | null;
  percentage: number | null;
  minDeposit: number | null;
  minOdds: number | null;
  wageringRequirement: number;
  expiresDays: number;
  isActive: boolean;
  createdAt: string;
}

export interface UserBonus {
  id: string;
  userId: string;
  bonusId: string;
  amount: number;
  wageredAmount: number;
  requiredWagering: number;
  status: UserBonusStatus;
  expiresAt: string | null;
  createdAt: string;
  bonus?: Bonus;
}

export interface FreeBet {
  id: string;
  userId: string;
  amount: number;
  minOdds: number;
  expiresAt: string | null;
  isUsed: boolean;
  usedBetId: string | null;
  createdAt: string;
}

export interface BonusListQuery {
  type?: BonusType;
  limit?: number;
  offset?: number;
}

export interface BonusListResponse {
  bonuses: Bonus[];
  total: number;
  limit: number;
  offset: number;
}

export interface UserBonusListResponse {
  bonuses: UserBonus[];
  total: number;
}

export interface FreeBetListResponse {
  freeBets: FreeBet[];
  total: number;
}

export const BONUS_TYPE_LABELS: Record<BonusType, string> = {
  welcome: 'Welcome Bonus',
  deposit: 'Deposit Bonus',
  free_bet: 'Free Bet',
  cashback: 'Cashback',
};

export const BONUS_TYPE_COLORS: Record<BonusType, string> = {
  welcome: '#4CAF50',
  deposit: '#2196F3',
  free_bet: '#FF9800',
  cashback: '#9C27B0',
};

export const USER_BONUS_STATUS_LABELS: Record<UserBonusStatus, string> = {
  active: 'Active',
  completed: 'Completed',
  expired: 'Expired',
  cancelled: 'Cancelled',
};
