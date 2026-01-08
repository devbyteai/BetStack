import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { Loader } from '@/shared/components';
import { useGetFavoritesQuery, useRemoveFavoriteMutation } from '../api/favoritesApi';
import type { Favorite } from '../types';
import type { RootStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { data: favorites, isLoading, refetch, isFetching } = useGetFavoritesQuery();
  const [removeFavorite, { isLoading: isRemoving }] = useRemoveFavoriteMutation();

  const handleGamePress = (gameId: string) => {
    navigation.navigate('GameDetails', { gameId });
  };

  const handleRemove = useCallback(async (favorite: Favorite) => {
    Alert.alert(
      'Remove Favorite',
      `Remove ${favorite.game?.team1Name || favorite.competition?.name} from favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFavorite(favorite.id).unwrap();
            } catch {
              Alert.alert('Error', 'Failed to remove favorite');
            }
          },
        },
      ]
    );
  }, [removeFavorite]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) return `Today ${time}`;
    if (isTomorrow) return `Tomorrow ${time}`;
    return `${date.toLocaleDateString([], { day: '2-digit', month: 'short' })} ${time}`;
  };

  const renderItem = ({ item }: { item: Favorite }) => (
    <TouchableOpacity
      style={styles.favoriteCard}
      onPress={() => item.gameId && handleGamePress(item.gameId)}
      activeOpacity={item.gameId ? 0.7 : 1}
      disabled={!item.gameId}
    >
      <View style={styles.cardContent}>
        {item.game ? (
          <>
            <View style={styles.teamsContainer}>
              <Text style={styles.teamName} numberOfLines={1}>
                {item.game.team1Name}
              </Text>
              <Text style={styles.vs}>vs</Text>
              <Text style={styles.teamName} numberOfLines={1}>
                {item.game.team2Name}
              </Text>
            </View>
            <View style={styles.gameInfo}>
              {item.game.isLive ? (
                <View style={styles.liveBadge}>
                  <View style={styles.liveIndicator} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              ) : (
                <Text style={styles.dateText}>
                  {formatDate(item.game.startTs)}
                </Text>
              )}
              {item.game.competition && (
                <Text style={styles.competitionText} numberOfLines={1}>
                  {item.game.competition.name}
                </Text>
              )}
            </View>
          </>
        ) : item.competition ? (
          <View style={styles.competitionContainer}>
            <Text style={styles.competitionName}>{item.competition.name}</Text>
            <Text style={styles.competitionLabel}>Competition</Text>
          </View>
        ) : null}
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemove(item)}
        disabled={isRemoving}
      >
        <Text style={styles.removeIcon}>x</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Favorites</Text>
        </View>
        <Loader fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.subtitle}>
          {favorites?.length || 0} {favorites?.length === 1 ? 'item' : 'items'}
        </Text>
      </View>

      {!favorites || favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptyText}>
            Tap the star icon on any game to add it to your favorites
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={refetch}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        />
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
    paddingBottom: SPACING.md,
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
    padding: SPACING.lg,
    paddingTop: 0,
  },
  favoriteCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  teamsContainer: {
    marginBottom: SPACING.xs,
  },
  teamName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: 2,
  },
  vs: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginVertical: 2,
  },
  gameInfo: {
    marginTop: SPACING.xs,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  liveIndicator: {
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
  dateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  competitionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  competitionContainer: {
    paddingVertical: SPACING.xs,
  },
  competitionName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  competitionLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  removeIcon: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textMuted,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
