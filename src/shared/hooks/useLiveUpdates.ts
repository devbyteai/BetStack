import { useEffect, useState, useCallback, useRef } from 'react';
import { wsClient } from '../api/wsClient';

// Types for live update events
export interface OddsUpdate {
  eventId: string;
  marketId: string;
  gameId: string;
  price: number;
  previousPrice: number;
  direction: 'up' | 'down' | 'same';
}

export interface GameStatusUpdate {
  gameId: string;
  isLive: boolean;
  info: {
    score1?: number;
    score2?: number;
    currentPeriod?: string;
    currentTime?: string;
    stats?: Record<string, unknown>;
  };
}

export interface MarketSuspendUpdate {
  marketId: string;
  gameId: string;
  isSuspended: boolean;
}

interface UseLiveOddsOptions {
  gameId?: string;
  onUpdate?: (update: OddsUpdate) => void;
  onBatchUpdate?: (updates: OddsUpdate[]) => void;
}

export const useLiveOdds = ({ gameId, onUpdate, onBatchUpdate }: UseLiveOddsOptions = {}) => {
  const [oddsUpdates, setOddsUpdates] = useState<Map<string, OddsUpdate>>(new Map());
  const callbacksRef = useRef({ onUpdate, onBatchUpdate });

  // Keep callbacks ref updated
  useEffect(() => {
    callbacksRef.current = { onUpdate, onBatchUpdate };
  }, [onUpdate, onBatchUpdate]);

  useEffect(() => {
    const handleOddsUpdate = (data: OddsUpdate) => {
      // Filter by gameId if specified
      if (gameId && data.gameId !== gameId) return;

      setOddsUpdates((prev) => {
        const newMap = new Map(prev);
        newMap.set(data.eventId, data);
        return newMap;
      });

      callbacksRef.current.onUpdate?.(data);
    };

    const handleOddsBatchUpdate = (updates: OddsUpdate[]) => {
      const filtered = gameId ? updates.filter((u) => u.gameId === gameId) : updates;
      if (filtered.length === 0) return;

      setOddsUpdates((prev) => {
        const newMap = new Map(prev);
        for (const update of filtered) {
          newMap.set(update.eventId, update);
        }
        return newMap;
      });

      callbacksRef.current.onBatchUpdate?.(filtered);
    };

    wsClient.on('odds:update', handleOddsUpdate);
    wsClient.on('odds:update:batch', handleOddsBatchUpdate);

    return () => {
      wsClient.off('odds:update', handleOddsUpdate);
      wsClient.off('odds:update:batch', handleOddsBatchUpdate);
    };
  }, [gameId]);

  const getOddsForEvent = useCallback(
    (eventId: string) => oddsUpdates.get(eventId),
    [oddsUpdates]
  );

  const clearOddsCache = useCallback(() => {
    setOddsUpdates(new Map());
  }, []);

  return {
    oddsUpdates,
    getOddsForEvent,
    clearOddsCache,
  };
};

interface UseLiveGameStatusOptions {
  gameId?: string;
  onStatusUpdate?: (status: GameStatusUpdate) => void;
}

export const useLiveGameStatus = ({ gameId, onStatusUpdate }: UseLiveGameStatusOptions = {}) => {
  const [gameStatuses, setGameStatuses] = useState<Map<string, GameStatusUpdate>>(new Map());
  const callbackRef = useRef(onStatusUpdate);

  useEffect(() => {
    callbackRef.current = onStatusUpdate;
  }, [onStatusUpdate]);

  useEffect(() => {
    const handleGameStatus = (data: GameStatusUpdate) => {
      if (gameId && data.gameId !== gameId) return;

      setGameStatuses((prev) => {
        const newMap = new Map(prev);
        newMap.set(data.gameId, data);
        return newMap;
      });

      callbackRef.current?.(data);
    };

    const handleGameStart = (data: { gameId: string }) => {
      if (gameId && data.gameId !== gameId) return;
      console.log('Game started:', data.gameId);
    };

    const handleGameEnd = (data: { gameId: string; result: { score1: number; score2: number } }) => {
      if (gameId && data.gameId !== gameId) return;
      console.log('Game ended:', data.gameId, 'Result:', data.result);
    };

    wsClient.on('game:status', handleGameStatus);
    wsClient.on('game:start', handleGameStart);
    wsClient.on('game:end', handleGameEnd);

    return () => {
      wsClient.off('game:status', handleGameStatus);
      wsClient.off('game:start', handleGameStart);
      wsClient.off('game:end', handleGameEnd);
    };
  }, [gameId]);

  const getGameStatus = useCallback(
    (id: string) => gameStatuses.get(id),
    [gameStatuses]
  );

  return {
    gameStatuses,
    getGameStatus,
  };
};

