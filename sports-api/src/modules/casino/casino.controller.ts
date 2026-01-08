import type { Request, Response, NextFunction } from 'express';
import { casinoService } from './casino.service.js';
import type { AuthenticatedRequest } from '../../shared/middleware/index.js';
import type { CasinoGamesQueryInput, GameLaunchInput } from './casino.schema.js';

export class CasinoController {
  async getProviders(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const providers = await casinoService.getProviders();

      res.json({
        success: true,
        data: providers,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await casinoService.getCategories();

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  async getGames(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as CasinoGamesQueryInput;
      const result = await casinoService.getGames(query);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getGameById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const game = await casinoService.getGameById(id);

      res.json({
        success: true,
        data: game,
      });
    } catch (error) {
      next(error);
    }
  }

  async launchGame(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user!.id;
      const { id } = req.params;
      const { mode } = req.body as GameLaunchInput;

      const result = await casinoService.launchGame(userId, id, mode || 'real');

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const casinoController = new CasinoController();
