import { db } from '../../config/database.js';
import { sessionCache, otpCache, loginCache } from '../../config/redis.js';
import { hashPassword, verifyPassword } from '../../shared/utils/password.js';
import { generateTokenPair, verifyToken } from '../../shared/utils/jwt.js';
import { sendOtp as sendOtpSms, generateOtpCode } from '../../shared/utils/sms.js';
import { BadRequestError, UnauthorizedError, ConflictError, TooManyRequestsError } from '../../shared/errors/index.js';
import type { RegisterInput, LoginInput, SendOtpInput, VerifyOtpInput, ResetPasswordInput } from './auth.schema.js';

// Security constants
const MAX_LOGIN_ATTEMPTS = 5;
const MAX_OTP_VERIFY_ATTEMPTS = 3;

interface User {
  id: string;
  mobileNumber: string;
  dialingCode: string;
  passwordHash: string;
  email?: string;
  nickname?: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  isVerified: boolean;
}

interface TokenPayload {
  id: string;
  mobileNumber: string;
}

export class AuthService {
  async register(input: RegisterInput) {
    const { mobileNumber, dialingCode, password, firstName, lastName, email } = input;

    // Check if user exists
    const existingUser = await db('users')
      .where({ mobile_number: mobileNumber })
      .first();

    if (existingUser) {
      throw new ConflictError('User with this mobile number already exists');
    }

    // Check email uniqueness if provided
    if (email) {
      const emailExists = await db('users').where({ email }).first();
      if (emailExists) {
        throw new ConflictError('User with this email already exists');
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const [user] = await db('users')
      .insert({
        mobile_number: mobileNumber,
        dialing_code: dialingCode,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        email,
        is_active: true,
        is_verified: false,
      })
      .returning(['id', 'mobile_number', 'dialing_code', 'email', 'first_name', 'last_name', 'is_verified']);

    // Create wallet for user
    await db('wallets').insert({
      user_id: user.id,
      balance: 0,
      bonus_balance: 0,
      currency: 'GHS',
    });

    // Create user settings
    await db('user_settings').insert({
      user_id: user.id,
    });

    // Generate tokens
    const tokens = generateTokenPair({
      id: user.id,
      mobileNumber: user.mobile_number,
    });

    // Store refresh token in cache
    await sessionCache.setRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        mobileNumber: user.mobile_number,
        dialingCode: user.dialing_code,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isVerified: user.is_verified,
      },
      ...tokens,
    };
  }

