export type KycStatus = 'pending' | 'verified' | 'rejected';
export type OddsFormat = 'decimal' | 'fractional' | 'american' | 'hongkong' | 'malay' | 'indonesian';
export type AutoAcceptOdds = 'none' | 'higher' | 'any';

export interface User {
  id: string;
  mobileNumber: string;
  dialingCode: string;
  email?: string;
  nickname?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  birthDate?: string;
  kycStatus: KycStatus;
  memberType: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  mobileNumber: string;
  dialingCode: string;
  email?: string;
  nickname?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  birthDate?: string;
  kycStatus: KycStatus;
  memberType: string;
  isVerified: boolean;
}

export interface UpdateProfileRequest {
  email?: string;
  nickname?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  birthDate?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserSettings {
  oddsFormat: OddsFormat;
  autoAcceptOdds: AutoAcceptOdds;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  language: string;
  timezone: string;
}

export interface UpdateSettingsRequest {
  oddsFormat?: OddsFormat;
  autoAcceptOdds?: AutoAcceptOdds;
  notificationsEnabled?: boolean;
  soundEnabled?: boolean;
  animationsEnabled?: boolean;
  language?: string;
  timezone?: string;
}
