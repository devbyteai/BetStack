import { baseApi } from '@/store/api';
import type {
  Favorite,
  CreateFavoriteRequest,
  FavoriteResponse,
  CheckFavoriteResponse,
} from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const favoritesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get user's favorites
    getFavorites: builder.query<Favorite[], void>({
      query: () => '/favorites',
      transformResponse: (response: ApiResponse<Favorite[]>) => response.data,
      providesTags: ['Favorites'],
    }),

    // Check if something is favorited
    checkFavorite: builder.query<boolean, { gameId?: string; competitionId?: number }>({
      query: (params) => ({
        url: '/favorites/check',
        params,
      }),
      transformResponse: (response: ApiResponse<CheckFavoriteResponse>) => response.data.isFavorite,
    }),

    // Add to favorites
    addFavorite: builder.mutation<FavoriteResponse, CreateFavoriteRequest>({
      query: (body) => ({
        url: '/favorites',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<FavoriteResponse>) => response.data,
      invalidatesTags: ['Favorites'],
    }),

    // Remove from favorites
    removeFavorite: builder.mutation<void, string>({
      query: (id) => ({
        url: `/favorites/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Favorites'],
    }),
  }),
});

export const {
  useGetFavoritesQuery,
  useCheckFavoriteQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} = favoritesApi;
