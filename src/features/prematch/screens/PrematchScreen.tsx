import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { SportsList, GamesList } from '@/features/sports/components';
import { useGetGamesQuery } from '@/features/sports/api';
import { TimeFilter } from '../components';
import type { Sport, Game } from '@/features/sports/types';
import type { RootStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const PrematchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [timeFilter, setTimeFilter] = useState<number | null>(null);

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

      <GamesList
        games={data?.games || []}
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
});
