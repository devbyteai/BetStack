import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { SportsList, GamesList } from '@/features/sports/components';
import { useGetLiveGamesQuery, useGetGamesQuery } from '@/features/sports/api';
import { useLiveGameStatus } from '@/shared/hooks';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectQuickBetEnabled,
  toggleQuickBetMode,
} from '@/features/betslip/store';
import { QuickBetDialog } from '../components';
import type { Sport, Game } from '@/features/sports/types';
import type { RootStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const LiveScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const quickBetEnabled = useAppSelector(selectQuickBetEnabled);
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);

  const handleToggleQuickBet = useCallback(() => {
    dispatch(toggleQuickBetMode());
  }, [dispatch]);

  // Use getLiveGames if no sport selected, otherwise filter by sport
  const { data: liveGames, isLoading: isLoadingLive, refetch: refetchLive } = useGetLiveGamesQuery(
    50,
    { skip: !!selectedSport }
  );

  const { data: filteredData, isLoading: isLoadingFiltered, isFetching, refetch: refetchFiltered } = useGetGamesQuery(
    {
      type: 'live',
      sportId: selectedSport?.id,
      limit: 50,
    },
    { skip: !selectedSport }
  );

  // Subscribe to all live game status updates (no gameId filter)
  const { gameStatuses } = useLiveGameStatus({});

  const isLoading = selectedSport ? isLoadingFiltered : isLoadingLive;
  const baseGames = selectedSport ? (filteredData?.games || []) : (liveGames || []);
  const refetch = selectedSport ? refetchFiltered : refetchLive;

  // Merge WebSocket updates into games for real-time display
  const games = useMemo(() => {
    if (gameStatuses.size === 0) return baseGames;

    return baseGames.map((game) => {
      const liveStatus = gameStatuses.get(game.id);
      if (!liveStatus) return game;

      // Merge live status into game info
      return {
        ...game,
        isLive: liveStatus.isLive,
        info: {
          ...game.info,
          score: liveStatus.info.score1 !== undefined && liveStatus.info.score2 !== undefined
            ? { team1: liveStatus.info.score1, team2: liveStatus.info.score2 }
            : game.info?.score,
          currentPeriod: liveStatus.info.currentPeriod || game.info?.currentPeriod,
          time: liveStatus.info.currentTime || game.info?.time,
        },
      };
    });
  }, [baseGames, gameStatuses]);

  const handleSelectSport = useCallback((sport: Sport) => {
    setSelectedSport((prev) => (prev?.id === sport.id ? null : sport));
  }, []);

  const handleGamePress = useCallback((game: Game) => {
    navigation.navigate('GameDetails', { gameId: game.id });
  }, [navigation]);

  const handleSearch = useCallback(() => {
    navigation.navigate('Search');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
            <Text style={styles.title}>Live Betting</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveIndicator} />
              <Text style={styles.liveCount}>{games.length}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
              <Text style={styles.searchIcon}>🔍</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickBetToggle}
              onPress={handleToggleQuickBet}
              activeOpacity={0.7}
            >
              <Text style={[styles.quickBetLabel, quickBetEnabled && styles.quickBetLabelActive]}>
                Quick Bet
              </Text>
              <Switch
                value={quickBetEnabled}
                onValueChange={handleToggleQuickBet}
                trackColor={{ false: COLORS.surface, true: COLORS.primary }}
                thumbColor={COLORS.text}
                ios_backgroundColor={COLORS.surface}
              />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.subtitle}>In-play events with real-time odds</Text>
      </View>

      <SportsList
        type="live"
        selectedSportId={selectedSport?.id}
        onSelectSport={handleSelectSport}
      />

      <GamesList
        games={games}
        isLoading={isLoading}
        isRefreshing={isFetching && !isLoading}
        onRefresh={refetch}
        onGamePress={handleGamePress}
        emptyMessage="No live games at the moment"
      />

      {/* Quick Bet Dialog */}
      <QuickBetDialog />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  searchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 16,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  quickBetToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  quickBetLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
    fontWeight: '500',
  },
  quickBetLabelActive: {
    color: COLORS.primary,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: SPACING.sm,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.text,
    marginRight: 4,
  },
  liveCount: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});
