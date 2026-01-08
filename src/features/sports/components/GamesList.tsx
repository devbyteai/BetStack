import React from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { Loader } from '@/shared/components';
import { GameCard } from './GameCard';
import type { Game } from '../types';

interface GamesListProps {
  games: Game[];
  isLoading?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onGamePress?: (game: Game) => void;
  onEndReached?: () => void;
  ListHeaderComponent?: React.ComponentType | React.ReactElement | null;
  showCompetition?: boolean;
  emptyMessage?: string;
}

export const GamesList: React.FC<GamesListProps> = ({
  games,
  isLoading,
  isRefreshing = false,
  onRefresh,
  onGamePress,
  onEndReached,
  ListHeaderComponent,
  showCompetition = true,
  emptyMessage = 'No games available',
}) => {
  if (isLoading && !games.length) {
    return <Loader fullScreen text="Loading games..." />;
  }

  const renderGame = ({ item }: { item: Game }) => (
    <GameCard
      game={item}
      onPress={onGamePress ? () => onGamePress(item) : undefined}
      showCompetition={showCompetition}
    />
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>🏟️</Text>
      <Text style={styles.emptyText}>{emptyMessage}</Text>
    </View>
  );

  const renderFooter = () => {
    if (!isLoading || !games.length) return null;
    return (
      <View style={styles.footer}>
        <Loader size="small" />
      </View>
    );
  };

  return (
    <FlatList
      data={games}
      keyExtractor={(item) => item.id}
      renderItem={renderGame}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      contentContainerStyle={styles.list}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        ) : undefined
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: SPACING.lg,
  },
});
