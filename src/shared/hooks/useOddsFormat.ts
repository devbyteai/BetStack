/**
 * Custom hook for odds formatting
 * Uses user settings to format odds in their preferred format
 */

import { useCallback, useMemo } from 'react';
import { useGetSettingsQuery } from '@/features/profile/api/profileApi';
import { formatOdds } from '@/shared/utils/oddsConverter';
import type { OddsFormat } from '@/features/profile/types';

const DEFAULT_ODDS_FORMAT: OddsFormat = 'decimal';

/**
 * Hook to get the user's odds format preference and a formatting function
 */
export function useOddsFormat() {
  const { data: settings, isLoading } = useGetSettingsQuery();

  const oddsFormat = useMemo<OddsFormat>(() => {
    return settings?.oddsFormat || DEFAULT_ODDS_FORMAT;
  }, [settings?.oddsFormat]);

  const format = useCallback(
    (odds: number): string => {
      return formatOdds(odds, oddsFormat);
    },
    [oddsFormat]
  );

  return {
    oddsFormat,
    formatOdds: format,
    isLoading,
  };
}

/**
 * Hook to just get formatted odds string
 */
export function useFormattedOdds(odds: number): string {
  const { formatOdds: format } = useOddsFormat();
  return format(odds);
}
