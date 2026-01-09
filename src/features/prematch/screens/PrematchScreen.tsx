import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { SportsList, GamesList } from '@/features/sports/components';
import { useGetGamesQuery } from '@/features/sports/api';
import { TimeFilter } from '../components';
import type { Sport, Game, Competition } from '@/features/sports/types';
import type { RootStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const PrematchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [timeFilter, setTimeFilter] = useState<number | null>(null);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedCompetitionIds, setSelectedCompetitionIds] = useState<Set<number>>(new Set());

  const { data, isLoading, isFetching, refetch } = useGetGamesQuery(
    {
      type: 'prematch',
      sportId: selectedSport?.id,
      startsWithin: timeFilter ?? undefined,
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

  const handleSearch = useCallback(() => {
    navigation.navigate('Search');
  }, [navigation]);

  // Extract unique competitions from loaded games
  const competitions = useMemo(() => {
    if (!data?.games) return [];
    const competitionMap = new Map<number, Competition>();
    data.games.forEach((game) => {
      if (game.competition && !competitionMap.has(game.competition.id)) {
        competitionMap.set(game.competition.id, game.competition);
      }
    });
    return Array.from(competitionMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [data?.games]);

  // Filter games by selected competitions
  const filteredGames = useMemo(() => {
    if (!data?.games) return [];
    if (selectedCompetitionIds.size === 0) return data.games;
    return data.games.filter((game) => selectedCompetitionIds.has(game.competitionId));
  }, [data?.games, selectedCompetitionIds]);

  const handleToggleMultiSelect = useCallback(() => {
    setMultiSelectMode((prev) => !prev);
    if (multiSelectMode) {
      // Clear selections when exiting multi-select mode
      setSelectedCompetitionIds(new Set());
    }
  }, [multiSelectMode]);

  const handleToggleCompetition = useCallback((competitionId: number) => {
    setSelectedCompetitionIds((prev) => {
      const next = new Set(prev);
      if (next.has(competitionId)) {
        next.delete(competitionId);
      } else {
        next.add(competitionId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedCompetitionIds.size === competitions.length) {
      setSelectedCompetitionIds(new Set());
    } else {
      setSelectedCompetitionIds(new Set(competitions.map((c) => c.id)));
    }
  }, [competitions, selectedCompetitionIds.size]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Sports</Text>
            <Text style={styles.subtitle}>Pre-match betting</Text>
          </View>
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      <SportsList
        type="prematch"
        selectedSportId={selectedSport?.id}
        onSelectSport={handleSelectSport}
      />

      <TimeFilter
        selectedValue={timeFilter}
        onSelect={setTimeFilter}
      />

      {/* Competition Multi-Select Bar */}
      {multiSelectMode && competitions.length > 0 && (
        <View style={styles.competitionBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.competitionScroll}
          >
            <TouchableOpacity
              style={[
                styles.competitionChip,
                selectedCompetitionIds.size === competitions.length && styles.competitionChipSelected,
              ]}
              onPress={handleSelectAll}
            >
              <Text
                style={[
                  styles.competitionChipText,
                  selectedCompetitionIds.size === competitions.length && styles.competitionChipTextSelected,
                ]}
              >
                All ({competitions.length})
              </Text>
            </TouchableOpacity>
            {competitions.map((competition) => (
              <TouchableOpacity
                key={competition.id}
                style={[
                  styles.competitionChip,
                  selectedCompetitionIds.has(competition.id) && styles.competitionChipSelected,
                ]}
                onPress={() => handleToggleCompetition(competition.id)}
              >
                <Text
                  style={[
                    styles.competitionChipText,
                    selectedCompetitionIds.has(competition.id) && styles.competitionChipTextSelected,
                  ]}
                  numberOfLines={1}
                >
                  {competition.name}
                </Text>
                {competition.gamesCount !== undefined && (
                  <Text style={styles.competitionCount}>({competition.gamesCount})</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          {selectedCompetitionIds.size > 0 && (
            <View style={styles.filterActiveIndicator}>
              <Text style={styles.filterActiveText}>
                {selectedCompetitionIds.size} selected • {filteredGames.length} games
              </Text>
            </View>
          )}
        </View>
      )}

      <GamesList
        games={filteredGames}
        isLoading={isLoading}
        isRefreshing={isFetching && !isLoading}
        onRefresh={refetch}
        onGamePress={handleGamePress}
        emptyMessage={
          selectedSport
            ? `No ${selectedSport.name} games available`
            : 'Select a sport to view games'
        }
      />

      {/* Multi-Select FAB */}
      {competitions.length > 1 && (
        <TouchableOpacity
          style={[styles.fab, multiSelectMode && styles.fabActive]}
          onPress={handleToggleMultiSelect}
        >
          <Text style={styles.fabIcon}>{multiSelectMode ? '✕' : '☰'}</Text>
          {!multiSelectMode && selectedCompetitionIds.size > 0 && (
            <View style={styles.fabBadge}>
              <Text style={styles.fabBadgeText}>{selectedCompetitionIds.size}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 20,
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
  // Competition Multi-Select styles
  competitionBar: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  competitionScroll: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  competitionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  competitionChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  competitionChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    maxWidth: 120,
  },
  competitionChipTextSelected: {
    color: COLORS.textOnPrimary,
    fontWeight: '600',
  },
  competitionCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  filterActiveIndicator: {
    alignItems: 'center',
    paddingTop: SPACING.sm,
  },
  filterActiveText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  // FAB styles
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabActive: {
    backgroundColor: COLORS.error,
  },
  fabIcon: {
    fontSize: 24,
    color: COLORS.textOnPrimary,
  },
  fabBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  fabBadgeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textOnPrimary,
    fontWeight: 'bold',
  },
});
