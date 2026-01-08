import Redis from 'ioredis';
import { env } from './env.js';

export const redis = new Redis.default(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    if (times > 3) {
      return null;
    }
    return Math.min(times * 100, 3000);
  },
});

redis.on('error', (err: Error) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Redis connected');
});

// Cache helper functions

const DEFAULT_TTL = 300; // 5 minutes

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return data as unknown as T;
    }
  },

  async set(key: string, value: unknown, ttl: number = DEFAULT_TTL): Promise<void> {
    const data = typeof value === 'string' ? value : JSON.stringify(value);
    await redis.setex(key, ttl, data);
  },

  async del(key: string): Promise<void> {
    await redis.del(key);
  },

  async delPattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },

  async exists(key: string): Promise<boolean> {
    const result = await redis.exists(key);
    return result === 1;
  },

  async ttl(key: string): Promise<number> {
    return redis.ttl(key);
  },

  async incr(key: string): Promise<number> {
    return redis.incr(key);
  },

  async expire(key: string, ttl: number): Promise<void> {
    await redis.expire(key, ttl);
  },
};

// Session cache helpers
export const sessionCache = {
  async setUserSession(userId: string, sessionData: object, ttl: number = 3600): Promise<void> {
    await cache.set(`session:${userId}`, sessionData, ttl);
  },

  async getUserSession<T>(userId: string): Promise<T | null> {
    return cache.get<T>(`session:${userId}`);
  },

  async deleteUserSession(userId: string): Promise<void> {
    await cache.del(`session:${userId}`);
  },

  async setRefreshToken(userId: string, tokenHash: string, ttl: number = 604800): Promise<void> {
    await cache.set(`refresh:${userId}`, tokenHash, ttl);
  },

  async getRefreshToken(userId: string): Promise<string | null> {
    return cache.get<string>(`refresh:${userId}`);
  },

  async deleteRefreshToken(userId: string): Promise<void> {
    await cache.del(`refresh:${userId}`);
  },
};

// Odds cache helpers
export const oddsCache = {
  async setOdds(eventId: string, odds: number, ttl: number = 60): Promise<void> {
    await cache.set(`odds:${eventId}`, odds, ttl);
  },

  async getOdds(eventId: string): Promise<number | null> {
    return cache.get<number>(`odds:${eventId}`);
  },

  async setGameOdds(gameId: string, markets: object, ttl: number = 60): Promise<void> {
    await cache.set(`game:odds:${gameId}`, markets, ttl);
  },

  async getGameOdds<T>(gameId: string): Promise<T | null> {
    return cache.get<T>(`game:odds:${gameId}`);
  },

  async invalidateGameOdds(gameId: string): Promise<void> {
    await cache.delPattern(`game:odds:${gameId}*`);
  },
};

// Booking code storage (temporary betslips)
export const bookingCache = {
  async saveBooking(code: string, betslipData: object, ttl: number = 86400): Promise<void> {
    await cache.set(`booking:${code}`, betslipData, ttl);
  },

  async getBooking<T>(code: string): Promise<T | null> {
    return cache.get<T>(`booking:${code}`);
  },

  async deleteBooking(code: string): Promise<void> {
    await cache.del(`booking:${code}`);
  },
};

// OTP cache helpers
export const otpCache = {
  async setOtp(phoneNumber: string, code: string, ttl: number = 600): Promise<void> {
    await cache.set(`otp:${phoneNumber}`, code, ttl);
  },

  async getOtp(phoneNumber: string): Promise<string | null> {
    return cache.get<string>(`otp:${phoneNumber}`);
  },

  async deleteOtp(phoneNumber: string): Promise<void> {
    await cache.del(`otp:${phoneNumber}`);
  },

  async incrementAttempts(phoneNumber: string): Promise<number> {
    const key = `otp:attempts:${phoneNumber}`;
    const attempts = await cache.incr(key);
    if (attempts === 1) {
      await cache.expire(key, 3600); // 1 hour
    }
    return attempts;
  },

  async getAttempts(phoneNumber: string): Promise<number> {
    const attempts = await cache.get<number>(`otp:attempts:${phoneNumber}`);
    return attempts || 0;
  },

  // Track per-OTP verification attempts (prevent brute force on individual codes)
  async incrementVerifyAttempts(phoneNumber: string): Promise<number> {
    const key = `otp:verify:${phoneNumber}`;
    const attempts = await cache.incr(key);
    if (attempts === 1) {
      await cache.expire(key, 600); // 10 minutes (same as OTP TTL)
    }
    return attempts;
  },

  async getVerifyAttempts(phoneNumber: string): Promise<number> {
    const attempts = await cache.get<number>(`otp:verify:${phoneNumber}`);
    return attempts || 0;
  },

  async resetVerifyAttempts(phoneNumber: string): Promise<void> {
    await cache.del(`otp:verify:${phoneNumber}`);
  },
};

// Login attempt tracking (prevent brute force attacks)
export const loginCache = {
  // Track failed login attempts per user
  async incrementFailedAttempts(mobileNumber: string): Promise<number> {
    const key = `login:failed:${mobileNumber}`;
    const attempts = await cache.incr(key);
    if (attempts === 1) {
      await cache.expire(key, 1800); // 30 minutes
    }
    return attempts;
  },

  async getFailedAttempts(mobileNumber: string): Promise<number> {
    const attempts = await cache.get<number>(`login:failed:${mobileNumber}`);
    return attempts || 0;
  },

  async resetFailedAttempts(mobileNumber: string): Promise<void> {
    await cache.del(`login:failed:${mobileNumber}`);
  },

  // Check if account is locked
  async isLocked(mobileNumber: string): Promise<boolean> {
    const lockKey = `login:locked:${mobileNumber}`;
    return cache.exists(lockKey);
  },

  // Lock account after too many failed attempts
  async lockAccount(mobileNumber: string, ttl: number = 1800): Promise<void> {
    await cache.set(`login:locked:${mobileNumber}`, true, ttl); // 30 minutes default
  },

  async getLockTTL(mobileNumber: string): Promise<number> {
    return cache.ttl(`login:locked:${mobileNumber}`);
  },
};
