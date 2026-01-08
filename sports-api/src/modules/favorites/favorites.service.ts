import { db } from '../../config/database.js';
import { AppError } from '../../shared/errors/AppError.js';
import type { Favorite, FavoriteResponse } from './favorites.types.js';
import type { CreateFavoriteInput } from './favorites.schema.js';

interface FavoriteRow {
  id: string;
  userId: string;
  gameId: string | null;
  competitionId: number | null;
  createdAt: string;
  game_id: string | null;
  game_team1Name: string | null;
  game_team2Name: string | null;
  game_startTs: string | null;
  game_isLive: boolean | null;
  comp_id: number | null;
  comp_name: string | null;
}

class FavoritesService {
  async getFavorites(userId: string): Promise<Favorite[]> {
    const favorites = await db('favorites')
      .select(
        'favorites.id',
        'favorites.user_id as userId',
        'favorites.game_id as gameId',
        'favorites.competition_id as competitionId',
        'favorites.created_at as createdAt',
        'games.id as game_id',
        'games.team1_name as game_team1Name',
        'games.team2_name as game_team2Name',
        'games.start_ts as game_startTs',
        'games.is_live as game_isLive',
        'competitions.id as comp_id',
        'competitions.name as comp_name'
      )
      .leftJoin('games', 'favorites.game_id', 'games.id')
      .leftJoin('competitions', 'games.competition_id', 'competitions.id')
      .where('favorites.user_id', userId)
      .orderBy('favorites.created_at', 'desc');

    return (favorites as FavoriteRow[]).map((row): Favorite => ({
      id: row.id,
      userId: row.userId,
      gameId: row.gameId,
      competitionId: row.competitionId,
      createdAt: row.createdAt,
      game: row.game_id && row.game_team1Name && row.game_team2Name && row.game_startTs !== null ? {
        id: row.game_id,
        team1Name: row.game_team1Name,
        team2Name: row.game_team2Name,
        startTs: row.game_startTs,
        isLive: row.game_isLive ?? false,
        competition: row.comp_id && row.comp_name ? {
          id: row.comp_id,
          name: row.comp_name,
        } : undefined,
      } : undefined,
      competition: !row.game_id && row.competitionId && row.comp_name ? {
        id: row.competitionId,
        name: row.comp_name,
      } : undefined,
    }));
  }

  async addFavorite(userId: string, input: CreateFavoriteInput): Promise<FavoriteResponse> {
    const { gameId, competitionId } = input;

    // Check if favorite already exists
    const existingQuery = db('favorites').where('user_id', userId);

    if (gameId) {
      existingQuery.andWhere('game_id', gameId);
    } else if (competitionId) {
      existingQuery.andWhere('competition_id', competitionId);
    }

    const existing = await existingQuery.first();

    if (existing) {
      throw new AppError('Already in favorites', 400);
    }

    // Verify game or competition exists
    if (gameId) {
      const game = await db('games').where('id', gameId).first();
      if (!game) {
        throw new AppError('Game not found', 404);
      }
    } else if (competitionId) {
      const competition = await db('competitions').where('id', competitionId).first();
      if (!competition) {
        throw new AppError('Competition not found', 404);
      }
    }

    const [favorite] = await db('favorites')
      .insert({
        user_id: userId,
        game_id: gameId || null,
        competition_id: competitionId || null,
      })
      .returning(['id', 'user_id as userId', 'game_id as gameId', 'competition_id as competitionId', 'created_at as createdAt']);

    return favorite;
  }

  async removeFavorite(userId: string, favoriteId: string): Promise<void> {
    const deleted = await db('favorites')
      .where('id', favoriteId)
      .andWhere('user_id', userId)
      .del();

    if (!deleted) {
      throw new AppError('Favorite not found', 404);
    }
  }

  async isFavorite(userId: string, gameId?: string, competitionId?: number): Promise<boolean> {
    const query = db('favorites').where('user_id', userId);

    if (gameId) {
      query.andWhere('game_id', gameId);
    } else if (competitionId) {
      query.andWhere('competition_id', competitionId);
    } else {
      return false;
    }

    const favorite = await query.first();
    return !!favorite;
  }
}

export const favoritesService = new FavoritesService();
