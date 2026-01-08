export interface CasinoProvider {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
}

export interface CasinoCategory {
  id: number;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
}

export interface CasinoGame {
  id: string;
  providerId: number | null;
  categoryId: number | null;
  name: string;
  thumbnail: string | null;
  gameCode: string;
  isActive: boolean;
  provider?: CasinoProvider;
  category?: CasinoCategory;
}

export interface CasinoGameListItem {
  id: string;
  name: string;
  thumbnail: string | null;
  providerName: string | null;
  categorySlug: string | null;
}

export interface CasinoGamesQuery {
  categoryId?: number;
  categorySlug?: string;
  providerId?: number;
  providerCode?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CasinoGamesResponse {
  games: CasinoGameListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface GameLaunchRequest {
  gameId: string;
  mode?: 'real' | 'demo';
}

export interface GameLaunchResponse {
  launchUrl: string;
  sessionId: string;
  expiresAt: string;
}
