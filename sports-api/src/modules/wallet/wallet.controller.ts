import type { Request, Response, NextFunction } from 'express';
import { walletService } from './wallet.service.js';
import { emitBalanceUpdate } from '../../websocket/index.js';
import type { AuthenticatedRequest } from '../../shared/middleware/index.js';
import type {
  DepositInput,
  WithdrawInput,
  TransactionHistoryQueryInput,
  PaymentCallbackInput,
} from './wallet.schema.js';

export class WalletController {
  async getWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;

      const wallet = await walletService.getWallet(userId);

      res.json({
        success: true,
        data: wallet,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactionHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;
      const query = req.query as unknown as TransactionHistoryQueryInput;

      const result = await walletService.getTransactionHistory(userId, query);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async initiateDeposit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;
      const body = req.body as DepositInput;

      const result = await walletService.initiateDeposit(userId, body);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async initiateWithdrawal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;
      const body = req.body as WithdrawInput;

      const result = await walletService.initiateWithdrawal(userId, body);

      // Emit balance update
      const wallet = await walletService.getWallet(userId);
      emitBalanceUpdate(userId, {
        balance: wallet.balance,
        bonusBalance: wallet.bonusBalance,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getWithdrawalStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;
      const { id } = req.params;

      const transaction = await walletService.getWithdrawalStatus(userId, id);

      res.json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  async handlePaymentCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as PaymentCallbackInput;

      await walletService.handlePaymentCallback(body);

      res.json({
        success: true,
        message: 'Callback processed',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const walletController = new WalletController();
