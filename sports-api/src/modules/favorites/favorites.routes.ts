import { Router } from 'express';
import { favoritesController } from './favorites.controller.js';
import { authenticate, validateBody, validateParams } from '../../shared/middleware/index.js';
import { createFavoriteSchema, deleteFavoriteParamsSchema } from './favorites.schema.js';

const router = Router();

// All favorites routes require authentication
router.use(authenticate);

// Get user's favorites
router.get(
  '/',
  favoritesController.getFavorites.bind(favoritesController)
);

// Check if something is favorited
router.get(
  '/check',
  favoritesController.checkFavorite.bind(favoritesController)
);

// Add to favorites
router.post(
  '/',
  validateBody(createFavoriteSchema),
  favoritesController.addFavorite.bind(favoritesController)
);

// Remove from favorites
router.delete(
  '/:id',
  validateParams(deleteFavoriteParamsSchema),
  favoritesController.removeFavorite.bind(favoritesController)
);

export { router as favoritesRoutes };
