import { useEffect, useState, useCallback, useRef } from 'react';
import { useWebSocket } from '../api/WebSocketProvider';
import type {
  OddsUpdateData,
  GameStatusData,
  BalanceUpdateData,
  BetPlacedData,
  BetSettledData,
  CashoutResultData,
  MarketSuspendData,
} from '../api/wsTypes';

/**
 * Hook to subscribe to live odds updates for specific games
 */
export const useLiveOdds = (gameIds: string[]) => {
  const { subscribe, unsubscribe, onOddsUpdate, onOddsUpdateBatch, isConnected } = useWebSocket();
  const [oddsUpdates, setOddsUpdates] = useState<Map<string, OddsUpdateData>>(new Map());
  const subscribedGames = useRef<Set<string>>(new Set());

  // Subscribe to game rooms
  useEffect(() => {
    if (!isConnected) return;

    // Subscribe to new games
    gameIds.forEach((gameId) => {
      if (!subscribedGames.current.has(gameId)) {
        subscribe('game', gameId);
        subscribedGames.current.add(gameId);
      }
    });

    // Unsubscribe from removed games
    subscribedGames.current.forEach((gameId) => {
      if (!gameIds.includes(gameId)) {
        unsubscribe('game', gameId);
        subscribedGames.current.delete(gameId);
      }
    });

    return () => {
      // Cleanup all subscriptions
      subscribedGames.current.forEach((gameId) => {
        unsubscribe('game', gameId);
      });
      subscribedGames.current.clear();
    };
  }, [gameIds, isConnected, subscribe, unsubscribe]);

  // Handle single odds update
  useEffect(() => {
    const cleanup = onOddsUpdate((data) => {
      if (gameIds.includes(data.gameId)) {
        setOddsUpdates((prev) => {
          const newMap = new Map(prev);
          newMap.set(data.eventId, data);
          return newMap;
        });
      }
    });
    return cleanup;
  }, [gameIds, onOddsUpdate]);

  // Handle batch odds updates
  useEffect(() => {
    const cleanup = onOddsUpdateBatch((updates) => {
      setOddsUpdates((prev) => {
        const newMap = new Map(prev);
        updates.forEach((update) => {
          if (gameIds.includes(update.gameId)) {
            newMap.set(update.eventId, update);
          }
        });
        return newMap;
      });
    });
    return cleanup;
  }, [gameIds, onOddsUpdateBatch]);

  // Get odds for a specific event
  const getOdds = useCallback((eventId: string): OddsUpdateData | undefined => {
    return oddsUpdates.get(eventId);
  }, [oddsUpdates]);

  // Clear odds data
  const clearOdds = useCallback(() => {
    setOddsUpdates(new Map());
  }, []);

  return { oddsUpdates, getOdds, clearOdds, isConnected };
};

/**
 * Hook for real-time game status updates (scores, time, period)
 */
export const useGameStatus = (gameId: string | null) => {
  const { subscribe, unsubscribe, onGameStatus, isConnected } = useWebSocket();
  const [gameStatus, setGameStatus] = useState<GameStatusData | null>(null);

  useEffect(() => {
    if (!isConnected || !gameId) return;

    subscribe('game', gameId);

    return () => {
      unsubscribe('game', gameId);
    };
  }, [gameId, isConnected, subscribe, unsubscribe]);

  useEffect(() => {
    const cleanup = onGameStatus((data) => {
      if (data.gameId === gameId) {
        setGameStatus(data);
      }
    });
    return cleanup;
  }, [gameId, onGameStatus]);

  return { gameStatus, isConnected };
};

/**
 * Hook for real-time balance updates
 */
export const useBalanceUpdates = () => {
  const { onBalanceUpdate, isConnected } = useWebSocket();
  const [balance, setBalance] = useState<BalanceUpdateData | null>(null);

  useEffect(() => {
    const cleanup = onBalanceUpdate((data) => {
      setBalance(data);
    });
    return cleanup;
  }, [onBalanceUpdate]);

  return { balance, isConnected };
};

/**
 * Hook for bet notifications (placed, settled)
 */
