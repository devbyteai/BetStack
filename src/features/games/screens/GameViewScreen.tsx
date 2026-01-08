import React, { useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { useGetGameQuery, useGetGameMarketsQuery } from '@/features/sports/api';
import { OddsButton } from '@/features/betslip/components';
import { useLiveSubscription, useLiveOdds, useLiveGameStatus, useRecentlyViewed } from '@/shared/hooks';
import type { RootStackParamList } from '@/navigation/types';
import type { Market, Event } from '@/features/sports/types';
import { StatsBanner, ChangeGameBtn } from '../components';
import type { GameStatsData, BaseStats } from '../types';

type GameViewRouteProp = RouteProp<RootStackParamList, 'GameDetails'>;

export const GameViewScreen: React.FC = () => {
  const route = useRoute<GameViewRouteProp>();
  const { gameId } = route.params;

  const {
    data: game,
    isLoading: isLoadingGame,
    refetch: refetchGame,
  } = useGetGameQuery({ gameId, withMarkets: true });

  const {
    data: markets,
    isLoading: isLoadingMarkets,
    refetch: refetchMarkets,
    isFetching,
  } = useGetGameMarketsQuery(gameId);

  // Track recently viewed games
  const { addGame } = useRecentlyViewed();
  useEffect(() => {
    addGame(gameId);
  }, [gameId, addGame]);

  // Subscribe to live updates
  useLiveSubscription({ type: 'game', id: gameId, enabled: true });

  // Listen for odds updates
  const { getOddsForEvent } = useLiveOdds({ gameId });

  // Listen for game status updates
  const { getGameStatus } = useLiveGameStatus({ gameId });

  const isLoading = isLoadingGame || isLoadingMarkets;
  const isRefreshing = isFetching && !isLoading;

  const handleRefresh = useCallback(() => {
    refetchGame();
    refetchMarkets();
  }, [refetchGame, refetchMarkets]);

  // Get live status if available
  const liveStatus = getGameStatus(gameId);
  const gameInfo = game?.info;

  // Normalize display info from either source
  const displayInfo = useMemo(() => {
    const info = liveStatus?.info;
    if (info) {
      return {
        score1: info.score1,
        score2: info.score2,
        currentTime: info.currentTime,
        currentPeriod: info.currentPeriod,
      };
    }
    if (gameInfo) {
      return {
        score1: gameInfo.score?.team1,
        score2: gameInfo.score?.team2,
        currentTime: gameInfo.time?.toString(),
        currentPeriod: gameInfo.currentPeriod,
      };
    }
    return null;
  }, [liveStatus, gameInfo]);

  // Parse game stats for StatsBanner
  const gameStats = useMemo((): GameStatsData | undefined => {
    const stats = gameInfo?.stats as Record<string, Record<string, unknown>> | undefined;
    if (!stats) return undefined;

    // Stats can come in different formats - try to normalize
    const team1Stats: BaseStats = {};
    const team2Stats: BaseStats = {};

    // Check if stats are nested by team (team1/team2 or home/away)
    if (stats.team1 && stats.team2) {
      Object.assign(team1Stats, stats.team1);
      Object.assign(team2Stats, stats.team2);
    } else if (stats.home && stats.away) {
      Object.assign(team1Stats, stats.home);
      Object.assign(team2Stats, stats.away);
    } else {
      // Stats might be flat with suffixes like _1, _2 or _home, _away
      for (const [key, value] of Object.entries(stats)) {
        if (key.endsWith('_1') || key.endsWith('_home')) {
          const cleanKey = key.replace(/_1$|_home$/, '');
          team1Stats[cleanKey] = value as number;
        } else if (key.endsWith('_2') || key.endsWith('_away')) {
          const cleanKey = key.replace(/_2$|_away$/, '');
          team2Stats[cleanKey] = value as number;
        }
      }
    }

    // Return undefined if no stats extracted
    if (Object.keys(team1Stats).length === 0 && Object.keys(team2Stats).length === 0) {
      return undefined;
    }

    return { team1: team1Stats, team2: team2Stats };
  }, [gameInfo?.stats]);

  // Group markets by group name
  const groupedMarkets = useMemo(() => {
    if (!markets) return {};

    return markets.reduce((acc, market) => {
      const groupName = market.groupName || 'Other';
      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push(market);
      return acc;
    }, {} as Record<string, Market[]>);
  }, [markets]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading game...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!game) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Game not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Game Header */}
      <View style={styles.header}>
        <View style={styles.teamRow}>
          <View style={styles.team}>
            <Text style={styles.teamName} numberOfLines={2}>
              {game.team1Name}
            </Text>
            {displayInfo?.score1 !== undefined && (
              <Text style={styles.score}>{displayInfo.score1}</Text>
            )}
          </View>
          <View style={styles.vsContainer}>
            {game.isLive ? (
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            ) : (
              <Text style={styles.vsText}>VS</Text>
            )}
            {displayInfo?.currentTime && (
              <Text style={styles.gameTime}>{displayInfo.currentTime}</Text>
            )}
            {displayInfo?.currentPeriod && (
              <Text style={styles.gamePeriod}>{displayInfo.currentPeriod}</Text>
            )}
          </View>
          <View style={styles.team}>
            <Text style={styles.teamName} numberOfLines={2}>
              {game.team2Name}
            </Text>
            {displayInfo?.score2 !== undefined && (
              <Text style={styles.score}>{displayInfo.score2}</Text>
            )}
          </View>
        </View>
        <View style={styles.competitionRow}>
          <Text style={styles.competition} numberOfLines={1}>
            {game.competition?.name || ''}
          </Text>
          <ChangeGameBtn
            gameId={game.id}
            competitionId={game.competitionId}
            isLive={game.isLive}
          />
        </View>
      </View>

      {/* Stats Banner (only show if stats available) */}
      {gameStats && (
        <StatsBanner
          stats={gameStats}
          team1Name={game.team1Name}
          team2Name={game.team2Name}
          sportAlias={game.competition?.name?.toLowerCase().includes('soccer') ? 'soccer' : undefined}
          isLive={game.isLive}
        />
      )}

      {/* Markets */}
      <ScrollView
        style={styles.marketsContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {Object.entries(groupedMarkets).map(([groupName, groupMarkets]) => (
          <View key={groupName} style={styles.marketGroup}>
            <Text style={styles.groupName}>{groupName}</Text>
            {groupMarkets.map((market) => (
              <MarketCard
                key={market.id}
                market={market}
                game={{
                  ...game,
                  competitionName: game.competition?.name,
                }}
                getOddsForEvent={getOddsForEvent}
              />
            ))}
          </View>
        ))}

        {/* Empty state */}
        {(!markets || markets.length === 0) && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No markets available</Text>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

interface MarketCardProps {
  market: Market;
  game: {
    id: string;
    team1Name: string;
    team2Name: string;
    competitionName?: string;
    isLive: boolean;
  };
  getOddsForEvent: (eventId: string) => { price: number } | undefined;
}

const MarketCard: React.FC<MarketCardProps> = ({ market, game, getOddsForEvent }) => {
  const renderEvents = useCallback(() => {
    if (!market.events || market.events.length === 0) return null;

    // Determine layout based on column count
    const colCount = market.colCount || 3;

    return (
      <View style={[styles.eventsGrid, { flexWrap: 'wrap' }]}>
        {market.events.map((event: Event) => {
          const liveOdds = getOddsForEvent(event.id);
          const currentOdds = liveOdds?.price || event.price;

          return (
            <View
              key={event.id}
              style={[
                styles.eventContainer,
                { width: `${100 / colCount}%` },
              ]}
            >
              <Text style={styles.eventName} numberOfLines={1}>
                {event.name}
              </Text>
              <OddsButton
                eventId={event.id}
                gameId={game.id}
                marketId={market.id}
                odds={currentOdds}
                eventName={event.name}
                marketName={market.name}
                team1Name={game.team1Name}
                team2Name={game.team2Name}
                competitionName={game.competitionName}
                isLive={game.isLive}
                isSuspended={event.isSuspended}
                size="medium"
              />
            </View>
          );
        })}
      </View>
    );
  }, [market, game, getOddsForEvent]);

  return (
    <View style={styles.marketCard}>
      <Text style={styles.marketName}>{market.name}</Text>
      {market.base && <Text style={styles.marketBase}>{market.base}</Text>}
      {renderEvents()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.md,
  },
  header: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  team: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  score: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  vsContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  vsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.text,
    marginRight: 4,
  },
  liveText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  gameTime: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  gamePeriod: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  competitionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  competition: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  marketsContainer: {
    flex: 1,
  },
  marketGroup: {
    marginTop: SPACING.md,
  },
  groupName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  marketCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: 8,
  },
  marketName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  marketBase: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  eventsGrid: {
    flexDirection: 'row',
  },
  eventContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: 4,
  },
  eventName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
  },
  bottomPadding: {
    height: 100,
  },
});
