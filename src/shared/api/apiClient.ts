import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, STORAGE_KEYS } from '../constants';

/**
 * Axios client for direct API calls outside of RTK Query.
 *
 * NOTE: Token refresh is handled ONLY by RTK Query's baseApi to prevent
 * race conditions. If you get a 401 error using this client directly,
 * you should trigger a logout or let the app re-render to the auth flow.
 *
 * For most API calls, prefer using RTK Query endpoints which handle
 * token refresh automatically.
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - log errors (no token refresh - handled by RTK Query)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Log error details for debugging
    if (__DEV__) {
      console.warn('[apiClient] Request failed:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
      });
    }

    // For 401 errors, the app should redirect to login
    // Token refresh is handled by RTK Query's baseApi
    return Promise.reject(error);
  }
);

export default apiClient;
