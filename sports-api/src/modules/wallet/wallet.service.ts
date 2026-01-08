import { db } from '../../config/database.js';
import { BadRequestError, NotFoundError } from '../../shared/errors/AppError.js';
import { verifyPassword } from '../../shared/utils/password.js';
import { generateRandomString } from '../../shared/utils/helpers.js';
import { addDecimals, subtractDecimals, isLessThan, toNumber } from '../../shared/utils/decimal.js';
import type {
  Wallet,
  Transaction,
  WalletResponse,
  DepositRequest,
  DepositResponse,
  WithdrawRequest,
  WithdrawResponse,
  TransactionHistoryQuery,
  TransactionHistoryResponse,
  PaymentCallbackRequest,
  TransactionStatus,
} from './wallet.types.js';

interface DbWallet {
  id: string;
  user_id: string;
  balance: string;
  bonus_balance: string;
  currency: string;
  created_at: Date;
  updated_at: Date;
}

interface DbTransaction {
  id: string;
  user_id: string;
  wallet_id: string;
  type: string;
  amount: string;
  balance_before: string;
  balance_after: string;
  status: string;
  payment_method: string | null;
  payment_provider: string | null;
  external_ref: string | null;
  metadata: Record<string, unknown> | null;
  created_at: Date;
}

interface DbUser {
  id: string;
  password_hash: string;
}

export class WalletService {
  private mapDbWalletToWallet(dbWallet: DbWallet): Wallet {
    return {
      id: dbWallet.id,
      userId: dbWallet.user_id,
      balance: toNumber(dbWallet.balance),
      bonusBalance: toNumber(dbWallet.bonus_balance),
      currency: dbWallet.currency,
      createdAt: dbWallet.created_at,
      updatedAt: dbWallet.updated_at,
    };
  }

  private mapDbTransactionToTransaction(dbTx: DbTransaction): Transaction {
    return {
      id: dbTx.id,
      userId: dbTx.user_id,
      walletId: dbTx.wallet_id,
      type: dbTx.type as Transaction['type'],
      amount: toNumber(dbTx.amount),
      balanceBefore: toNumber(dbTx.balance_before),
      balanceAfter: toNumber(dbTx.balance_after),
      status: dbTx.status as Transaction['status'],
      paymentMethod: dbTx.payment_method || undefined,
      paymentProvider: dbTx.payment_provider as Transaction['paymentProvider'],
      externalRef: dbTx.external_ref || undefined,
      metadata: dbTx.metadata || undefined,
      createdAt: dbTx.created_at,
    };
  }

  async getWallet(userId: string): Promise<WalletResponse> {
    const wallet = await db<DbWallet>('wallets')
      .where('user_id', userId)
      .first();

    if (!wallet) {
      // Create wallet if it doesn't exist
      const [newWallet] = await db('wallets')
        .insert({ user_id: userId })
        .returning('*') as DbWallet[];

      return {
        balance: toNumber(newWallet.balance),
        bonusBalance: toNumber(newWallet.bonus_balance),
        currency: newWallet.currency,
      };
    }

    return {
      balance: toNumber(wallet.balance),
      bonusBalance: toNumber(wallet.bonus_balance),
      currency: wallet.currency,
    };
  }

  async getTransactionHistory(
    userId: string,
    query: TransactionHistoryQuery
  ): Promise<TransactionHistoryResponse> {
    const baseQuery = db<DbTransaction>('transactions').where('user_id', userId);

    if (query.type) {
      baseQuery.where('type', query.type);
    }

    if (query.status) {
      baseQuery.where('status', query.status);
    }

    if (query.startDate) {
      baseQuery.where('created_at', '>=', query.startDate);
    }

    if (query.endDate) {
      baseQuery.where('created_at', '<=', query.endDate);
    }

    const countResult = await baseQuery.clone().count('id as count').first() as { count: string } | undefined;
    const total = parseInt(countResult?.count || '0', 10);

    const transactions = await baseQuery
      .orderBy('created_at', 'desc')
      .limit(query.limit || 20)
      .offset(query.offset || 0);

    return {
      transactions: transactions.map(this.mapDbTransactionToTransaction),
      total,
      limit: query.limit || 20,
      offset: query.offset || 0,
    };
  }

