import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { useRecentlyViewed } from '@/shared/hooks';
import { useGetGameQuery } from '@/features/sports/api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface RecentlyViewedGamesProps {
  maxGames?: number;
}

export const RecentlyViewedGames: React.FC<RecentlyViewedGamesProps> = ({
  maxGames = 5,
}) => {
  const { recentGameIds, clearRecent, isLoading } = useRecentlyViewed();
  const navigation = useNavigation<NavigationProp>();

  // Limit displayed games
  const displayGameIds = recentGameIds.slice(0, maxGames);

  if (isLoading) {
    return null; // Don't show loading state for this section
  }

  if (displayGameIds.length === 0) {
    return null; // Don't show section if no recent games
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recently Viewed</Text>
        <TouchableOpacity onPress={clearRecent}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {displayGameIds.map((gameId) => (
          <RecentGameCard
            key={gameId}
            gameId={gameId}
            onPress={() => navigation.navigate('GameDetails', { gameId })}
          />
        ))}
      </ScrollView>
    </View>
  );
};

interface RecentGameCardProps {
  gameId: string;
  onPress: () => void;
}

const RecentGameCard: React.FC<RecentGameCardProps> = ({ gameId, onPress }) => {
  const { data: game, isLoading } = useGetGameQuery({ gameId, withMarkets: false });

  if (isLoading) {
    return (
      <View style={styles.cardLoading}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }

  if (!game) {
    return null; // Game may have been removed
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {game.isLive && (
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      )}
      <Text style={styles.teamName} numberOfLines={1}>
        {game.team1Name}
      </Text>
      <View style={styles.vsRow}>
        {game.info?.score ? (
          <Text style={styles.score}>
            {game.info.score.team1} - {game.info.score.team2}
          </Text>
        ) : (
          <Text style={styles.vs}>vs</Text>
        )}
      </View>
      <Text style={styles.teamName} numberOfLines={1}>
        {game.team2Name}
      </Text>
      <Text style={styles.competitionName} numberOfLines={1}>
        {game.competition?.name || ''}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  clearText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  card: {
    width: 140,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    marginRight: SPACING.sm,
  },
  cardLoading: {
    width: 140,
    height: 120,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  liveBadge: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.text,
    marginRight: 3,
  },
  liveText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  teamName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
  },
  vsRow: {
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  vs: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  score: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  competitionName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});
