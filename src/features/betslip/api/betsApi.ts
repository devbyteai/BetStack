import { baseApi } from '@/store/api';
import type {
  Bet,
  PlaceBetRequest,
  PlaceBetResponse,
  BetHistoryQuery,
  BetHistoryResponse,
  CashoutRequest,
  CashoutResponse,
  BetValidationResult,
  BookingCode,
} from '../types';

export const betsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Place a bet
    placeBet: builder.mutation<PlaceBetResponse, PlaceBetRequest>({
      query: (body) => ({
        url: '/bets',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Wallet', 'BetHistory'],
    }),

    // Validate bet before placing
    validateBet: builder.mutation<BetValidationResult, PlaceBetRequest>({
      query: (body) => ({
        url: '/bets/validate',
        method: 'POST',
        body,
      }),
    }),

    // Get bet history
    getBetHistory: builder.query<BetHistoryResponse, BetHistoryQuery>({
      query: (params) => ({
        url: '/bets',
        params,
      }),
      providesTags: ['BetHistory'],
    }),

    // Get single bet
    getBet: builder.query<Bet, string>({
      query: (betId) => `/bets/${betId}`,
      providesTags: (_result, _error, betId) => [{ type: 'Bet', id: betId }],
    }),

    // Get bet by booking code
    getBetByBookingCode: builder.query<Bet, string>({
      query: (code) => `/bets/booking/${code}`,
    }),

    // Request cashout
    requestCashout: builder.mutation<CashoutResponse, { betId: string; request: CashoutRequest }>({
      query: ({ betId, request }) => ({
        url: `/bets/${betId}/cashout`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: (_result, _error, { betId }) => [
        { type: 'Bet', id: betId },
        'Wallet',
        'BetHistory',
      ],
    }),

    // Get cashout value
    getCashoutValue: builder.query<{ value: number }, string>({
      query: (betId) => `/bets/${betId}/cashout`,
    }),

    // Create booking (save betslip without placing)
    createBooking: builder.mutation<BookingCode, { selections: PlaceBetRequest['selections'] }>({
      query: (body) => ({
        url: '/bets/booking',
        method: 'POST',
        body,
      }),
    }),

    // Get temporary booking
    getBooking: builder.query<BookingCode, string>({
      query: (code) => `/bets/booking/temp/${code}`,
    }),
  }),
});

export const {
  usePlaceBetMutation,
  useValidateBetMutation,
  useGetBetHistoryQuery,
  useGetBetQuery,
  useGetBetByBookingCodeQuery,
  useRequestCashoutMutation,
  useGetCashoutValueQuery,
  useCreateBookingMutation,
  useGetBookingQuery,
} = betsApi;
