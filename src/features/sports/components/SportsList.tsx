import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { Loader } from '@/shared/components';
import { useGetSportsQuery } from '../api/sportsApi';
import type { Sport } from '../types';

const SPORT_ICONS: Record<string, string> = {
  soccer: '⚽',
  football: '⚽',
  basketball: '🏀',
  tennis: '🎾',
  icehockey: '🏒',
  volleyball: '🏐',
  baseball: '⚾',
  americanfootball: '🏈',
  handball: '🤾',
  boxing: '🥊',
  mma: '🥋',
  esports: '🎮',
  rugby: '🏉',
  cricket: '🏏',
  darts: '🎯',
  snooker: '🎱',
  tabletennis: '🏓',
  badminton: '🏸',
  cycling: '🚴',
  motorsport: '🏎️',
  golf: '⛳',
};

interface SportsListProps {
  type?: 'prematch' | 'live';
  selectedSportId?: number;
  onSelectSport: (sport: Sport) => void;
  horizontal?: boolean;
}

export const SportsList: React.FC<SportsListProps> = ({
  type,
  selectedSportId,
  onSelectSport,
  horizontal = true,
}) => {
  const { data: sports, isLoading, error } = useGetSportsQuery({ type });

  if (isLoading) {
    return <Loader size="small" />;
  }

  if (error || !sports?.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No sports available</Text>
      </View>
    );
  }

  const renderSport = ({ item }: { item: Sport }) => {
    const isSelected = item.id === selectedSportId;
    const icon = SPORT_ICONS[item.alias?.toLowerCase()] || '🎯';

    return (
      <TouchableOpacity
        style={[styles.sportItem, isSelected && styles.sportItemSelected]}
        onPress={() => onSelectSport(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.sportIcon}>{icon}</Text>
        <Text style={[styles.sportName, isSelected && styles.sportNameSelected]} numberOfLines={1}>
          {item.name}
        </Text>
        {item.gamesCount !== undefined && item.gamesCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.gamesCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (horizontal) {
    return (
      <FlatList
        data={sports}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSport}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
    );
  }

  return (
    <FlatList
      data={sports}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderSport}
      contentContainerStyle={styles.verticalList}
    />
  );
};

const styles = StyleSheet.create({
  horizontalList: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  verticalList: {
    padding: SPACING.md,
  },
  sportItem: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    minWidth: 80,
    marginRight: SPACING.sm,
  },
  sportItemSelected: {
    backgroundColor: COLORS.primary,
  },
  sportIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  sportName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  sportNameSelected: {
    color: COLORS.text,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  empty: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
  },
});
