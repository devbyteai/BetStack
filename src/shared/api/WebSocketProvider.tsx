import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { wsClient } from './wsClient';
import { useAppSelector } from '@/store/hooks';
import type {
  OddsUpdateData,
  GameStatusData,
  MarketSuspendData,
  BetPlacedData,
  BetSettledData,
  CashoutUpdateData,
  CashoutResultData,
  BalanceUpdateData,
  SubscriptionType,
  WSErrorData,
} from './wsTypes';
import { WS_EVENTS } from './wsTypes';

interface WebSocketContextValue {
  isConnected: boolean;
  subscribe: (type: SubscriptionType, id: number | string) => void;
  unsubscribe: (type: SubscriptionType, id: number | string) => void;
  // Event listeners
  onOddsUpdate: (callback: (data: OddsUpdateData) => void) => () => void;
  onOddsUpdateBatch: (callback: (data: OddsUpdateData[]) => void) => () => void;
  onGameStatus: (callback: (data: GameStatusData) => void) => () => void;
  onMarketSuspend: (callback: (data: MarketSuspendData) => void) => () => void;
  onBetPlaced: (callback: (data: BetPlacedData) => void) => () => void;
  onBetSettled: (callback: (data: BetSettledData) => void) => () => void;
  onCashoutUpdate: (callback: (data: CashoutUpdateData) => void) => () => void;
  onCashoutResult: (callback: (data: CashoutResultData) => void) => () => void;
  onBalanceUpdate: (callback: (data: BalanceUpdateData) => void) => () => void;
  onError: (callback: (data: WSErrorData) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  // Connect/disconnect based on auth state and app state
  useEffect(() => {
    const connect = async () => {
      try {
        const socket = await wsClient.connect();

        socket.on('connect', () => {
          setIsConnected(true);
        });

        socket.on('disconnect', () => {
          setIsConnected(false);
        });
      } catch (error) {
        console.error('WebSocket connection failed:', error);
      }
    };

    // Connect when app is active
    if (isAuthenticated || true) { // Always connect, auth is optional for public data
      connect();
    }

    // Handle app state changes
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        // App came to foreground, reconnect
        connect();
      } else if (nextState.match(/inactive|background/)) {
        // App went to background, keep connection but stop intensive subscriptions
      }
      appState.current = nextState;
    });

    return () => {
      subscription.remove();
      wsClient.disconnect();
    };
  }, [isAuthenticated]);

  // Subscribe to a room
  const subscribe = useCallback((type: SubscriptionType, id: number | string) => {
    wsClient.subscribe(type as 'sport' | 'game' | 'live', id);
  }, []);

  // Unsubscribe from a room
  const unsubscribe = useCallback((type: SubscriptionType, id: number | string) => {
    wsClient.unsubscribe(type as 'sport' | 'game' | 'live', id);
  }, []);

  // Generic event listener factory
  const createEventListener = useCallback(<T,>(event: string) => {
    return (callback: (data: T) => void): (() => void) => {
      wsClient.on(event, callback);
      return () => {
        wsClient.off(event, callback);
      };
    };
  }, []);

  const value: WebSocketContextValue = {
    isConnected,
    subscribe,
    unsubscribe,
    onOddsUpdate: createEventListener<OddsUpdateData>(WS_EVENTS.ODDS_UPDATE),
    onOddsUpdateBatch: createEventListener<OddsUpdateData[]>(WS_EVENTS.ODDS_UPDATE_BATCH),
    onGameStatus: createEventListener<GameStatusData>(WS_EVENTS.GAME_STATUS),
    onMarketSuspend: createEventListener<MarketSuspendData>(WS_EVENTS.MARKET_SUSPEND),
    onBetPlaced: createEventListener<BetPlacedData>(WS_EVENTS.BET_PLACED),
    onBetSettled: createEventListener<BetSettledData>(WS_EVENTS.BET_SETTLED),
    onCashoutUpdate: createEventListener<CashoutUpdateData>(WS_EVENTS.CASHOUT_UPDATE),
    onCashoutResult: createEventListener<CashoutResultData>(WS_EVENTS.CASHOUT_RESULT),
    onBalanceUpdate: createEventListener<BalanceUpdateData>(WS_EVENTS.BALANCE_UPDATE),
    onError: createEventListener<WSErrorData>(WS_EVENTS.ERROR),
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Hook to access WebSocket context
export const useWebSocket = (): WebSocketContextValue => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
