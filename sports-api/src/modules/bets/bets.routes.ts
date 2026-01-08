import { Router } from 'express';
import { betsController } from './bets.controller.js';
import { authenticate, optionalAuth } from '../../shared/middleware/index.js';
import { validateBody, validateQuery, validateParams } from '../../shared/middleware/index.js';
import {
  placeBetSchema,
  betHistoryQuerySchema,
  cashoutSchema,
  betIdParamSchema,
  bookingCodeParamSchema,
  createBookingSchema,
} from './bets.schema.js';

const router = Router();

// Place a bet (requires auth)
router.post(
  '/',
  authenticate,
  validateBody(placeBetSchema),
  betsController.placeBet.bind(betsController)
);

// Validate bet before placing (requires auth)
router.post(
  '/validate',
  authenticate,
  validateBody(placeBetSchema),
  betsController.validateBet.bind(betsController)
);

// Get bet history (requires auth)
router.get(
  '/',
  authenticate,
  validateQuery(betHistoryQuerySchema),
  betsController.getBetHistory.bind(betsController)
);

// Get single bet (optional auth - own bets show more details)
router.get(
  '/:betId',
  optionalAuth,
  validateParams(betIdParamSchema),
  betsController.getBet.bind(betsController)
);

// Request cashout (requires auth)
router.post(
  '/:betId/cashout',
  authenticate,
  validateParams(betIdParamSchema),
  validateBody(cashoutSchema),
  betsController.requestCashout.bind(betsController)
);

// Get cashout value (requires auth)
router.get(
  '/:betId/cashout',
  authenticate,
  validateParams(betIdParamSchema),
  betsController.getCashoutValue.bind(betsController)
);

// Booking code routes
router.post(
  '/booking',
  validateBody(createBookingSchema),
  betsController.createBooking.bind(betsController)
);

// IMPORTANT: Static routes MUST come before parameterized routes
// /booking/temp/:code must be before /booking/:code to prevent "temp" matching as :code
router.get(
  '/booking/temp/:code',
  validateParams(bookingCodeParamSchema),
  betsController.getBooking.bind(betsController)
);

router.get(
  '/booking/:code',
  validateParams(bookingCodeParamSchema),
  betsController.getBetByBookingCode.bind(betsController)
);

export { router as betsRoutes };
