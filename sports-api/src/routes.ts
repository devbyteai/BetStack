import { Router } from 'express';
import { authRoutes } from './modules/auth/index.js';
import { sportsRoutes } from './modules/sports/index.js';
import { betsRoutes } from './modules/bets/index.js';
import { walletRoutes } from './modules/wallet/index.js';
import { userRoutes } from './modules/user/index.js';
import { casinoRoutes } from './modules/casino/index.js';
import { bonusRoutes } from './modules/bonus/index.js';
import { contentRoutes } from './modules/content/index.js';
import { favoritesRoutes } from './modules/favorites/index.js';
import { jobsRoutes } from './modules/jobs/index.js';
import { messagesRoutes } from './modules/messages/index.js';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
router.use('/auth', authRoutes);

// Sports routes
router.use('/sports', sportsRoutes);

// Bets routes
router.use('/bets', betsRoutes);

// Wallet routes
router.use('/wallet', walletRoutes);

// User routes
router.use('/users', userRoutes);

// Casino routes
router.use('/casino', casinoRoutes);

// Bonus routes
router.use('/bonuses', bonusRoutes);

// Content routes (banners, news, info pages)
router.use('/content', contentRoutes);

// Favorites routes
router.use('/favorites', favoritesRoutes);

// Jobs routes
router.use('/jobs', jobsRoutes);

// Messages routes
router.use('/messages', messagesRoutes);

export default router;