  async initiateDeposit(userId: string, request: DepositRequest): Promise<DepositResponse> {
    const wallet = await db<DbWallet>('wallets')
      .where('user_id', userId)
      .first();

    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }

    // Create pending transaction
    const externalRef = `DEP-${generateRandomString(12).toUpperCase()}`;

    const [transaction] = await db('transactions')
      .insert({
        user_id: userId,
        wallet_id: wallet.id,
        type: 'deposit',
        amount: request.amount.toString(),
        balance_before: wallet.balance,
        balance_after: wallet.balance, // Will be updated on callback
        status: 'pending',
        payment_method: 'mobile_money',
        payment_provider: request.paymentProvider,
        external_ref: externalRef,
        metadata: JSON.stringify({
          phoneNumber: request.phoneNumber,
          initiatedAt: new Date().toISOString(),
        }),
      })
      .returning('*') as DbTransaction[];

    // In production, this would call the actual payment provider API
    // For now, simulate the request
    await this.simulatePaymentProviderRequest(request.paymentProvider, {
      type: 'deposit',
      amount: request.amount,
      phoneNumber: request.phoneNumber,
      transactionId: transaction.id,
      externalRef,
    });

    return {
      transactionId: transaction.id,
      status: 'pending',
      message: `Deposit initiated. Please approve the payment on your ${request.paymentProvider.toUpperCase()} phone.`,
      externalRef,
    };
  }

  async initiateWithdrawal(userId: string, request: WithdrawRequest): Promise<WithdrawResponse> {
    // Verify password
    const user = await db<DbUser>('users')
      .where('id', userId)
      .first();

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const validPassword = await verifyPassword(request.password, user.password_hash);
    if (!validPassword) {
      throw new BadRequestError('Invalid password');
    }

    // Check for minimum withdrawal (could be from config)
    const minWithdrawal = 5;
    if (request.amount < minWithdrawal) {
      throw new BadRequestError(`Minimum withdrawal amount is ${minWithdrawal}`);
    }

    // Use transaction with row locking to prevent race conditions
    const result = await db.transaction(async (trx) => {
      // Lock the wallet row for update to prevent concurrent withdrawals
      const wallet = await trx<DbWallet>('wallets')
        .where('user_id', userId)
        .forUpdate()
        .first();

      if (!wallet) {
        throw new NotFoundError('Wallet not found');
      }

      // Check balance AFTER acquiring lock
      if (isLessThan(wallet.balance, request.amount)) {
        throw new BadRequestError(`Insufficient balance. Available: ${toNumber(wallet.balance).toFixed(2)}`);
      }

      // Deduct balance immediately for withdrawals using safe decimal math
      const newBalance = subtractDecimals(wallet.balance, request.amount);

      await trx('wallets')
        .where('id', wallet.id)
        .update({ balance: newBalance });

      const externalRef = `WD-${generateRandomString(12).toUpperCase()}`;

      // Create pending transaction
      const [transaction] = await trx('transactions')
        .insert({
          user_id: userId,
          wallet_id: wallet.id,
          type: 'withdrawal',
          amount: (-request.amount).toFixed(2),
          balance_before: wallet.balance,
          balance_after: newBalance,
          status: 'pending',
          payment_method: 'mobile_money',
          payment_provider: request.paymentProvider,
          external_ref: externalRef,
          metadata: JSON.stringify({
            phoneNumber: request.phoneNumber,
            initiatedAt: new Date().toISOString(),
          }),
        })
        .returning('*') as DbTransaction[];

      return { transaction, externalRef, newBalance };
    });

    // In production, this would call the actual payment provider API
    await this.simulatePaymentProviderRequest(request.paymentProvider, {
      type: 'withdrawal',
      amount: request.amount,
      phoneNumber: request.phoneNumber,
      transactionId: result.transaction.id,
      externalRef: result.externalRef,
    });

    return {
      transactionId: result.transaction.id,
      status: 'pending',
      message: `Withdrawal of ${request.amount} initiated. Funds will be sent to ${request.phoneNumber}.`,
    };
  }

  async getWithdrawalStatus(userId: string, transactionId: string): Promise<Transaction> {
    const transaction = await db<DbTransaction>('transactions')
      .where('id', transactionId)
      .where('user_id', userId)
      .where('type', 'withdrawal')
      .first();

    if (!transaction) {
      throw new NotFoundError('Withdrawal not found');
    }

    return this.mapDbTransactionToTransaction(transaction);
  }

  async handlePaymentCallback(request: PaymentCallbackRequest): Promise<void> {
    const newStatus: TransactionStatus = request.status === 'success' ? 'completed' : 'failed';

    await db.transaction(async (trx) => {
      // Lock the transaction row to prevent double-processing
      const transaction = await trx<DbTransaction>('transactions')
        .where('id', request.transactionId)
        .forUpdate()
        .first();

      if (!transaction) {
        throw new NotFoundError('Transaction not found');
      }

      // Re-check status after acquiring lock (idempotency)
      if (transaction.status !== 'pending') {
        // Already processed - return silently (idempotent)
        return;
      }

      if (transaction.type === 'deposit' && request.status === 'success') {
        // Credit wallet for successful deposits - lock wallet row too
        const wallet = await trx<DbWallet>('wallets')
          .where('id', transaction.wallet_id)
          .forUpdate()
          .first();

        if (wallet) {
          // Use safe decimal arithmetic
          const newBalance = addDecimals(wallet.balance, request.amount);

          await trx('wallets')
            .where('id', wallet.id)
            .update({ balance: newBalance });

          await trx('transactions')
            .where('id', transaction.id)
            .update({
              status: newStatus,
              balance_after: newBalance,
              metadata: JSON.stringify({
                ...transaction.metadata,
                completedAt: new Date().toISOString(),
                callbackData: request.metadata,
              }),
            });
        }
      } else if (transaction.type === 'withdrawal' && request.status === 'failed') {
        // Refund wallet for failed withdrawals - lock wallet row
        const wallet = await trx<DbWallet>('wallets')
          .where('id', transaction.wallet_id)
          .forUpdate()
          .first();

        if (wallet) {
          // Refund the absolute amount using safe decimal arithmetic
          const refundAmount = Math.abs(toNumber(transaction.amount));
          const newBalance = addDecimals(wallet.balance, refundAmount);

          await trx('wallets')
            .where('id', wallet.id)
            .update({ balance: newBalance });

          await trx('transactions')
            .where('id', transaction.id)
            .update({
              status: newStatus,
              metadata: JSON.stringify({
                ...transaction.metadata,
                failedAt: new Date().toISOString(),
                refunded: true,
                callbackData: request.metadata,
              }),
            });
        }
      } else {
        // Just update status for other cases
        await trx('transactions')
          .where('id', transaction.id)
          .update({
            status: newStatus,
            metadata: JSON.stringify({
              ...transaction.metadata,
              processedAt: new Date().toISOString(),
              callbackData: request.metadata,
            }),
          });
      }
    });
  }

  // Simulate payment provider request (stub for development)
  private async simulatePaymentProviderRequest(
    provider: string,
    data: {
      type: 'deposit' | 'withdrawal';
      amount: number;
      phoneNumber: string;
      transactionId: string;
      externalRef: string;
    }
  ): Promise<void> {
    // In production, this would make actual API calls to:
    // - MTN Mobile Money API
    // - Vodafone Cash API
    // - AirtelTigo Money API

    console.log(`[${provider.toUpperCase()}] ${data.type} request:`, {
      amount: data.amount,
      phone: data.phoneNumber,
      ref: data.externalRef,
    });

    // For development, auto-complete after a delay (simulating webhook)
    // In production, remove this and wait for actual webhook
    if (process.env.NODE_ENV === 'development') {
      setTimeout(async () => {
        try {
          await this.handlePaymentCallback({
            transactionId: data.transactionId,
            status: 'success',
            externalRef: data.externalRef,
            amount: data.amount,
            provider: provider as 'mtn' | 'vodafone' | 'airteltigo',
            metadata: { autoCompleted: true },
          });
          console.log(`[${provider.toUpperCase()}] Transaction ${data.transactionId} auto-completed`);
        } catch (error) {
          console.error(`[${provider.toUpperCase()}] Auto-complete failed:`, error);
        }
      }, 3000);
    }
  }
}

export const walletService = new WalletService();