interface UseMarketSuspensionOptions {
  gameId?: string;
  onSuspend?: (data: MarketSuspendUpdate) => void;
}

export const useMarketSuspension = ({ gameId, onSuspend }: UseMarketSuspensionOptions = {}) => {
  const [suspendedMarkets, setSuspendedMarkets] = useState<Set<string>>(new Set());
  const callbackRef = useRef(onSuspend);

  useEffect(() => {
    callbackRef.current = onSuspend;
  }, [onSuspend]);

  useEffect(() => {
    const handleMarketSuspend = (data: MarketSuspendUpdate) => {
      if (gameId && data.gameId !== gameId) return;

      setSuspendedMarkets((prev) => {
        const newSet = new Set(prev);
        if (data.isSuspended) {
          newSet.add(data.marketId);
        } else {
          newSet.delete(data.marketId);
        }
        return newSet;
      });

      callbackRef.current?.(data);
    };

    wsClient.on('market:suspend', handleMarketSuspend);

    return () => {
      wsClient.off('market:suspend', handleMarketSuspend);
    };
  }, [gameId]);

  const isMarketSuspended = useCallback(
    (marketId: string) => suspendedMarkets.has(marketId),
    [suspendedMarkets]
  );

  return {
    suspendedMarkets,
    isMarketSuspended,
  };
};

// ============================================
// User-specific hooks (balance, bets)
// ============================================

export interface BalanceUpdate {
  balance: number;
  bonusBalance: number;
}

export interface BetPlacedUpdate {
  betId: string;
  bookingCode: string;
  status: string;
}

export interface BetSettledUpdate {
  betId: string;
  status: 'pending' | 'won' | 'lost' | 'cashout' | 'cancelled' | 'returned';
  payout?: number;
}

export interface CashoutResultUpdate {
  betId: string;
  amount: number;
  success: boolean;
}

interface UseBalanceUpdatesOptions {
  onUpdate?: (data: BalanceUpdate) => void;
}

export const useBalanceUpdates = ({ onUpdate }: UseBalanceUpdatesOptions = {}) => {
  const [balance, setBalance] = useState<BalanceUpdate | null>(null);
  const callbackRef = useRef(onUpdate);

  useEffect(() => {
    callbackRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    const handleBalanceUpdate = (data: BalanceUpdate) => {
      setBalance(data);
      callbackRef.current?.(data);
    };

    wsClient.on('balance:update', handleBalanceUpdate);

    return () => {
      wsClient.off('balance:update', handleBalanceUpdate);
    };
  }, []);

  return { balance };
};

interface UseBetNotificationsOptions {
  onBetPlaced?: (data: BetPlacedUpdate) => void;
  onBetSettled?: (data: BetSettledUpdate) => void;
  onCashoutResult?: (data: CashoutResultUpdate) => void;
}

export const useBetNotifications = ({
  onBetPlaced,
  onBetSettled,
  onCashoutResult,
}: UseBetNotificationsOptions = {}) => {
  const [lastBetPlaced, setLastBetPlaced] = useState<BetPlacedUpdate | null>(null);
  const [lastBetSettled, setLastBetSettled] = useState<BetSettledUpdate | null>(null);
  const [lastCashout, setLastCashout] = useState<CashoutResultUpdate | null>(null);
  const callbacksRef = useRef({ onBetPlaced, onBetSettled, onCashoutResult });

  useEffect(() => {
    callbacksRef.current = { onBetPlaced, onBetSettled, onCashoutResult };
  }, [onBetPlaced, onBetSettled, onCashoutResult]);

  useEffect(() => {
    const handleBetPlaced = (data: BetPlacedUpdate) => {
      setLastBetPlaced(data);
      callbacksRef.current.onBetPlaced?.(data);
    };

    const handleBetSettled = (data: BetSettledUpdate) => {
      setLastBetSettled(data);
      callbacksRef.current.onBetSettled?.(data);
    };

    const handleCashoutResult = (data: CashoutResultUpdate) => {
      setLastCashout(data);
      callbacksRef.current.onCashoutResult?.(data);
    };

    wsClient.on('bet:placed', handleBetPlaced);
    wsClient.on('bet:settled', handleBetSettled);
    wsClient.on('cashout:result', handleCashoutResult);

    return () => {
      wsClient.off('bet:placed', handleBetPlaced);
      wsClient.off('bet:settled', handleBetSettled);
      wsClient.off('cashout:result', handleCashoutResult);
    };
  }, []);

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
  };
};

// Hook for WebSocket connection status
export const useWebSocketStatus = () => {
  const [isConnected, setIsConnected] = useState(wsClient.isConnected());

  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(wsClient.isConnected());
    };

    // Check immediately
    checkConnection();

    // Poll connection status (socket.io doesn't have a direct event for this)
    const interval = setInterval(checkConnection, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return { isConnected };
};
