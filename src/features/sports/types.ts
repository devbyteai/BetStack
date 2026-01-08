export interface Sport {
  id: number;
  externalId: number;
  name: string;
  alias: string;
  type: number;
  order: number;
  isActive: boolean;
  gamesCount?: number;
}

export interface Region {
  id: number;
  externalId: number;
  sportId: number;
  name: string;
  alias: string;
  order: number;
  gamesCount?: number;
}

export interface Competition {
  id: number;
  externalId: number;
  regionId: number;
  name: string;
  order: number;
  isActive: boolean;
  gamesCount?: number;
}

export interface Game {
  id: string;
  externalId: number;
  competitionId: number;
  team1Name: string;
  team2Name: string;
  team1Id?: number;
  team2Id?: number;
  startTs: string;
  type: number;
  isLive: boolean;
  isBlocked: boolean;
  videoId?: string;
  tvType?: string;
  info?: GameInfo;
  marketsCount: number;
  competition?: Competition;
  markets?: Market[];
  sportAlias?: string;
}

export interface GameInfo {
  score?: {
    team1: number;
    team2: number;
  };
  currentPeriod?: string;
  time?: number;
  stats?: Record<string, unknown>;
}

export interface Market {
  id: string;
  externalId: number;
  gameId: string;
  name: string;
  type?: string;
  displayKey?: string;
  displaySubKey?: string;
  expressId?: number;
  base?: number;
  order: number;
  colCount: number;
  groupId?: number;
  groupName?: string;
  cashoutEnabled: boolean;
  isSuspended: boolean;
  events?: Event[];
}

export interface Event {
  id: string;
  externalId: number;
  marketId: string;
  name: string;
  type?: string;
  price: number;
  base?: number;
  order: number;
  isSuspended: boolean;
}

export interface GetGamesParams {
  sportId?: number;
  regionId?: number;
  competitionId?: number;
  type?: 'prematch' | 'live' | 'finished';
  startsWithin?: number; // Minutes
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}
