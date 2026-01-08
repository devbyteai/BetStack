import { baseApi } from '@/store/api';
import type {
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UserSettings,
  UpdateSettingsRequest,
} from '../types';

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get current user profile
    getProfile: builder.query<UserProfile, void>({
      query: () => '/users/me',
      providesTags: ['Profile'],
    }),

    // Update profile
    updateProfile: builder.mutation<UserProfile, UpdateProfileRequest>({
      query: (body) => ({
        url: '/users/me',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),

    // Change password
    changePassword: builder.mutation<{ message: string }, ChangePasswordRequest>({
      query: (body) => ({
        url: '/users/me/password',
        method: 'PATCH',
        body,
      }),
    }),

    // Get user settings
    getSettings: builder.query<UserSettings, void>({
      query: () => '/users/me/settings',
      providesTags: ['Settings'],
    }),

    // Update settings
    updateSettings: builder.mutation<UserSettings, UpdateSettingsRequest>({
      query: (body) => ({
        url: '/users/me/settings',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Settings'],
    }),

    // Delete account
    deleteAccount: builder.mutation<{ message: string }, { password: string }>({
      query: (body) => ({
        url: '/users/me',
        method: 'DELETE',
        body,
      }),
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useDeleteAccountMutation,
} = profileApi;
