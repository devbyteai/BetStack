export type KycStatus = 'pending' | 'verified' | 'rejected';
export type OddsFormat = 'decimal' | 'fractional' | 'american' | 'hongkong' | 'malay' | 'indonesian';
export type AutoAcceptOdds = 'none' | 'higher' | 'any';

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

export const ODDS_FORMATS: { id: OddsFormat; name: string }[] = [
  { id: 'decimal', name: 'Decimal (2.50)' },
  { id: 'fractional', name: 'Fractional (3/2)' },
  { id: 'american', name: 'American (+150)' },
  { id: 'hongkong', name: 'Hong Kong (1.50)' },
  { id: 'malay', name: 'Malay (0.75)' },
  { id: 'indonesian', name: 'Indonesian (-1.33)' },
];

export const AUTO_ACCEPT_OPTIONS: { id: AutoAcceptOdds; name: string; description: string }[] = [
  { id: 'none', name: 'Never', description: 'Always confirm odds changes' },
  { id: 'higher', name: 'Higher Only', description: 'Accept higher odds automatically' },
  { id: 'any', name: 'Any Change', description: 'Accept all odds changes' },
];

export const GENDERS: { id: string; name: string }[] = [
  { id: 'male', name: 'Male' },
  { id: 'female', name: 'Female' },
  { id: 'other', name: 'Other' },
];
