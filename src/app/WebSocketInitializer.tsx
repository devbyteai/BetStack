import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { wsClient } from '@/shared/api/wsClient';
import { useAppSelector } from '@/store/hooks';

/**
 * Component that manages WebSocket connection lifecycle
 * - Connects when app is active
 * - Reconnects when auth state changes
 * - Disconnects when app goes to background (optional)
 */
export const WebSocketInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const hasConnected = useRef(false);

  useEffect(() => {
    const connect = async () => {
      try {
        await wsClient.connect();
        hasConnected.current = true;
        console.log('[WS] Connected');
      } catch (error) {
        console.error('[WS] Connection failed:', error);
      }
    };

    // Connect on mount
    connect();

    // Handle app state changes
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        // App came to foreground, reconnect if needed
        if (!wsClient.isConnected()) {
          connect();
        }
      }
      appState.current = nextState;
    });

    return () => {
      subscription.remove();
      wsClient.disconnect();
    };
  }, []);

  // Reconnect when auth state changes to get user-specific updates
  useEffect(() => {
    if (hasConnected.current) {
      // Disconnect and reconnect to re-authenticate
      wsClient.disconnect();
      wsClient.connect().then(() => {
        console.log('[WS] Reconnected with new auth state');
      });
    }
  }, [isAuthenticated]);

  return <>{children}</>;
};
