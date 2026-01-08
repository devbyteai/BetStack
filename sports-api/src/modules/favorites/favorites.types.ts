export interface Favorite {
  id: string;
  userId: string;
  gameId?: string | null;
  competitionId?: number | null;
  createdAt: string;
  game?: {
    id: string;
    team1Name: string;
    team2Name: string;
    startTs: string;
    isLive: boolean;
    competition?: {
      id: number;
      name: string;
    };
  };
  competition?: {
    id: number;
    name: string;
  };
}

export interface FavoriteResponse {
  id: string;
  userId: string;
  gameId?: string | null;
  competitionId?: number | null;
  createdAt: string;
}
