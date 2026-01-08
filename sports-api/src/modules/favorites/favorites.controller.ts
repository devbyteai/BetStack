import type { Request, Response, NextFunction } from 'express';
import { favoritesService } from './favorites.service.js';
import type { CreateFavoriteInput } from './favorites.schema.js';

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

class FavoritesController {
  async getFavorites(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const favorites = await favoritesService.getFavorites(userId);

      res.json({
        success: true,
        data: favorites,
      });
    } catch (error) {
      next(error);
    }
  }

  async addFavorite(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const input = req.body as CreateFavoriteInput;

      const favorite = await favoritesService.addFavorite(userId, input);

      res.status(201).json({
        success: true,
        data: favorite,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeFavorite(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      await favoritesService.removeFavorite(userId, id);

      res.json({
        success: true,
        message: 'Favorite removed',
      });
    } catch (error) {
      next(error);
    }
  }

  async checkFavorite(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { gameId, competitionId } = req.query;

      const isFavorite = await favoritesService.isFavorite(
        userId,
        gameId as string | undefined,
        competitionId ? parseInt(competitionId as string, 10) : undefined
      );

      res.json({
        success: true,
        data: { isFavorite },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const favoritesController = new FavoritesController();
