import { Router } from 'express';
import { walletController } from './wallet.controller.js';
import { authenticate } from '../../shared/middleware/index.js';
import { validateBody, validateQuery, validateParams } from '../../shared/middleware/index.js';
import { verifyWebhookSignature } from '../../shared/middleware/webhookSignature.js';
import {
  depositSchema,
  withdrawSchema,
  transactionHistoryQuerySchema,
  paymentCallbackSchema,
  withdrawalIdParamSchema,
} from './wallet.schema.js';

const router = Router();

// Get wallet balance (requires auth)
router.get(
  '/',
  authenticate,
  walletController.getWallet.bind(walletController)
);

// Get transaction history (requires auth)
router.get(
  '/transactions',
  authenticate,
  validateQuery(transactionHistoryQuerySchema),
  walletController.getTransactionHistory.bind(walletController)
);

// Initiate deposit (requires auth)
router.post(
  '/deposit',
  authenticate,
  validateBody(depositSchema),
  walletController.initiateDeposit.bind(walletController)
);

// Initiate withdrawal (requires auth)
router.post(
  '/withdraw',
  authenticate,
  validateBody(withdrawSchema),
  walletController.initiateWithdrawal.bind(walletController)
);

// Get withdrawal status (requires auth)
router.get(
  '/withdraw/:id',
  authenticate,
  validateParams(withdrawalIdParamSchema),
  walletController.getWithdrawalStatus.bind(walletController)
);

// Payment provider callback (no user auth - verified by webhook signature)
router.post(
  '/callback',
  verifyWebhookSignature,
  validateBody(paymentCallbackSchema),
  walletController.handlePaymentCallback.bind(walletController)
);

export { router as walletRoutes };
