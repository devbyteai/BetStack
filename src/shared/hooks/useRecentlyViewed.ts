import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/shared/constants/storage';

const MAX_RECENT_GAMES = 10;

interface RecentlyViewedGame {
  gameId: string;
  viewedAt: number;
}

interface UseRecentlyViewedResult {
  recentGameIds: string[];
  addGame: (gameId: string) => Promise<void>;
  clearRecent: () => Promise<void>;
  isLoading: boolean;
}

export const useRecentlyViewed = (): UseRecentlyViewedResult => {
  const [recentGames, setRecentGames] = useState<RecentlyViewedGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load recently viewed games from storage
  useEffect(() => {
    const loadRecentGames = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.RECENTLY_OPENED_GAMES);
        if (stored) {
          const parsed: RecentlyViewedGame[] = JSON.parse(stored);
          // Filter out games older than 7 days
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          const filtered = parsed.filter((g) => g.viewedAt > sevenDaysAgo);
          setRecentGames(filtered);
        }
      } catch (error) {
        console.warn('Failed to load recently viewed games:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentGames();
  }, []);

  // Add a game to recently viewed
  const addGame = useCallback(async (gameId: string) => {
    try {
      setRecentGames((prev) => {
        // Remove if already exists
        const filtered = prev.filter((g) => g.gameId !== gameId);
        // Add to front
        const updated: RecentlyViewedGame[] = [
          { gameId, viewedAt: Date.now() },
          ...filtered,
        ].slice(0, MAX_RECENT_GAMES);

        // Save to storage (fire and forget for perf)
        AsyncStorage.setItem(
          STORAGE_KEYS.RECENTLY_OPENED_GAMES,
          JSON.stringify(updated)
        ).catch((err) => console.warn('Failed to save recently viewed:', err));

        return updated;
      });
    } catch (error) {
      console.warn('Failed to add game to recently viewed:', error);
    }
  }, []);

  // Clear all recently viewed
  const clearRecent = useCallback(async () => {
    try {
      setRecentGames([]);
      await AsyncStorage.removeItem(STORAGE_KEYS.RECENTLY_OPENED_GAMES);
    } catch (error) {
      console.warn('Failed to clear recently viewed games:', error);
    }
  }, []);

  const recentGameIds = recentGames.map((g) => g.gameId);

  return {
    recentGameIds,
    addGame,
    clearRecent,
    isLoading,
  };
};
