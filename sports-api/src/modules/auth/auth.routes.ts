import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validateBody } from '../../shared/middleware/validateRequest.js';
import { authenticate } from '../../shared/middleware/authenticate.js';
import { authLimiter, otpLimiter } from '../../shared/middleware/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  sendOtpSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from './auth.schema.js';

const router = Router();

// Public routes with rate limiting
router.post(
  '/register',
  authLimiter,
  validateBody(registerSchema),
  authController.register.bind(authController)
);

router.post(
  '/login',
  authLimiter,
  validateBody(loginSchema),
  authController.login.bind(authController)
);

router.post(
  '/refresh',
  validateBody(refreshTokenSchema),
  authController.refresh.bind(authController)
);

router.post(
  '/send-otp',
  otpLimiter,
  validateBody(sendOtpSchema),
  authController.sendOtp.bind(authController)
);

router.post(
  '/verify-otp',
  validateBody(verifyOtpSchema),
  authController.verifyOtp.bind(authController)
);

router.post(
  '/reset-password',
  authLimiter,
  validateBody(resetPasswordSchema),
  authController.resetPassword.bind(authController)
);

// Protected routes
router.post(
  '/logout',
  authenticate,
  authController.logout.bind(authController)
);

export default router;
