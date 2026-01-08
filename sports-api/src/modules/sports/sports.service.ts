import { db } from '../../config/database.js';
import { oddsCache } from '../../config/redis.js';
import { NotFoundError } from '../../shared/errors/index.js';
import type {
  Sport,
  Region,
  Competition,
  Game,
  Market,
  Event,
} from './sports.types.js';
import type { GetSportsQuery } from './sports.schema.js';

interface GetGamesParams {
  sportId?: number;
  regionId?: number;
  competitionId?: number;
  type?: 'prematch' | 'live' | 'finished';
  startsWithin?: number; // Minutes
  limit?: number;
  offset?: number;
}

export class SportsService {
  async getSports(query: GetSportsQuery = {}): Promise<Sport[]> {
    const { type } = query;

    let sportsQuery = db('sports')
      .select('sports.*')
      .where('sports.is_active', true)
      .orderBy('sports.order', 'asc');

    if (type) {
      const isLive = type === 'live';
      sportsQuery = sportsQuery
        .leftJoin('regions', 'sports.id', 'regions.sport_id')
        .leftJoin('competitions', 'regions.id', 'competitions.region_id')
        .leftJoin('games', 'competitions.id', 'games.competition_id')
        .where('games.is_live', isLive)
        .where('games.is_blocked', false)
        .groupBy('sports.id')
        .select(db.raw('COUNT(DISTINCT games.id) as games_count'));
    }

    const sports = await sportsQuery;

    return sports.map((s: Record<string, unknown>) => ({
      id: s.id as number,
      externalId: s.external_id as number,
      name: s.name as string,
      alias: s.alias as string,
      type: s.type as number,
      order: s.order as number,
      isActive: s.is_active as boolean,
      gamesCount: s.games_count ? parseInt(s.games_count as string, 10) : 0,
    }));
  }

  async getRegions(sportId: number): Promise<Region[]> {
    const regions = await db('regions')
      .select('regions.*')
      .leftJoin('competitions', 'regions.id', 'competitions.region_id')
      .leftJoin('games', 'competitions.id', 'games.competition_id')
      .where('regions.sport_id', sportId)
      .where('games.is_blocked', false)
      .groupBy('regions.id')
      .select(db.raw('COUNT(DISTINCT games.id) as games_count'))
      .orderBy('regions.order', 'asc');

    return regions.map((r: Record<string, unknown>) => ({
      id: r.id as number,
      externalId: r.external_id as number,
      sportId: r.sport_id as number,
      name: r.name as string,
      alias: r.alias as string,
      order: r.order as number,
      gamesCount: r.games_count ? parseInt(r.games_count as string, 10) : 0,
    }));
  }

  async getCompetitions(regionId: number): Promise<Competition[]> {
    const competitions = await db('competitions')
      .select('competitions.*')
      .leftJoin('games', 'competitions.id', 'games.competition_id')
      .where('competitions.region_id', regionId)
      .where('competitions.is_active', true)
      .where('games.is_blocked', false)
      .groupBy('competitions.id')
      .select(db.raw('COUNT(DISTINCT games.id) as games_count'))
      .orderBy('competitions.order', 'asc');

    return competitions.map((c: Record<string, unknown>) => ({
      id: c.id as number,
      externalId: c.external_id as number,
      regionId: c.region_id as number,
      name: c.name as string,
      order: c.order as number,
      isActive: c.is_active as boolean,
      gamesCount: c.games_count ? parseInt(c.games_count as string, 10) : 0,
    }));
  }

