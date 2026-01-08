import { useMemo } from 'react';
import { useGetGamesQuery, useGetLiveGamesQuery } from '@/features/sports/api';
import type { Game } from '@/features/sports/types';

interface UseRelatedGamesOptions {
  gameId: string;
  competitionId?: number;
  isLive?: boolean;
  limit?: number;
}

interface UseRelatedGamesResult {
  relatedGames: Game[];
  isLoading: boolean;
  isEmpty: boolean;
}

export const useRelatedGames = ({
  gameId,
  competitionId,
  isLive = false,
  limit = 10,
}: UseRelatedGamesOptions): UseRelatedGamesResult => {
  // Fetch games in the same competition
  const {
    data: competitionGames,
    isLoading: isLoadingCompetition,
  } = useGetGamesQuery(
    { competitionId, limit: limit + 1 }, // +1 to account for current game
    { skip: !competitionId }
  );

  // Fetch other live games if current game is live
  const {
    data: liveGames,
    isLoading: isLoadingLive,
  } = useGetLiveGamesQuery(limit + 1, { skip: !isLive });

  const relatedGames = useMemo((): Game[] => {
    const games: Game[] = [];
    const seenIds = new Set<string>([gameId]); // Exclude current game

    // Add competition games first (higher priority)
    if (competitionGames?.games) {
      for (const game of competitionGames.games) {
        if (!seenIds.has(game.id) && games.length < limit) {
          games.push(game);
          seenIds.add(game.id);
        }
      }
    }

    // Add other live games if still have room and current game is live
    if (isLive && liveGames && games.length < limit) {
      for (const game of liveGames) {
        if (!seenIds.has(game.id) && games.length < limit) {
          games.push(game);
          seenIds.add(game.id);
        }
      }
    }

    return games;
  }, [gameId, competitionGames, liveGames, isLive, limit]);

  const isLoading = isLoadingCompetition || isLoadingLive;
  const isEmpty = !isLoading && relatedGames.length === 0;

  return {
    relatedGames,
    isLoading,
    isEmpty,
  };
};
