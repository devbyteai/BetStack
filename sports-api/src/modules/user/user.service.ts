import { db } from '../../config/database.js';
import { BadRequestError, NotFoundError } from '../../shared/errors/AppError.js';
import { hashPassword, verifyPassword } from '../../shared/utils/password.js';
import type {
  User,
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UserSettings,
  UpdateSettingsRequest,
} from './user.types.js';

interface DbUser {
  id: string;
  mobile_number: string;
  dialing_code: string;
  password_hash: string;
  email: string | null;
  nickname: string | null;
  first_name: string | null;
  last_name: string | null;
  gender: string | null;
  birth_date: string | null;
  kyc_status: string;
  member_type: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

interface DbUserSettings {
  id: string;
  user_id: string;
  odds_format: string;
  auto_accept_odds: string;
  notifications_enabled: boolean;
  sound_enabled: boolean;
  animations_enabled: boolean;
  language: string;
  timezone: string;
  created_at: Date;
  updated_at: Date;
}

export class UserService {
  private mapDbUserToProfile(dbUser: DbUser): UserProfile {
    return {
      id: dbUser.id,
      mobileNumber: dbUser.mobile_number,
      dialingCode: dbUser.dialing_code,
      email: dbUser.email || undefined,
      nickname: dbUser.nickname || undefined,
      firstName: dbUser.first_name || undefined,
      lastName: dbUser.last_name || undefined,
      gender: dbUser.gender || undefined,
      birthDate: dbUser.birth_date || undefined,
      kycStatus: dbUser.kyc_status as UserProfile['kycStatus'],
      memberType: dbUser.member_type,
      isVerified: dbUser.is_verified,
    };
  }

  private mapDbSettingsToSettings(dbSettings: DbUserSettings): UserSettings {
    return {
      oddsFormat: dbSettings.odds_format as UserSettings['oddsFormat'],
      autoAcceptOdds: dbSettings.auto_accept_odds as UserSettings['autoAcceptOdds'],
      notificationsEnabled: dbSettings.notifications_enabled,
      soundEnabled: dbSettings.sound_enabled,
      animationsEnabled: dbSettings.animations_enabled ?? true,
      language: dbSettings.language,
      timezone: dbSettings.timezone,
    };
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await db<DbUser>('users')
      .where('id', userId)
      .first();

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.mapDbUserToProfile(user);
  }

  async updateProfile(userId: string, data: UpdateProfileRequest): Promise<UserProfile> {
    // Check if email is being updated and is already taken
    if (data.email) {
      const existingUser = await db<DbUser>('users')
        .where('email', data.email)
        .whereNot('id', userId)
        .first();

      if (existingUser) {
        throw new BadRequestError('Email already in use');
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (data.email !== undefined) updateData.email = data.email;
    if (data.nickname !== undefined) updateData.nickname = data.nickname;
    if (data.firstName !== undefined) updateData.first_name = data.firstName;
    if (data.lastName !== undefined) updateData.last_name = data.lastName;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.birthDate !== undefined) updateData.birth_date = data.birthDate;

    if (Object.keys(updateData).length === 0) {
      return this.getProfile(userId);
    }

    const [updatedUser] = await db('users')
      .where('id', userId)
      .update(updateData)
      .returning('*') as DbUser[];

    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }

    return this.mapDbUserToProfile(updatedUser);
  }

  async changePassword(userId: string, data: ChangePasswordRequest): Promise<void> {
    const user = await db<DbUser>('users')
      .where('id', userId)
      .first();

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isValidPassword = await verifyPassword(data.currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw new BadRequestError('Current password is incorrect');
    }

    // Check if new password is different
    const isSamePassword = await verifyPassword(data.newPassword, user.password_hash);
    if (isSamePassword) {
      throw new BadRequestError('New password must be different from current password');
    }

    // Hash and update password
    const newPasswordHash = await hashPassword(data.newPassword);

    await db('users')
      .where('id', userId)
      .update({ password_hash: newPasswordHash });
  }

  async getSettings(userId: string): Promise<UserSettings> {
    let settings = await db<DbUserSettings>('user_settings')
      .where('user_id', userId)
      .first();

    if (!settings) {
      // Create default settings
      const [newSettings] = await db('user_settings')
        .insert({ user_id: userId })
        .returning('*') as DbUserSettings[];

      settings = newSettings;
    }

    return this.mapDbSettingsToSettings(settings);
  }

  async updateSettings(userId: string, data: UpdateSettingsRequest): Promise<UserSettings> {
    // Ensure settings exist
    let settings = await db<DbUserSettings>('user_settings')
      .where('user_id', userId)
      .first();

    if (!settings) {
      const [newSettings] = await db('user_settings')
        .insert({ user_id: userId })
        .returning('*') as DbUserSettings[];

      settings = newSettings;
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (data.oddsFormat !== undefined) updateData.odds_format = data.oddsFormat;
    if (data.autoAcceptOdds !== undefined) updateData.auto_accept_odds = data.autoAcceptOdds;
    if (data.notificationsEnabled !== undefined) updateData.notifications_enabled = data.notificationsEnabled;
    if (data.soundEnabled !== undefined) updateData.sound_enabled = data.soundEnabled;
    if (data.animationsEnabled !== undefined) updateData.animations_enabled = data.animationsEnabled;
    if (data.language !== undefined) updateData.language = data.language;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;

    if (Object.keys(updateData).length === 0) {
      return this.mapDbSettingsToSettings(settings);
    }

    const [updatedSettings] = await db('user_settings')
      .where('user_id', userId)
      .update(updateData)
      .returning('*') as DbUserSettings[];

    return this.mapDbSettingsToSettings(updatedSettings);
  }

  async deleteAccount(userId: string, password: string): Promise<void> {
    const user = await db<DbUser>('users')
      .where('id', userId)
      .first();

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new BadRequestError('Password is incorrect');
    }

    // Soft delete by deactivating
    await db('users')
      .where('id', userId)
      .update({ is_active: false });
  }
}

export const userService = new UserService();
