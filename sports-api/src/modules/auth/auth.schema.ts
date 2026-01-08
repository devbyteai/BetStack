import { z } from 'zod';

export const registerSchema = z.object({
  mobileNumber: z
    .string()
    .min(9, 'Mobile number must be at least 9 digits')
    .max(15, 'Mobile number must not exceed 15 digits')
    .regex(/^\d+$/, 'Mobile number must contain only digits'),
  dialingCode: z.string().default('+233'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email('Invalid email address').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  mobileNumber: z
    .string()
    .min(9, 'Mobile number must be at least 9 digits')
    .max(15, 'Mobile number must not exceed 15 digits'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const sendOtpSchema = z.object({
  mobileNumber: z
    .string()
    .min(9, 'Mobile number must be at least 9 digits')
    .max(15, 'Mobile number must not exceed 15 digits'),
  dialingCode: z.string().default('+233'),
  purpose: z.enum(['register', 'reset_password', 'verify']),
});

export const verifyOtpSchema = z.object({
  mobileNumber: z
    .string()
    .min(9, 'Mobile number must be at least 9 digits')
    .max(15, 'Mobile number must not exceed 15 digits'),
  code: z.string().length(6, 'OTP must be 6 digits'),
  purpose: z.enum(['register', 'reset_password', 'verify']),
});

export const resetPasswordSchema = z.object({
  mobileNumber: z
    .string()
    .min(9, 'Mobile number must be at least 9 digits')
    .max(15, 'Mobile number must not exceed 15 digits'),
  code: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
