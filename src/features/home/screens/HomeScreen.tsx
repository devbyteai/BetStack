import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { BannerCarousel } from '@/features/content';
import { GameCard, useGetFeaturedGamesQuery, useGetLiveGamesQuery, useGetGamesQuery } from '@/features/sports';
import { RecentlyViewedGames } from '../components';
import type { Game } from '@/features/sports';
import type { RootStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FEATURED_LIMIT = 5;
const LIVE_LIMIT = 5;
const UPCOMING_LIMIT = 10;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const {
    data: featuredGames,
    isLoading: isLoadingFeatured,
    isError: isErrorFeatured,
    refetch: refetchFeatured,
  } = useGetFeaturedGamesQuery(FEATURED_LIMIT);

  const {
    data: liveGames,
    isLoading: isLoadingLive,
    isError: isErrorLive,
    refetch: refetchLive,
  } = useGetLiveGamesQuery(LIVE_LIMIT);

  const {
    data: upcomingData,
    isLoading: isLoadingUpcoming,
    isError: isErrorUpcoming,
    refetch: refetchUpcoming,
  } = useGetGamesQuery({ type: 'prematch', limit: UPCOMING_LIMIT });

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchFeatured(),
      refetchLive(),
      refetchUpcoming(),
    ]);
    setRefreshing(false);
  }, [refetchFeatured, refetchLive, refetchUpcoming]);

  const handleGamePress = (gameId: string) => {
    navigation.navigate('GameDetails', { gameId });
  };

  const handleSeeAllLive = () => {
    navigation.navigate('Main', {
      screen: 'Drawer',
      params: {
        screen: 'MainTabs',
        params: {
          screen: 'Live',
          params: { screen: 'LiveScreen' },
        },
      },
    });
  };

  const handleSeeAllPrematch = () => {
    navigation.navigate('Main', {
      screen: 'Drawer',
      params: {
        screen: 'MainTabs',
        params: {
          screen: 'Prematch',
          params: { screen: 'PrematchScreen' },
        },
      },
    });
  };

  const handleSearch = () => {
    navigation.navigate('Search');
  };

  const renderGameItem = ({ item }: { item: Game }) => (
    <View style={styles.gameItemContainer}>
      <GameCard
        game={item}
        onPress={() => handleGamePress(item.id)}
        showCompetition
      />
    </View>
  );

  const renderSection = (
    title: string,
    data: Game[] | undefined,
    isLoading: boolean,
    isError: boolean,
    onRefetch: () => void,
    onSeeAll?: () => void,
    horizontal: boolean = false
  ) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onSeeAll && data && data.length > 0 && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      ) : isError ? (
        <TouchableOpacity style={styles.errorContainer} onPress={onRefetch}>
          <Text style={styles.errorText}>Failed to load</Text>
          <Text style={styles.retryText}>Tap to retry</Text>
        </TouchableOpacity>
      ) : !data || data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No games available</Text>
        </View>
      ) : horizontal ? (
        <FlatList
          data={data}
          renderItem={renderGameItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      ) : (
        data.slice(0, 5).map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onPress={() => handleGamePress(game.id)}
            showCompetition
          />
        ))
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Home</Text>
              <Text style={styles.subtitle}>Featured games and promotions</Text>
            </View>
            <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
              <Text style={styles.searchIcon}>🔍</Text>
            </TouchableOpacity>
          </View>
        </View>

        <BannerCarousel position="home" />

        <RecentlyViewedGames maxGames={5} />

        {renderSection(
          'Featured Games',
          featuredGames,
          isLoadingFeatured,
          isErrorFeatured,
          refetchFeatured,
          undefined,
          true
        )}

        {renderSection(
          'Live Now',
          liveGames,
          isLoadingLive,
          isErrorLive,
          refetchLive,
          handleSeeAllLive,
          false
        )}

        {renderSection(
          'Upcoming',
          upcomingData?.games,
          isLoadingUpcoming,
          isErrorUpcoming,
          refetchUpcoming,
          handleSeeAllPrematch,
          false
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
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
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  loadingContainer: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 8,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyContainer: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 8,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
  },
  errorContainer: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 8,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  retryText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
  },
  horizontalList: {
    paddingRight: SPACING.lg,
  },
  gameItemContainer: {
    width: 280,
    marginRight: SPACING.md,
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});
