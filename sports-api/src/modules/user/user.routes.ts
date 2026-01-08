import { Router } from 'express';
import { userController } from './user.controller.js';
import { authenticate } from '../../shared/middleware/index.js';
import { validateBody } from '../../shared/middleware/index.js';
import { passwordChangeLimiter } from '../../shared/middleware/rateLimiter.js';
import {
  updateProfileSchema,
  changePasswordSchema,
  updateSettingsSchema,
} from './user.schema.js';
import { z } from 'zod';

const router = Router();

// Get current user profile
router.get(
  '/me',
  authenticate,
  userController.getProfile.bind(userController)
);

// Update current user profile
router.patch(
  '/me',
  authenticate,
  validateBody(updateProfileSchema),
  userController.updateProfile.bind(userController)
);

// Change password (rate limited to prevent brute force)
router.patch(
  '/me/password',
  authenticate,
  passwordChangeLimiter,
  validateBody(changePasswordSchema),
  userController.changePassword.bind(userController)
);

// Get user settings
router.get(
  '/me/settings',
  authenticate,
  userController.getSettings.bind(userController)
);

// Update user settings
router.patch(
  '/me/settings',
  authenticate,
  validateBody(updateSettingsSchema),
  userController.updateSettings.bind(userController)
);

// Delete/deactivate account
router.delete(
  '/me',
  authenticate,
  validateBody(z.object({ password: z.string().min(1) })),
  userController.deleteAccount.bind(userController)
);

export { router as userRoutes };
