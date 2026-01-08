import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../../config/redis.js';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  store: new RedisStore({
    // @ts-expect-error - RedisStore types don't match ioredis
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
});

// Stricter limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many login attempts, please try again later',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
    },
  },
  store: new RedisStore({
    // @ts-expect-error - RedisStore types don't match ioredis
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
});

// OTP rate limiter - very strict
export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 OTP requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many OTP requests, please try again later',
      code: 'OTP_RATE_LIMIT_EXCEEDED',
    },
  },
  store: new RedisStore({
    // @ts-expect-error - RedisStore types don't match ioredis
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
});

// Betting rate limiter
export const bettingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 bets per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many betting requests, please slow down',
      code: 'BETTING_RATE_LIMIT_EXCEEDED',
    },
  },
  store: new RedisStore({
    // @ts-expect-error - RedisStore types don't match ioredis
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
});

// Password change rate limiter - prevents brute force attempts
export const passwordChangeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 password change attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many password change attempts, please try again later',
      code: 'PASSWORD_CHANGE_RATE_LIMIT_EXCEEDED',
    },
  },
  store: new RedisStore({
    // @ts-expect-error - RedisStore types don't match ioredis
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
});
