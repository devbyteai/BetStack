import { Router } from 'express';
import { bonusController } from './bonus.controller.js';
import { authenticate, validateQuery, validateParams } from '../../shared/middleware/index.js';
import { bonusListQuerySchema, bonusIdParamSchema } from './bonus.schema.js';

const router = Router();

// Get available bonuses (public)
router.get(
  '/',
  validateQuery(bonusListQuerySchema),
  bonusController.getAvailableBonuses.bind(bonusController)
);

// IMPORTANT: User-specific routes MUST come before /:id to prevent "user" matching as an ID
// Get user's bonus history (requires auth)
router.get(
  '/user/history',
  authenticate,
  bonusController.getUserBonuses.bind(bonusController)
);

// Get user's active bonuses (requires auth)
router.get(
  '/user/active',
  authenticate,
  bonusController.getActiveUserBonuses.bind(bonusController)
);

// Get user's free bets (requires auth)
router.get(
  '/user/free-bets',
  authenticate,
  bonusController.getFreeBets.bind(bonusController)
);

// Get single bonus details (public) - with UUID validation
router.get(
  '/:id',
  validateParams(bonusIdParamSchema),
  bonusController.getBonusById.bind(bonusController)
);

// Claim a bonus (requires auth) - with UUID validation
router.post(
  '/:id/claim',
  authenticate,
  validateParams(bonusIdParamSchema),
  bonusController.claimBonus.bind(bonusController)
);

// Withdraw a completed bonus to main balance (requires auth)
router.post(
  '/:id/withdraw',
  authenticate,
  validateParams(bonusIdParamSchema),
  bonusController.withdrawBonus.bind(bonusController)
);

export { router as bonusRoutes };
