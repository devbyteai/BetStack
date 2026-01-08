import { db } from '../../config/database.js';
import { NotFoundError, BadRequestError } from '../../shared/errors/AppError.js';
import { v4 as uuidv4 } from 'uuid';
import type {
  CasinoProvider,
  CasinoCategory,
  CasinoGame,
  CasinoGameListItem,
  CasinoGamesQuery,
  CasinoGamesResponse,
  GameLaunchResponse,
} from './casino.types.js';

interface DbCasinoProvider {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface DbCasinoCategory {
  id: number;
  name: string;
  slug: string;
  order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface DbCasinoGame {
  id: string;
  provider_id: number | null;
  category_id: number | null;
  name: string;
  thumbnail: string | null;
  game_code: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface DbGameWithJoins extends DbCasinoGame {
  provider_name?: string | null;
  category_slug?: string | null;
}

export class CasinoService {
  private mapDbProviderToProvider(dbProvider: DbCasinoProvider): CasinoProvider {
    return {
      id: dbProvider.id,
      name: dbProvider.name,
      code: dbProvider.code,
      isActive: dbProvider.is_active,
    };
  }

  private mapDbCategoryToCategory(dbCategory: DbCasinoCategory): CasinoCategory {
    return {
      id: dbCategory.id,
      name: dbCategory.name,
      slug: dbCategory.slug,
      order: dbCategory.order,
      isActive: dbCategory.is_active,
    };
  }

  private mapDbGameToListItem(dbGame: DbGameWithJoins): CasinoGameListItem {
    return {
      id: dbGame.id,
      name: dbGame.name,
      thumbnail: dbGame.thumbnail,
      providerName: dbGame.provider_name || null,
      categorySlug: dbGame.category_slug || null,
    };
  }

  async getProviders(): Promise<CasinoProvider[]> {
    const providers = await db<DbCasinoProvider>('casino_providers')
      .where('is_active', true)
      .orderBy('name', 'asc');

    return providers.map((p) => this.mapDbProviderToProvider(p));
  }

  async getCategories(): Promise<CasinoCategory[]> {
    const categories = await db<DbCasinoCategory>('casino_categories')
      .where('is_active', true)
      .orderBy('order', 'asc');

    return categories.map((c) => this.mapDbCategoryToCategory(c));
  }

  async getGames(query: CasinoGamesQuery): Promise<CasinoGamesResponse> {
    const { categoryId, categorySlug, providerId, providerCode, search, limit = 20, offset = 0 } = query;

    let baseQuery = db('casino_games as g')
      .leftJoin('casino_providers as p', 'g.provider_id', 'p.id')
      .leftJoin('casino_categories as c', 'g.category_id', 'c.id')
      .where('g.is_active', true);

    // Apply filters
    if (categoryId) {
      baseQuery = baseQuery.where('g.category_id', categoryId);
    }

    if (categorySlug) {
      baseQuery = baseQuery.where('c.slug', categorySlug);
    }

    if (providerId) {
      baseQuery = baseQuery.where('g.provider_id', providerId);
    }

    if (providerCode) {
      baseQuery = baseQuery.where('p.code', providerCode);
    }

    if (search) {
      baseQuery = baseQuery.where('g.name', 'ilike', `%${search}%`);
    }

    // Get total count
    const countResult = await baseQuery.clone().count('g.id as count').first() as { count: string } | undefined;
    const total = parseInt(countResult?.count || '0', 10);

    // Get games with pagination
    const games = await baseQuery
      .select(
        'g.id',
        'g.name',
        'g.thumbnail',
        'g.game_code',
        'p.name as provider_name',
        'c.slug as category_slug'
      )
      .orderBy('g.name', 'asc')
      .limit(limit)
      .offset(offset) as DbGameWithJoins[];

    return {
      games: games.map((g) => this.mapDbGameToListItem(g)),
      total,
      limit,
      offset,
    };
  }

  async getGameById(gameId: string): Promise<CasinoGame> {
    const game = await db('casino_games as g')
      .leftJoin('casino_providers as p', 'g.provider_id', 'p.id')
      .leftJoin('casino_categories as c', 'g.category_id', 'c.id')
      .where('g.id', gameId)
      .select(
        'g.*',
        'p.name as provider_name',
        'p.code as provider_code',
        'c.name as category_name',
        'c.slug as category_slug'
      )
      .first();

    if (!game) {
      throw new NotFoundError('Game not found');
    }

    return {
      id: game.id,
      providerId: game.provider_id,
      categoryId: game.category_id,
      name: game.name,
      thumbnail: game.thumbnail,
      gameCode: game.game_code,
      isActive: game.is_active,
      provider: game.provider_id
        ? {
            id: game.provider_id,
            name: game.provider_name,
            code: game.provider_code,
            isActive: true,
          }
        : undefined,
      category: game.category_id
        ? {
            id: game.category_id,
            name: game.category_name,
            slug: game.category_slug,
            order: 0,
            isActive: true,
          }
        : undefined,
    };
  }

  async launchGame(userId: string, gameId: string, mode: 'real' | 'demo'): Promise<GameLaunchResponse> {
    const game = await db<DbCasinoGame>('casino_games')
      .where('id', gameId)
      .where('is_active', true)
      .first();

    if (!game) {
      throw new NotFoundError('Game not found');
    }

    // Use transaction with row lock for balance check to prevent race conditions
    if (mode === 'real') {
      await db.transaction(async (trx) => {
        // Lock the wallet row to prevent concurrent balance checks
        const wallet = await trx('wallets')
          .where('user_id', userId)
          .forUpdate()
          .first();

        if (!wallet || parseFloat(wallet.balance) <= 0) {
          throw new BadRequestError('Insufficient balance to play');
        }

        // Note: In production, you might deduct a minimum bet here
        // or reserve balance for the session
      });
    }

    // Generate session (in real implementation, this would call the game provider API)
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Build launch URL (stub - real implementation would get URL from provider)
    const launchUrl = `https://games.example.com/launch/${game.game_code}?session=${sessionId}&mode=${mode}&user=${userId}`;

    return {
      launchUrl,
      sessionId,
      expiresAt: expiresAt.toISOString(),
    };
  }
}

export const casinoService = new CasinoService();
