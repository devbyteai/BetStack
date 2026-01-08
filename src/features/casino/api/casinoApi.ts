import { baseApi } from '@/store/api';
import type {
  CasinoProvider,
  CasinoCategory,
  CasinoGame,
  CasinoGamesQuery,
  CasinoGamesResponse,
  GameLaunchRequest,
  GameLaunchResponse,
} from '../types';

export const casinoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all providers
    getCasinoProviders: builder.query<CasinoProvider[], void>({
      query: () => '/casino/providers',
      providesTags: ['CasinoProviders'],
    }),

    // Get all categories
    getCasinoCategories: builder.query<CasinoCategory[], void>({
      query: () => '/casino/categories',
      providesTags: ['CasinoCategories'],
    }),

    // Get games list
    getCasinoGames: builder.query<CasinoGamesResponse, CasinoGamesQuery>({
      query: (params) => ({
        url: '/casino/games',
        params,
      }),
      providesTags: ['CasinoGames'],
    }),

    // Get single game details
    getCasinoGame: builder.query<CasinoGame, string>({
      query: (id) => `/casino/games/${id}`,
    }),

    // Launch game
    launchGame: builder.mutation<GameLaunchResponse, { gameId: string } & GameLaunchRequest>({
      query: ({ gameId, ...body }) => ({
        url: `/casino/games/${gameId}/launch`,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetCasinoProvidersQuery,
  useGetCasinoCategoriesQuery,
  useGetCasinoGamesQuery,
  useGetCasinoGameQuery,
  useLaunchGameMutation,
} = casinoApi;
