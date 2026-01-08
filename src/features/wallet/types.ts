export type TransactionType = 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus' | 'bonus_withdrawal' | 'cashout';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type PaymentProvider = 'mtn' | 'vodafone' | 'airteltigo';

export interface WalletBalance {
  balance: number;
  bonusBalance: number;
  currency: string;
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
  createdAt: string;
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

export const PAYMENT_PROVIDERS: { id: PaymentProvider; name: string; color: string }[] = [
  { id: 'mtn', name: 'MTN Mobile Money', color: '#FFCC00' },
  { id: 'vodafone', name: 'Vodafone Cash', color: '#E60000' },
  { id: 'airteltigo', name: 'AirtelTigo Money', color: '#ED1C24' },
];