  async login(input: LoginInput) {
    const { mobileNumber, password } = input;

    // Check if account is locked due to too many failed attempts
    const isLocked = await loginCache.isLocked(mobileNumber);
    if (isLocked) {
      const ttl = await loginCache.getLockTTL(mobileNumber);
      const minutes = Math.ceil(ttl / 60);
      throw new TooManyRequestsError(
        `Account temporarily locked. Try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`
      );
    }

    // Find user
    const user = await db('users')
      .where({ mobile_number: mobileNumber })
      .first();

    if (!user) {
      // Track failed attempt even for non-existent users (prevent enumeration timing)
      await loginCache.incrementFailedAttempts(mobileNumber);
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      // Track failed attempt and check if should lock
      const attempts = await loginCache.incrementFailedAttempts(mobileNumber);
      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        await loginCache.lockAccount(mobileNumber, 1800); // Lock for 30 minutes
        throw new TooManyRequestsError(
          'Too many failed login attempts. Account locked for 30 minutes.'
        );
      }
      const remaining = MAX_LOGIN_ATTEMPTS - attempts;
      throw new UnauthorizedError(
        `Invalid credentials. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
      );
    }

    // Successful login - reset failed attempts
    await loginCache.resetFailedAttempts(mobileNumber);

    // Generate tokens
    const tokens = generateTokenPair({
      id: user.id,
      mobileNumber: user.mobile_number,
    });

    // Store refresh token in cache
    await sessionCache.setRefreshToken(user.id, tokens.refreshToken);

    // Get wallet
    const wallet = await db('wallets').where({ user_id: user.id }).first();

    return {
      user: {
        id: user.id,
        mobileNumber: user.mobile_number,
        dialingCode: user.dialing_code,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        nickname: user.nickname,
        isVerified: user.is_verified,
      },
      wallet: wallet ? {
        balance: parseFloat(wallet.balance),
        bonusBalance: parseFloat(wallet.bonus_balance),
        currency: wallet.currency,
      } : null,
      ...tokens,
    };
  }

  async logout(userId: string) {
    await sessionCache.deleteRefreshToken(userId);
    await sessionCache.deleteUserSession(userId);
    return { success: true };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = verifyToken(refreshToken) as TokenPayload;

      // Check if refresh token is valid in cache
      const storedToken = await sessionCache.getRefreshToken(decoded.id);
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Get user
      const user = await db('users').where({ id: decoded.id }).first();
      if (!user || !user.is_active) {
        throw new UnauthorizedError('User not found or inactive');
      }

      // Generate new tokens
      const tokens = generateTokenPair({
        id: user.id,
        mobileNumber: user.mobile_number,
      });

      // Store new refresh token
      await sessionCache.setRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async sendOtp(input: SendOtpInput) {
    const { mobileNumber, dialingCode, purpose } = input;
    const fullNumber = `${dialingCode}${mobileNumber}`;

    // Check rate limit
    const attempts = await otpCache.getAttempts(mobileNumber);
    if (attempts >= 5) {
      throw new BadRequestError('Too many OTP requests. Please try again later.');
    }

    // For registration, check if user already exists
    if (purpose === 'register') {
      const existingUser = await db('users')
        .where({ mobile_number: mobileNumber })
        .first();
      if (existingUser) {
        throw new ConflictError('User with this mobile number already exists');
      }
    }

    // For password reset, check if user exists
    if (purpose === 'reset_password') {
      const user = await db('users')
        .where({ mobile_number: mobileNumber })
        .first();
      if (!user) {
        // Don't reveal if user exists
        return { success: true, message: 'If the number exists, an OTP has been sent' };
      }
    }

    // Generate OTP
    const code = generateOtpCode();

    // Store OTP in cache (10 minutes TTL)
    await otpCache.setOtp(mobileNumber, code);
    await otpCache.incrementAttempts(mobileNumber);

    // Store in database for audit
    await db('otp_codes').insert({
      mobile_number: mobileNumber,
      code,
      purpose,
      expires_at: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Send SMS
    await sendOtpSms({ to: fullNumber, code });

    return { success: true, message: 'OTP sent successfully' };
  }

  async verifyOtp(input: VerifyOtpInput) {
    const { mobileNumber, code, purpose } = input;

    // Check if too many verification attempts
    const verifyAttempts = await otpCache.getVerifyAttempts(mobileNumber);
    if (verifyAttempts >= MAX_OTP_VERIFY_ATTEMPTS) {
      // Delete the OTP to force requesting a new one
      await otpCache.deleteOtp(mobileNumber);
      await otpCache.resetVerifyAttempts(mobileNumber);
      throw new TooManyRequestsError(
        'Too many verification attempts. Please request a new OTP.'
      );
    }

    // Get OTP from cache
    const storedCode = await otpCache.getOtp(mobileNumber);

    if (!storedCode) {
      throw new BadRequestError('OTP expired or not found');
    }

    if (storedCode !== code) {
      // Track failed verification attempt
      await otpCache.incrementVerifyAttempts(mobileNumber);
      const remaining = MAX_OTP_VERIFY_ATTEMPTS - (verifyAttempts + 1);
      throw new BadRequestError(
        `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
      );
    }

    // Successful verification - delete OTP and reset attempts
    await otpCache.deleteOtp(mobileNumber);
    await otpCache.resetVerifyAttempts(mobileNumber);

    // Mark as verified if purpose is 'verify'
    if (purpose === 'verify') {
      await db('users')
        .where({ mobile_number: mobileNumber })
        .update({ is_verified: true });
    }

    return { success: true, verified: true };
  }

  async resetPassword(input: ResetPasswordInput) {
    const { mobileNumber, code, newPassword } = input;

    // Verify OTP first
    const storedCode = await otpCache.getOtp(mobileNumber);
    if (!storedCode || storedCode !== code) {
      throw new BadRequestError('Invalid or expired OTP');
    }

    // Get user
    const user = await db('users')
      .where({ mobile_number: mobileNumber })
      .first();

    if (!user) {
      throw new BadRequestError('User not found');
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await db('users')
      .where({ id: user.id })
      .update({ password_hash: passwordHash });

    // Delete OTP
    await otpCache.deleteOtp(mobileNumber);

    // Invalidate all sessions
    await sessionCache.deleteRefreshToken(user.id);

    return { success: true, message: 'Password reset successfully' };
  }
}

export const authService = new AuthService();
