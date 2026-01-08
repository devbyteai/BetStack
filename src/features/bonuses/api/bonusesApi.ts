import { baseApi } from '@/store/api';
import type {
  Bonus,
  BonusListQuery,
  BonusListResponse,
  UserBonus,
  UserBonusListResponse,
  FreeBetListResponse,
} from '../types';

export const bonusesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get available bonuses
    getAvailableBonuses: builder.query<BonusListResponse, BonusListQuery | void>({
      query: (params) => ({
        url: '/bonuses',
        params: params || {},
      }),
      providesTags: ['Bonuses'],
    }),

    // Get single bonus details
    getBonusById: builder.query<Bonus, string>({
      query: (id) => `/bonuses/${id}`,
    }),

    // Get user's bonus history
    getUserBonusHistory: builder.query<UserBonusListResponse, void>({
      query: () => '/bonuses/user/history',
      providesTags: ['UserBonuses'],
    }),

    // Get user's active bonuses
    getActiveUserBonuses: builder.query<UserBonus[], void>({
      query: () => '/bonuses/user/active',
      providesTags: ['UserBonuses'],
    }),

    // Claim a bonus
    claimBonus: builder.mutation<UserBonus, string>({
      query: (bonusId) => ({
        url: `/bonuses/${bonusId}/claim`,
        method: 'POST',
      }),
      invalidatesTags: ['Bonuses', 'UserBonuses', 'Wallet', 'FreeBets'],
    }),

    // Get user's free bets
    getFreeBets: builder.query<FreeBetListResponse, void>({
      query: () => '/bonuses/user/free-bets',
      providesTags: ['FreeBets'],
    }),

    // Withdraw a completed bonus to main balance
    withdrawBonus: builder.mutation<{ amount: number; newBalance: number }, string>({
      query: (userBonusId) => ({
        url: `/bonuses/${userBonusId}/withdraw`,
        method: 'POST',
      }),
      invalidatesTags: ['UserBonuses', 'Wallet'],
    }),
  }),
});

export const {
  useGetAvailableBonusesQuery,
  useGetBonusByIdQuery,
  useGetUserBonusHistoryQuery,
  useGetActiveUserBonusesQuery,
  useClaimBonusMutation,
  useGetFreeBetsQuery,
  useWithdrawBonusMutation,
} = bonusesApi;
