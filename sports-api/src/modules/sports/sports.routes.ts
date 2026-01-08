import { Router } from 'express';
import { sportsController } from './sports.controller.js';
import { validateQuery, validateParams } from '../../shared/middleware/validateRequest.js';
import {
  getSportsQuerySchema,
  getRegionsParamsSchema,
  getCompetitionsParamsSchema,
  getGamesQuerySchema,
  getGameParamsSchema,
  getGameQuerySchema,
  searchGamesQuerySchema,
} from './sports.schema.js';

const router = Router();

// Get all sports
router.get(
  '/',
  validateQuery(getSportsQuerySchema),
  sportsController.getSports.bind(sportsController)
);

// Get live games
router.get(
  '/live',
  sportsController.getLiveGames.bind(sportsController)
);

// Get featured games
router.get(
  '/featured',
  sportsController.getFeaturedGames.bind(sportsController)
);

// Search games
router.get(
  '/games/search',
  validateQuery(searchGamesQuerySchema),
  sportsController.searchGames.bind(sportsController)
);

// Get games with filters
router.get(
  '/games',
  validateQuery(getGamesQuerySchema),
  sportsController.getGames.bind(sportsController)
);

// Get single game
router.get(
  '/games/:gameId',
  validateParams(getGameParamsSchema),
  validateQuery(getGameQuerySchema),
  sportsController.getGame.bind(sportsController)
);

// Get game markets
router.get(
  '/games/:gameId/markets',
  validateParams(getGameParamsSchema),
  sportsController.getGameMarkets.bind(sportsController)
);

// Get regions by sport
router.get(
  '/:sportId/regions',
  validateParams(getRegionsParamsSchema),
  sportsController.getRegions.bind(sportsController)
);

// Get competitions by region
router.get(
  '/regions/:regionId/competitions',
  validateParams(getCompetitionsParamsSchema),
  sportsController.getCompetitions.bind(sportsController)
);

export default router;