  async getGames(query: GetGamesParams = {}): Promise<{ games: Game[]; total: number }> {
    const { sportId, regionId, competitionId, type, startsWithin, limit = 50, offset = 0 } = query;

    let gamesQuery = db('games')
      .select(
        'games.*',
        'competitions.name as competition_name',
        'competitions.id as competition_id'
      )
      .leftJoin('competitions', 'games.competition_id', 'competitions.id')
      .leftJoin('regions', 'competitions.region_id', 'regions.id')
      .where('games.is_blocked', false)
      .orderBy('games.start_ts', 'asc');

    if (sportId) {
      gamesQuery = gamesQuery.where('regions.sport_id', sportId);
    }
    if (regionId) {
      gamesQuery = gamesQuery.where('regions.id', regionId);
    }
    if (competitionId) {
      gamesQuery = gamesQuery.where('competitions.id', competitionId);
    }
    if (type === 'live') {
      gamesQuery = gamesQuery.where('games.is_live', true);
    } else if (type === 'prematch') {
      gamesQuery = gamesQuery
        .where('games.is_live', false)
        .where('games.start_ts', '>', new Date());
    } else if (type === 'finished') {
      gamesQuery = gamesQuery
        .where('games.is_live', false)
        .where('games.start_ts', '<', new Date())
        .orderBy('games.start_ts', 'desc'); // Most recent first for results
    }
    if (startsWithin) {
      const now = new Date();
      const endTime = new Date(now.getTime() + startsWithin * 60 * 1000);
      gamesQuery = gamesQuery
        .where('games.start_ts', '>=', now)
        .where('games.start_ts', '<=', endTime);
    }

    // Get total count
    const countResult = await gamesQuery.clone().count('games.id as count').first();
    const total = parseInt((countResult?.count as string) || '0', 10);

    // Get paginated games
    const games = await gamesQuery.limit(limit).offset(offset);

    return {
      games: games.map((g: Record<string, unknown>) => this.mapGame(g)),
      total,
    };
  }

  async getGame(gameId: string, withMarkets = false): Promise<Game> {
    const game = await db('games')
      .select(
        'games.*',
        'competitions.name as competition_name'
      )
      .leftJoin('competitions', 'games.competition_id', 'competitions.id')
      .where('games.id', gameId)
      .first();

    if (!game) {
      throw new NotFoundError('Game not found');
    }

    const mappedGame = this.mapGame(game);

    if (withMarkets) {
      mappedGame.markets = await this.getGameMarkets(gameId);
    }

    return mappedGame;
  }

  async getGameMarkets(gameId: string): Promise<Market[]> {
    // Check cache first
    const cached = await oddsCache.getGameOdds<Market[]>(gameId);
    if (cached) {
      return cached;
    }

    const markets = await db('markets')
      .select('markets.*')
      .where('markets.game_id', gameId)
      .where('markets.is_suspended', false)
      .orderBy('markets.order', 'asc');

    const marketIds = markets.map((m: Record<string, unknown>) => m.id as string);

    const events = await db('events')
      .select('events.*')
      .whereIn('events.market_id', marketIds)
      .orderBy('events.order', 'asc');

    const eventsMap = new Map<string, Event[]>();
    events.forEach((e: Record<string, unknown>) => {
      const marketId = e.market_id as string;
      if (!eventsMap.has(marketId)) {
        eventsMap.set(marketId, []);
      }
      eventsMap.get(marketId)!.push(this.mapEvent(e));
    });

    const mappedMarkets = markets.map((m: Record<string, unknown>) => ({
      ...this.mapMarket(m),
      events: eventsMap.get(m.id as string) || [],
    }));

    // Cache for 60 seconds
    await oddsCache.setGameOdds(gameId, mappedMarkets, 60);

    return mappedMarkets;
  }

  async getLiveGames(limit = 20): Promise<Game[]> {
    const games = await db('games')
      .select(
        'games.*',
        'competitions.name as competition_name',
        'regions.name as region_name',
        'sports.alias as sport_alias'
      )
      .leftJoin('competitions', 'games.competition_id', 'competitions.id')
      .leftJoin('regions', 'competitions.region_id', 'regions.id')
      .leftJoin('sports', 'regions.sport_id', 'sports.id')
      .where('games.is_live', true)
      .where('games.is_blocked', false)
      .orderBy('games.start_ts', 'desc')
      .limit(limit);

    return games.map((g: Record<string, unknown>) => this.mapGame(g));
  }

