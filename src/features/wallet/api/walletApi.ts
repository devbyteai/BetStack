import { baseApi } from '@/store/api';
import type {
  WalletBalance,
  DepositRequest,
  DepositResponse,
  WithdrawRequest,
  WithdrawResponse,
  TransactionHistoryQuery,
  TransactionHistoryResponse,
  Transaction,
} from '../types';

export const walletApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get wallet balance
    getWallet: builder.query<WalletBalance, void>({
      query: () => '/wallet',
      providesTags: ['Wallet'],
    }),

    // Get transaction history
    getTransactionHistory: builder.query<TransactionHistoryResponse, TransactionHistoryQuery>({
      query: (params) => ({
        url: '/wallet/transactions',
        params,
      }),
      providesTags: ['Transactions'],
    }),

    // Initiate deposit
    initiateDeposit: builder.mutation<DepositResponse, DepositRequest>({
      query: (body) => ({
        url: '/wallet/deposit',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Wallet', 'Transactions'],
    }),

    // Initiate withdrawal
    initiateWithdrawal: builder.mutation<WithdrawResponse, WithdrawRequest>({
      query: (body) => ({
        url: '/wallet/withdraw',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Wallet', 'Transactions'],
    }),

    // Get withdrawal status
    getWithdrawalStatus: builder.query<Transaction, string>({
      query: (id) => `/wallet/withdraw/${id}`,
    }),
  }),
});

export const {
  useGetWalletQuery,
  useGetTransactionHistoryQuery,
  useInitiateDepositMutation,
  useInitiateWithdrawalMutation,
  useGetWithdrawalStatusQuery,
} = walletApi;
