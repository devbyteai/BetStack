import { baseApi } from '@/store/api';
import type {
  Sport,
  Region,
  Competition,
  Game,
  Market,
  GetGamesParams,
} from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export const sportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all sports
    getSports: builder.query<Sport[], { type?: 'prematch' | 'live' }>({
      query: (params) => ({
        url: '/sports',
        params,
      }),
      transformResponse: (response: ApiResponse<Sport[]>) => response.data,
      providesTags: ['Sports'],
    }),

    // Get regions by sport
    getRegions: builder.query<Region[], number>({
      query: (sportId) => `/sports/${sportId}/regions`,
      transformResponse: (response: ApiResponse<Region[]>) => response.data,
    }),

    // Get competitions by region
    getCompetitions: builder.query<Competition[], number>({
      query: (regionId) => `/sports/regions/${regionId}/competitions`,
      transformResponse: (response: ApiResponse<Competition[]>) => response.data,
    }),

    // Get games with filters
    getGames: builder.query<{ games: Game[]; total: number; page: number; totalPages: number }, GetGamesParams>({
      query: (params) => ({
        url: '/sports/games',
        params,
      }),
      transformResponse: (response: ApiResponse<Game[]>) => ({
        games: response.data,
        total: response.meta?.total || 0,
        page: response.meta?.page || 1,
        totalPages: response.meta?.totalPages || 1,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.games.map(({ id }) => ({ type: 'Games' as const, id })),
              { type: 'Games', id: 'LIST' },
            ]
          : [{ type: 'Games', id: 'LIST' }],
    }),

    // Get single game
    getGame: builder.query<Game, { gameId: string; withMarkets?: boolean }>({
      query: ({ gameId, withMarkets }) => ({
        url: `/sports/games/${gameId}`,
        params: { withMarkets },
      }),
      transformResponse: (response: ApiResponse<Game>) => response.data,
      providesTags: (_result, _error, { gameId }) => [{ type: 'Games', id: gameId }],
    }),

    // Get game markets
    getGameMarkets: builder.query<Market[], string>({
      query: (gameId) => `/sports/games/${gameId}/markets`,
      transformResponse: (response: ApiResponse<Market[]>) => response.data,
    }),

    // Get live games
    getLiveGames: builder.query<Game[], number | void>({
      query: (limit) => ({
        url: '/sports/live',
        params: limit ? { limit } : undefined,
      }),
      transformResponse: (response: ApiResponse<Game[]>) => response.data,
      providesTags: [{ type: 'Games', id: 'LIVE' }],
    }),

    // Get featured games
    getFeaturedGames: builder.query<Game[], number | void>({
      query: (limit) => ({
        url: '/sports/featured',
        params: limit ? { limit } : undefined,
      }),
      transformResponse: (response: ApiResponse<Game[]>) => response.data,
      providesTags: [{ type: 'Games', id: 'FEATURED' }],
    }),

    // Search games
    searchGames: builder.query<Game[], { q: string; limit?: number }>({
      query: ({ q, limit }) => ({
        url: '/sports/games/search',
        params: { q, limit },
      }),
      transformResponse: (response: ApiResponse<Game[]>) => response.data,
      providesTags: [{ type: 'Games', id: 'SEARCH' }],
    }),
  }),
});

export const {
  useGetSportsQuery,
  useGetRegionsQuery,
  useGetCompetitionsQuery,
  useGetGamesQuery,
  useGetGameQuery,
  useGetGameMarketsQuery,
  useGetLiveGamesQuery,
  useGetFeaturedGamesQuery,
  useSearchGamesQuery,
} = sportsApi;
