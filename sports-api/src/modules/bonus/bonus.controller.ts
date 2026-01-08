import type { Request, Response, NextFunction } from 'express';
import { bonusService } from './bonus.service.js';
import type { AuthenticatedRequest } from '../../shared/middleware/index.js';
import type { BonusListQueryInput } from './bonus.schema.js';

export class BonusController {
  async getAvailableBonuses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as BonusListQueryInput;
      const result = await bonusService.getAvailableBonuses(query);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBonusById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const bonus = await bonusService.getBonusById(id);

      res.json({
        success: true,
        data: bonus,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserBonuses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;

      const result = await bonusService.getUserBonuses(userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getActiveUserBonuses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;

      const bonuses = await bonusService.getActiveUserBonuses(userId);

      res.json({
        success: true,
        data: bonuses,
      });
    } catch (error) {
      next(error);
    }
  }

  async claimBonus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;
      const { id } = req.params;

      const userBonus = await bonusService.claimBonus(userId, id);

      res.json({
        success: true,
        data: userBonus,
        message: 'Bonus claimed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getFreeBets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;

      const result = await bonusService.getFreeBets(userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async withdrawBonus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;
      const { id } = req.params; // userBonusId

      const result = await bonusService.withdrawBonus(userId, id);

      res.json({
        success: true,
        data: result,
        message: 'Bonus withdrawn to main balance successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const bonusController = new BonusController();
