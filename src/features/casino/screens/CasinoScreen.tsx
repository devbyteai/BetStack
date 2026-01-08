import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { useGetCasinoCategoriesQuery, useGetCasinoGamesQuery, useGetCasinoProvidersQuery } from '../api';
import { Loader, Button } from '@/shared/components';
import type { CasinoGameListItem, CasinoCategory, CasinoProvider } from '../types';

type CasinoStackParamList = {
  CasinoScreen: undefined;
  GameLaunch: { gameId: string; gameName: string };
  Roulette: undefined;
  VirtualSports: undefined;
};

type NavigationProp = NativeStackNavigationProp<CasinoStackParamList, 'CasinoScreen'>;

const GAMES_PER_PAGE = 20;

export const CasinoScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);

  const {
    data: categories,
    isLoading: loadingCategories,
    isError: categoriesError,
  } = useGetCasinoCategoriesQuery();

  const {
    data: providers,
    isLoading: loadingProviders,
    isError: providersError,
  } = useGetCasinoProvidersQuery();

  const {
    data: gamesData,
    isLoading: loadingGames,
    isError: gamesError,
    refetch,
    isFetching,
  } = useGetCasinoGamesQuery({
    categoryId: selectedCategory || undefined,
    providerId: selectedProvider || undefined,
    search: searchQuery || undefined,
    limit: GAMES_PER_PAGE,
    offset: 0,
  });

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleGamePress = (game: CasinoGameListItem) => {
    navigation.navigate('GameLaunch', { gameId: game.id, gameName: game.name });
  };

  const handleCategoryPress = (categoryId: number | null) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  const handleProviderPress = (providerId: number | null) => {
    setSelectedProvider(providerId === selectedProvider ? null : providerId);
  };

  const renderCategoryItem = ({ item }: { item: CasinoCategory }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item.id && styles.categoryChipSelected,
      ]}
      onPress={() => handleCategoryPress(item.id)}
    >
      <Text
        style={[
          styles.categoryChipText,
          selectedCategory === item.id && styles.categoryChipTextSelected,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProviderItem = ({ item }: { item: CasinoProvider }) => (
    <TouchableOpacity
      style={[
        styles.providerChip,
        selectedProvider === item.id && styles.providerChipSelected,
      ]}
      onPress={() => handleProviderPress(item.id)}
    >
      <Text
        style={[
          styles.providerChipText,
          selectedProvider === item.id && styles.providerChipTextSelected,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderGameItem = ({ item }: { item: CasinoGameListItem }) => (
    <TouchableOpacity style={styles.gameCard} onPress={() => handleGamePress(item)}>
      {item.thumbnail ? (
        <Image source={{ uri: item.thumbnail }} style={styles.gameThumbnail} />
      ) : (
        <View style={[styles.gameThumbnail, styles.gamePlaceholder]}>
          <Text style={styles.gamePlaceholderText}>{item.name[0]}</Text>
        </View>
      )}
      <Text style={styles.gameName} numberOfLines={2}>
        {item.name}
      </Text>
      {item.providerName && (
        <Text style={styles.gameProvider}>{item.providerName}</Text>
      )}
    </TouchableOpacity>
  );

  const isLoading = loadingCategories || loadingProviders || loadingGames;
  const isError = categoriesError || providersError || gamesError;

  // Error state
  if (isError && !gamesData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Casino</Text>
          <Text style={styles.subtitle}>Slots, Roulette & Virtual Sports</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load casino games</Text>
          <Button title="Retry" variant="primary" onPress={handleRefresh} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Casino</Text>
        <Text style={styles.subtitle}>Slots, Roulette & Virtual Sports</Text>
      </View>

      {/* Quick Access */}
      <View style={styles.quickAccess}>
        <TouchableOpacity
          style={styles.quickAccessButton}
          onPress={() => navigation.navigate('Roulette')}
        >
          <Text style={styles.quickAccessEmoji}>🎰</Text>
          <Text style={styles.quickAccessText}>Roulette</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickAccessButton}
          onPress={() => navigation.navigate('VirtualSports')}
        >
          <Text style={styles.quickAccessEmoji}>🏇</Text>
          <Text style={styles.quickAccessText}>Virtual Sports</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search games..."
          placeholderTextColor={COLORS.textDisabled}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <View style={styles.filterSection}>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          />
        </View>
      )}

      {/* Providers */}
      {providers && providers.length > 0 && (
        <View style={styles.filterSection}>
          <FlatList
            data={providers}
            renderItem={renderProviderItem}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          />
        </View>
      )}

      {/* Games Grid */}
      {isLoading && !gamesData ? (
        <Loader />
      ) : (
        <FlatList
          data={gamesData?.games || []}
          renderItem={renderGameItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.gamesGrid}
          columnWrapperStyle={styles.gamesRow}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No games found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your filters or search
              </Text>
            </View>
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
    paddingBottom: SPACING.sm,
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
  quickAccess: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  quickAccessButton: {
    flex: 1,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
  },
  quickAccessEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  quickAccessText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  searchInput: {
    backgroundColor: COLORS.backgroundInput,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  filterSection: {
    marginBottom: SPACING.sm,
  },
  filterList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  categoryChip: {
    backgroundColor: COLORS.backgroundCard,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  categoryChipTextSelected: {
    color: COLORS.text,
    fontWeight: '600',
  },
  providerChip: {
    backgroundColor: COLORS.backgroundCard,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
  },
  providerChipSelected: {
    backgroundColor: COLORS.secondary,
  },
  providerChipText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  providerChipTextSelected: {
    color: COLORS.text,
    fontWeight: '600',
  },
  gamesGrid: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  gamesRow: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  gameCard: {
    width: '31%',
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 8,
    overflow: 'hidden',
  },
  gameThumbnail: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  gamePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gamePlaceholderText: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.textMuted,
    fontWeight: 'bold',
  },
  gameName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    padding: SPACING.xs,
    paddingBottom: 2,
  },
  gameProvider: {
    fontSize: 10,
    color: COLORS.textMuted,
    paddingHorizontal: SPACING.xs,
    paddingBottom: SPACING.xs,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
  },
  emptyStateSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
});
