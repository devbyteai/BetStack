import { Router } from 'express';
import { casinoController } from './casino.controller.js';
import { authenticate, validateQuery, validateBody, validateParams } from '../../shared/middleware/index.js';
import { casinoGamesQuerySchema, gameLaunchSchema, gameIdParamSchema } from './casino.schema.js';

const router = Router();

// Get all providers
router.get(
  '/providers',
  casinoController.getProviders.bind(casinoController)
);

// Get all categories
router.get(
  '/categories',
  casinoController.getCategories.bind(casinoController)
);

// Get games list (with filters)
router.get(
  '/games',
  validateQuery(casinoGamesQuerySchema),
  casinoController.getGames.bind(casinoController)
);

// Get single game details
router.get(
  '/games/:id',
  validateParams(gameIdParamSchema),
  casinoController.getGameById.bind(casinoController)
);

// Launch game (requires auth)
router.post(
  '/games/:id/launch',
  authenticate,
  validateParams(gameIdParamSchema),
  validateBody(gameLaunchSchema),
  casinoController.launchGame.bind(casinoController)
);

export { router as casinoRoutes };
