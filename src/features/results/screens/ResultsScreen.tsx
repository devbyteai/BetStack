import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { SportsList } from '@/features/sports/components';
import { useGetGamesQuery } from '@/features/sports/api';
import type { Sport, Game } from '@/features/sports/types';
import type { RootStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList> & DrawerNavigationProp<{}>;

export const ResultsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);

  const { data, isLoading, isFetching, refetch } = useGetGamesQuery(
    {
      type: 'finished',
      sportId: selectedSport?.id,
      limit: 50,
    },
    { skip: false }
  );

  const handleSelectSport = useCallback((sport: Sport) => {
    setSelectedSport((prev) => (prev?.id === sport.id ? null : sport));
  }, []);

  const handleGamePress = useCallback((game: Game) => {
    navigation.navigate('GameDetails', { gameId: game.id });
  }, [navigation]);

  const formatScore = (game: Game) => {
    if (game.info?.score) {
      return game.info.score;
    }
    return '-';
  };

  const formatDate = (date: Date) => {
    const gameDate = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - gameDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return gameDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const renderGame = ({ item: game }: { item: Game }) => (
    <TouchableOpacity style={styles.gameCard} onPress={() => handleGamePress(game)}>
      <View style={styles.gameHeader}>
        <Text style={styles.competitionName}>
          {game.competition?.name || 'Unknown Competition'}
        </Text>
        <Text style={styles.gameDate}>{formatDate(game.startTs)}</Text>
      </View>
      <View style={styles.gameContent}>
        <View style={styles.teamRow}>
          <Text style={styles.teamName} numberOfLines={1}>
            {game.team1Name}
          </Text>
          <Text style={styles.score}>{formatScore(game).split(':')[0] || '-'}</Text>
        </View>
        <View style={styles.teamRow}>
          <Text style={styles.teamName} numberOfLines={1}>
            {game.team2Name}
          </Text>
          <Text style={styles.score}>{formatScore(game).split(':')[1] || '-'}</Text>
        </View>
      </View>
      <View style={styles.gameFooter}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Finished</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.emptyText}>Loading results...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Results</Text>
        <Text style={styles.emptyText}>
          {selectedSport
            ? `No finished ${selectedSport.name} games found`
            : 'Select a sport to view results'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={styles.menuButton}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Results</Text>
            <Text style={styles.subtitle}>View finished games</Text>
          </View>
        </View>
      </View>

      <SportsList
        type="prematch"
        selectedSportId={selectedSport?.id}
        onSelectSport={handleSelectSport}
      />

      <FlatList
        data={data?.games || []}
        keyExtractor={(item) => item.id}
        renderItem={renderGame}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    color: COLORS.text,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  listContent: {
    padding: SPACING.md,
    paddingTop: SPACING.sm,
  },
  gameCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  competitionName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    flex: 1,
  },
  gameDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  gameContent: {
    gap: SPACING.xs,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
    marginRight: SPACING.md,
  },
  score: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
    minWidth: 30,
    textAlign: 'center',
  },
  gameFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.sm,
  },
  statusBadge: {
    backgroundColor: COLORS.successBackground,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
