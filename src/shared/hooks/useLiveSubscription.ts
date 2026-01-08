import { useEffect, useCallback, useRef } from 'react';
import { wsClient } from '../api/wsClient';

type SubscriptionType = 'sport' | 'game' | 'live';

interface UseLiveSubscriptionOptions {
  type: SubscriptionType;
  id?: number | string;
  enabled?: boolean;
}

export const useLiveSubscription = ({
  type,
  id,
  enabled = true,
}: UseLiveSubscriptionOptions) => {
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !id) {
      return;
    }

    const subscribe = async () => {
      try {
        await wsClient.connect();
        wsClient.subscribe(type, id);
        subscribedRef.current = true;
      } catch (error) {
        console.error('Failed to subscribe:', error);
      }
    };

    subscribe();

    return () => {
      if (subscribedRef.current && id) {
        wsClient.unsubscribe(type, id);
        subscribedRef.current = false;
      }
    };
  }, [type, id, enabled]);

  const unsubscribe = useCallback(() => {
    if (subscribedRef.current && id) {
      wsClient.unsubscribe(type, id);
      subscribedRef.current = false;
    }
  }, [type, id]);

  return { unsubscribe };
};
