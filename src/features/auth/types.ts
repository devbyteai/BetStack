export interface User {
  id: string;
  mobileNumber: string;
  dialingCode: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  isVerified: boolean;
}

export interface Wallet {
  balance: number;
  bonusBalance: number;
  currency: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  mobileNumber: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  wallet: Wallet | null;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  mobileNumber: string;
  dialingCode?: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  captchaToken?: string;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface SendOtpRequest {
  mobileNumber: string;
  dialingCode?: string;
  purpose: 'register' | 'reset_password' | 'verify';
}

export interface VerifyOtpRequest {
  mobileNumber: string;
  code: string;
  purpose: 'register' | 'reset_password' | 'verify';
}

export interface ResetPasswordRequest {
  mobileNumber: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  wallet: Wallet | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
