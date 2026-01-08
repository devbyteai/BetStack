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
  createdAt: Date;
}

export interface UserBonus {
  id: string;
  userId: string;
  bonusId: string;
  amount: number;
  wageredAmount: number;
  requiredWagering: number;
  status: UserBonusStatus;
  expiresAt: Date | null;
  createdAt: Date;
  bonus?: Bonus;
}

export interface FreeBet {
  id: string;
  userId: string;
  amount: number;
  minOdds: number;
  expiresAt: Date | null;
  isUsed: boolean;
  usedBetId: string | null;
  createdAt: Date;
}

export interface ClaimBonusRequest {
  bonusId: string;
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
