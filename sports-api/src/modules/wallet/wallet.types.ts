export type TransactionType = 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus' | 'bonus_withdrawal' | 'cashout';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type PaymentProvider = 'mtn' | 'vodafone' | 'airteltigo';

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  bonusBalance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: TransactionStatus;
  paymentMethod?: string;
  paymentProvider?: PaymentProvider;
  externalRef?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface WalletResponse {
  balance: number;
  bonusBalance: number;
  currency: string;
}

export interface DepositRequest {
  amount: number;
  paymentProvider: PaymentProvider;
  phoneNumber: string;
}

export interface DepositResponse {
  transactionId: string;
  status: TransactionStatus;
  message: string;
  externalRef?: string;
}

export interface WithdrawRequest {
  amount: number;
  paymentProvider: PaymentProvider;
  phoneNumber: string;
  password: string;
}

export interface WithdrawResponse {
  transactionId: string;
  status: TransactionStatus;
  message: string;
}

export interface TransactionHistoryQuery {
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface TransactionHistoryResponse {
  transactions: Transaction[];
  total: number;
  limit: number;
  offset: number;
}

export interface PaymentCallbackRequest {
  transactionId: string;
  status: 'success' | 'failed';
  externalRef: string;
  amount: number;
  provider: PaymentProvider;
  metadata?: Record<string, unknown>;
}