  async getFeaturedGames(limit = 10): Promise<Game[]> {
    const games = await db('games')
      .select(
        'games.*',
        'competitions.name as competition_name'
      )
      .leftJoin('competitions', 'games.competition_id', 'competitions.id')
      .where('games.is_blocked', false)
      .where('games.start_ts', '>', new Date())
      .orderBy('games.markets_count', 'desc')
      .limit(limit);

    return games.map((g: Record<string, unknown>) => this.mapGame(g));
  }

  async searchGames(query: string, limit = 20): Promise<Game[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = `%${query.trim().toLowerCase()}%`;

    const games = await db('games')
      .select(
        'games.*',
        'competitions.name as competition_name',
        'regions.name as region_name',
        'sports.alias as sport_alias',
        'sports.name as sport_name'
      )
      .leftJoin('competitions', 'games.competition_id', 'competitions.id')
      .leftJoin('regions', 'competitions.region_id', 'regions.id')
      .leftJoin('sports', 'regions.sport_id', 'sports.id')
      .where('games.is_blocked', false)
      .where('games.start_ts', '>', new Date())
      .andWhere(function() {
        this.whereRaw('LOWER(games.team1_name) LIKE ?', [searchTerm])
          .orWhereRaw('LOWER(games.team2_name) LIKE ?', [searchTerm])
          .orWhereRaw('LOWER(competitions.name) LIKE ?', [searchTerm]);
      })
      .orderBy('games.start_ts', 'asc')
      .limit(limit);

    return games.map((g: Record<string, unknown>) => ({
      ...this.mapGame(g),
      sportAlias: g.sport_alias as string | undefined,
      sportName: g.sport_name as string | undefined,
      regionName: g.region_name as string | undefined,
    }));
  }

  private mapGame(g: Record<string, unknown>): Game {
    return {
      id: g.id as string,
      externalId: g.external_id as number,
      competitionId: g.competition_id as number,
      team1Name: g.team1_name as string,
      team2Name: g.team2_name as string,
      team1Id: g.team1_id as number | undefined,
      team2Id: g.team2_id as number | undefined,
      startTs: new Date(g.start_ts as string),
      type: g.type as number,
      isLive: g.is_live as boolean,
      isBlocked: g.is_blocked as boolean,
      videoId: g.video_id as string | undefined,
      tvType: g.tv_type as string | undefined,
      info: g.info as Game['info'],
      marketsCount: g.markets_count as number,
      competition: g.competition_name
        ? {
            id: g.competition_id as number,
            externalId: 0,
            regionId: 0,
            name: g.competition_name as string,
            order: 0,
            isActive: true,
          }
        : undefined,
    };
  }

  private mapMarket(m: Record<string, unknown>): Market {
    return {
      id: m.id as string,
      externalId: m.external_id as number,
      gameId: m.game_id as string,
      name: m.name as string,
      type: m.type as string | undefined,
      displayKey: m.display_key as string | undefined,
      displaySubKey: m.display_sub_key as string | undefined,
      expressId: m.express_id as number | undefined,
      base: m.base ? parseFloat(m.base as string) : undefined,
      order: m.order as number,
      colCount: m.col_count as number,
      groupId: m.group_id as number | undefined,
      groupName: m.group_name as string | undefined,
      cashoutEnabled: m.cashout_enabled as boolean,
      isSuspended: m.is_suspended as boolean,
    };
  }

  private mapEvent(e: Record<string, unknown>): Event {
    return {
      id: e.id as string,
      externalId: e.external_id as number,
      marketId: e.market_id as string,
      name: e.name as string,
      type: e.type as string | undefined,
      price: parseFloat(e.price as string),
      base: e.base ? parseFloat(e.base as string) : undefined,
      order: e.order as number,
      isSuspended: e.is_suspended as boolean,
    };
  }
}

export const sportsService = new SportsService();
