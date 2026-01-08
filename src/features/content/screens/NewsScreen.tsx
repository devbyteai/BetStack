import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { useGetNewsListQuery, useGetNewsCategoriesQuery } from '../api';
import type { NewsListItem } from '../types';
import type { DrawerParamList } from '@/navigation/types';

const PAGE_SIZE = 10;

export const NewsScreen: React.FC = () => {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [page, setPage] = useState(0);

  const {
    data: newsResponse,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetNewsListQuery({
    category: selectedCategory,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  });

  const { data: categories, isError: categoriesError } = useGetNewsCategoriesQuery();

  const handleCategoryPress = useCallback((category: string | undefined) => {
    setSelectedCategory(category);
    setPage(0);
  }, []);

  const handleNewsPress = useCallback((newsId: string) => {
    navigation.navigate('NewsDetail', { newsId });
  }, [navigation]);

  const handleLoadMore = useCallback(() => {
    if (newsResponse && newsResponse.news.length < newsResponse.total && !isFetching) {
      setPage((prev) => prev + 1);
    }
  }, [newsResponse, isFetching]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderCategoryItem = useCallback(
    (category: string | undefined, label: string) => (
      <TouchableOpacity
        key={label}
        style={[
          styles.categoryChip,
          selectedCategory === category && styles.categoryChipActive,
        ]}
        onPress={() => handleCategoryPress(category)}
      >
        <Text
          style={[
            styles.categoryText,
            selectedCategory === category && styles.categoryTextActive,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    ),
    [selectedCategory, handleCategoryPress]
  );

  const renderNewsItem = useCallback(
    ({ item }: { item: NewsListItem }) => (
      <TouchableOpacity
        style={styles.newsCard}
        onPress={() => handleNewsPress(item.id)}
        activeOpacity={0.7}
      >
        {item.thumbnail && (
          <Image
            source={{ uri: item.thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        )}
        <View style={styles.newsContent}>
          {item.category && (
            <Text style={styles.newsCategory}>{item.category}</Text>
          )}
          <Text style={styles.newsTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.newsExcerpt} numberOfLines={2}>
            {item.excerpt}
          </Text>
          {item.publishedAt && (
            <Text style={styles.newsDate}>{formatDate(item.publishedAt)}</Text>
          )}
        </View>
      </TouchableOpacity>
    ),
    [handleNewsPress]
  );

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No news articles available</Text>
      </View>
    );
  }, [isLoading]);

  const renderFooter = useCallback(() => {
    if (!isFetching || isLoading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }, [isFetching, isLoading]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.title}>News</Text>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['All', ...(categories || [])]}
          keyExtractor={(item) => item}
          renderItem={({ item }) =>
            renderCategoryItem(item === 'All' ? undefined : item, item)
          }
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : isError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>!</Text>
          <Text style={styles.errorText}>Failed to load news</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={newsResponse?.news || []}
          renderItem={renderNewsItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.newsList}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={refetch}
              tintColor={COLORS.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  menuButton: {
    marginRight: SPACING.md,
  },
  menuIcon: {
    fontSize: 24,
    color: COLORS.text,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  categoriesContainer: {
    marginBottom: SPACING.sm,
  },
  categoriesList: {
    paddingHorizontal: SPACING.lg,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundCard,
    marginRight: SPACING.sm,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  categoryTextActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newsList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  newsCard: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 180,
  },
  newsContent: {
    padding: SPACING.md,
  },
  newsCategory: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  newsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  newsExcerpt: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  newsDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
  },
  footerLoader: {
    paddingVertical: SPACING.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorIcon: {
    fontSize: 48,
    color: COLORS.error,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
  },
});
