import type { Request, Response, NextFunction } from 'express';
import { betsService } from './bets.service.js';
import { emitBetPlaced, emitBalanceUpdate } from '../../websocket/index.js';
import { db } from '../../config/database.js';
import type { AuthenticatedRequest } from '../../shared/middleware/index.js';
import type { PlaceBetInput, BetHistoryQueryInput, CashoutInput, CreateBookingInput } from './bets.schema.js';

export class BetsController {
  async placeBet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;
      const body = req.body as PlaceBetInput;

      const result = await betsService.placeBet(userId, body);

      // Emit WebSocket events
      emitBetPlaced(userId, {
        betId: result.bet.id,
        bookingCode: result.bookingCode,
        status: 'pending',
      });

      // Get updated balance and emit
      const wallet = await db('wallets').where('user_id', userId).first();
      if (wallet) {
        emitBalanceUpdate(userId, {
          balance: parseFloat(wallet.balance),
          bonusBalance: parseFloat(wallet.bonus_balance),
        });
      }

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.id;
      const { betId } = req.params;

      const bet = await betsService.getBet(betId, userId);

      res.json({
        success: true,
        data: bet,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBetHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;
      const query = req.query as unknown as BetHistoryQueryInput;

      const result = await betsService.getBetHistory(userId, query);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBetByBookingCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;

      const bet = await betsService.getBetByBookingCode(code);

      res.json({
        success: true,
        data: bet,
      });
    } catch (error) {
      next(error);
    }
  }

  async requestCashout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;
      const { betId } = req.params;
      const body = req.body as CashoutInput;

      const result = await betsService.requestCashout(betId, userId, body);

      // Emit balance update
      emitBalanceUpdate(userId, {
        balance: result.newBalance,
        bonusBalance: 0, // Get actual bonus balance
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCashoutValue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;
      const { betId } = req.params;

      const value = await betsService.getCashoutValue(betId, userId);

      res.json({
        success: true,
        data: { value },
      });
    } catch (error) {
      next(error);
    }
  }

  async createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as CreateBookingInput;

      const result = await betsService.createBooking(body.selections);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;

      const result = await betsService.getBooking(code);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async validateBet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;
      const body = req.body as PlaceBetInput;

      const result = await betsService.validateBet(userId, body);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const betsController = new BetsController();
