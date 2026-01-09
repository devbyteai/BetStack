import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/shared/constants';
import { authApi } from '../api/authApi';
import type { AuthState, User, Wallet } from '../types';
import type { RootState } from '@/store';

// DEMO MODE: Bypassing auth for UI preview
const initialState: AuthState = {
  user: {
    id: 'demo-user',
    phone: '+1234567890',
    firstName: 'Demo',
    lastName: 'User',
    email: 'demo@betstack.com',
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
  wallet: {
    id: 'demo-wallet',
    balance: 1500.00,
    currency: 'USD',
    bonusBalance: 50.00,
  },
  isAuthenticated: true,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setWallet: (state, action: PayloadAction<Wallet | null>) => {
      state.wallet = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.wallet = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    hydrateAuth: (state, action: PayloadAction<{ user: User; wallet: Wallet | null } | null>) => {
      if (action.payload) {
        state.user = action.payload.user;
        state.wallet = action.payload.wallet;
        state.isAuthenticated = true;
      }
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        state.user = action.payload.user;
        state.wallet = action.payload.wallet;
        state.isAuthenticated = true;
        state.isLoading = false;

        // Persist tokens and user data
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, action.payload.accessToken);
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, action.payload.refreshToken);
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(action.payload.user));
      })
      .addMatcher(authApi.endpoints.register.matchFulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isLoading = false;

        // Persist tokens and user data
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, action.payload.accessToken);
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, action.payload.refreshToken);
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(action.payload.user));
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.wallet = null;
        state.isAuthenticated = false;

        // Clear persisted data
        AsyncStorage.multiRemove([
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER,
        ]);
      })
      .addMatcher(authApi.endpoints.refreshToken.matchFulfilled, (_state, action) => {
        // Update tokens
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, action.payload.accessToken);
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, action.payload.refreshToken);
      });
  },
});

export const { setUser, setWallet, setLoading, logout, hydrateAuth } = authSlice.actions;

// Typed selectors
export const selectUser = (state: RootState) => state.auth.user;
export const selectWallet = (state: RootState) => state.auth.wallet;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectAuth = (state: RootState) => state.auth;

// Derived selectors
export const selectUserFullName = (state: RootState) => {
  const user = state.auth.user;
  if (!user) return null;
  const parts = [user.firstName, user.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : user.mobileNumber;
};

export const selectWalletBalance = (state: RootState) => state.auth.wallet?.balance ?? 0;
export const selectBonusBalance = (state: RootState) => state.auth.wallet?.bonusBalance ?? 0;
export const selectTotalBalance = (state: RootState) => {
  const wallet = state.auth.wallet;
  if (!wallet) return 0;
  return wallet.balance + wallet.bonusBalance;
};

export default authSlice.reducer;
