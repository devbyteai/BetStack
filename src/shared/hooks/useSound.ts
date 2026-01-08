import { useCallback, useEffect } from 'react';
import { useGetSettingsQuery } from '@/features/profile/api';
import { soundService } from '@/shared/services/soundService';

interface UseSoundReturn {
  playBetPlaced: () => void;
  playWin: () => void;
  playNotification: () => void;
  isEnabled: boolean;
}

/**
 * Hook for playing sound effects
 * Automatically respects user's soundEnabled setting
 */
export const useSound = (): UseSoundReturn => {
  const { data: settings } = useGetSettingsQuery();

  // Sync sound service with user settings
  useEffect(() => {
    const enabled = settings?.soundEnabled ?? true;
    soundService.setEnabled(enabled);
  }, [settings?.soundEnabled]);

  // Initialize sound service on first use
  useEffect(() => {
    soundService.initialize();
  }, []);

  const playBetPlaced = useCallback(() => {
    soundService.playBetPlaced();
  }, []);

  const playWin = useCallback(() => {
    soundService.playWin();
  }, []);

  const playNotification = useCallback(() => {
    soundService.playNotification();
  }, []);

  return {
    playBetPlaced,
    playWin,
    playNotification,
    isEnabled: settings?.soundEnabled ?? true,
  };
};
