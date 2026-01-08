import { Request, Response, NextFunction } from 'express';
import { sportsService } from './sports.service.js';
import { sendSuccess } from '../../shared/utils/response.js';
import type {
  GetSportsQuery,
  GetRegionsParams,
  GetCompetitionsParams,
  GetGamesQuery,
  GetGameParams,
  GetGameQuery,
  SearchGamesQuery,
} from './sports.schema.js';

export class SportsController {
  async getSports(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as GetSportsQuery;
      const sports = await sportsService.getSports(query);
      return sendSuccess(res, sports);
    } catch (error) {
      next(error);
    }
  }

  async getRegions(req: Request, res: Response, next: NextFunction) {
    try {
      const { sportId } = req.params as unknown as GetRegionsParams;
      const regions = await sportsService.getRegions(sportId);
      return sendSuccess(res, regions);
    } catch (error) {
      next(error);
    }
  }

  async getCompetitions(req: Request, res: Response, next: NextFunction) {
    try {
      const { regionId } = req.params as unknown as GetCompetitionsParams;
      const competitions = await sportsService.getCompetitions(regionId);
      return sendSuccess(res, competitions);
    } catch (error) {
      next(error);
    }
  }

  async getGames(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as GetGamesQuery;
      const result = await sportsService.getGames(query);
      return sendSuccess(res, result.games, 200, {
        total: result.total,
        page: Math.floor((query.offset || 0) / (query.limit || 50)) + 1,
        perPage: query.limit || 50,
        totalPages: Math.ceil(result.total / (query.limit || 50)),
      });
    } catch (error) {
      next(error);
    }
  }

  async getGame(req: Request, res: Response, next: NextFunction) {
    try {
      const { gameId } = req.params as unknown as GetGameParams;
      const query = req.query as unknown as GetGameQuery;
      const game = await sportsService.getGame(gameId, query.withMarkets);
      return sendSuccess(res, game);
    } catch (error) {
      next(error);
    }
  }

  async getGameMarkets(req: Request, res: Response, next: NextFunction) {
    try {
      const { gameId } = req.params as unknown as GetGameParams;
      const markets = await sportsService.getGameMarkets(gameId);
      return sendSuccess(res, markets);
    } catch (error) {
      next(error);
    }
  }

  async getLiveGames(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const games = await sportsService.getLiveGames(limit);
      return sendSuccess(res, games);
    } catch (error) {
      next(error);
    }
  }

  async getFeaturedGames(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const games = await sportsService.getFeaturedGames(limit);
      return sendSuccess(res, games);
    } catch (error) {
      next(error);
    }
  }

  async searchGames(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, limit } = req.query as unknown as SearchGamesQuery;
      const games = await sportsService.searchGames(q, limit);
      return sendSuccess(res, games);
    } catch (error) {
      next(error);
    }
  }
}

export const sportsController = new SportsController();