export const useBetNotifications = () => {
  const { onBetPlaced, onBetSettled, onCashoutResult, isConnected } = useWebSocket();
  const [lastBetPlaced, setLastBetPlaced] = useState<BetPlacedData | null>(null);
  const [lastBetSettled, setLastBetSettled] = useState<BetSettledData | null>(null);
  const [lastCashout, setLastCashout] = useState<CashoutResultData | null>(null);

  useEffect(() => {
    const cleanupPlaced = onBetPlaced((data) => {
      setLastBetPlaced(data);
    });
    return cleanupPlaced;
  }, [onBetPlaced]);

  useEffect(() => {
    const cleanupSettled = onBetSettled((data) => {
      setLastBetSettled(data);
    });
    return cleanupSettled;
  }, [onBetSettled]);

  useEffect(() => {
    const cleanupCashout = onCashoutResult((data) => {
      setLastCashout(data);
    });
    return cleanupCashout;
  }, [onCashoutResult]);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setLastBetPlaced(null);
    setLastBetSettled(null);
    setLastCashout(null);
  }, []);

  return {
    lastBetPlaced,
    lastBetSettled,
    lastCashout,
    clearNotifications,
    isConnected,
  };
};

/**
 * Hook for market suspension updates
 */
export const useMarketSuspension = (gameId: string | null) => {
  const { subscribe, unsubscribe, onMarketSuspend, isConnected } = useWebSocket();
  const [suspendedMarkets, setSuspendedMarkets] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    if (!isConnected || !gameId) return;

    subscribe('game', gameId);

    return () => {
      unsubscribe('game', gameId);
    };
  }, [gameId, isConnected, subscribe, unsubscribe]);

  useEffect(() => {
    const cleanup = onMarketSuspend((data) => {
      if (data.gameId === gameId) {
        setSuspendedMarkets((prev) => {
          const newMap = new Map(prev);
          newMap.set(data.marketId, data.isSuspended);
          return newMap;
        });
      }
    });
    return cleanup;
  }, [gameId, onMarketSuspend]);

  const isMarketSuspended = useCallback((marketId: string): boolean => {
    return suspendedMarkets.get(marketId) ?? false;
  }, [suspendedMarkets]);

  return { suspendedMarkets, isMarketSuspended, isConnected };
};

/**
 * Hook for subscribing to all live games
 */
export const useLiveGamesSubscription = () => {
  const { subscribe, unsubscribe, onOddsUpdate, onOddsUpdateBatch, onGameStatus, isConnected } = useWebSocket();
  const [liveUpdates, setLiveUpdates] = useState<{
    odds: Map<string, OddsUpdateData>;
    games: Map<string, GameStatusData>;
  }>({ odds: new Map(), games: new Map() });

  useEffect(() => {
    if (!isConnected) return;

    // Subscribe to the live room for all live game updates
    subscribe('live', 'all');

    return () => {
      unsubscribe('live', 'all');
    };
  }, [isConnected, subscribe, unsubscribe]);

  // Handle odds updates
  useEffect(() => {
    const cleanup = onOddsUpdate((data) => {
      setLiveUpdates((prev) => ({
        ...prev,
        odds: new Map(prev.odds).set(data.eventId, data),
      }));
    });
    return cleanup;
  }, [onOddsUpdate]);

  useEffect(() => {
    const cleanup = onOddsUpdateBatch((updates) => {
      setLiveUpdates((prev) => {
        const newOdds = new Map(prev.odds);
        updates.forEach((update) => {
          newOdds.set(update.eventId, update);
        });
        return { ...prev, odds: newOdds };
      });
    });
    return cleanup;
  }, [onOddsUpdateBatch]);

  // Handle game status updates
  useEffect(() => {
    const cleanup = onGameStatus((data) => {
      setLiveUpdates((prev) => ({
        ...prev,
        games: new Map(prev.games).set(data.gameId, data),
      }));
    });
    return cleanup;
  }, [onGameStatus]);

  return { liveUpdates, isConnected };
};

/**
 * Hook for WebSocket connection status with auto-reconnect indicator
 */
export const useConnectionStatus = () => {
  const { isConnected, onError } = useWebSocket();
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    const cleanup = onError((data) => {
      setLastError(data.message);
    });
    return cleanup;
  }, [onError]);

  return { isConnected, lastError };
};
