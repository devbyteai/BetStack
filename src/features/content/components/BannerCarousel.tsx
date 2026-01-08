import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Linking,
  ViewToken,
} from 'react-native';
import { COLORS, SPACING } from '@/shared/constants';
import type { Banner, BannerPosition } from '../types';
import { useGetBannersQuery } from '../api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - SPACING.lg * 2;
const BANNER_HEIGHT = 160;

interface BannerCarouselProps {
  position?: BannerPosition;
  autoScrollInterval?: number;
}

// Validate URLs before opening to prevent malicious links
const isValidBannerUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    // Block dangerous patterns
    const blockedPatterns = ['javascript:', 'data:', 'file:', 'localhost', '127.0.0.1'];
    const urlLower = url.toLowerCase();
    if (blockedPatterns.some(pattern => urlLower.includes(pattern))) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

export const BannerCarousel: React.FC<BannerCarouselProps> = ({
  position = 'home',
  autoScrollInterval = 5000,
}) => {
  const { data: banners, isLoading } = useGetBannersQuery({ position });
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<Banner>>(null);
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleBannerPress = useCallback((banner: Banner) => {
    if (banner.linkUrl && isValidBannerUrl(banner.linkUrl)) {
      Linking.openURL(banner.linkUrl).catch(() => {});
    }
  }, []);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  useEffect(() => {
    if (!banners || banners.length <= 1) return;

    autoScrollTimer.current = setInterval(() => {
      const nextIndex = (activeIndex + 1) % banners.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, autoScrollInterval);

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [activeIndex, banners, autoScrollInterval]);

  const renderBanner = useCallback(
    ({ item }: { item: Banner }) => (
      <TouchableOpacity
        style={styles.bannerContainer}
        onPress={() => handleBannerPress(item)}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    ),
    [handleBannerPress]
  );

  const renderIndicator = useCallback(
    (index: number) => (
      <View
        key={index}
        style={[
          styles.indicator,
          index === activeIndex && styles.indicatorActive,
        ]}
      />
    ),
    [activeIndex]
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBanner} />
      </View>
    );
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        renderItem={renderBanner}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        snapToInterval={BANNER_WIDTH + SPACING.sm}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
      />
      {banners.length > 1 && (
        <View style={styles.indicatorContainer}>
          {banners.map((_, index) => renderIndicator(index))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
  },
  bannerContainer: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    marginRight: SPACING.sm,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  loadingBanner: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.backgroundLight,
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
});
