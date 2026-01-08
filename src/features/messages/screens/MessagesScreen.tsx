import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import { MessageCard } from '../components/MessageCard';
import {
  useGetMessagesQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDismissMessageMutation,
} from '../api/messagesApi';
import type { Message, MessageType } from '../types';
import { colors, spacing, typography, borderRadius } from '@/shared/constants/theme';

const FILTER_OPTIONS: { label: string; value: MessageType | null }[] = [
  { label: 'All', value: null },
  { label: 'System', value: 'system' },
  { label: 'Promos', value: 'promotion' },
  { label: 'News', value: 'announcement' },
  { label: 'Alerts', value: 'alert' },
];

export const MessagesScreen: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<MessageType | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useGetMessagesQuery({
    type: selectedFilter || undefined,
    limit: 50,
  });

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();
  const [dismissMessage] = useDismissMessageMutation();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleMessagePress = useCallback(async (message: Message) => {
    if (!message.isRead) {
      try {
        await markAsRead({ messageIds: [message.id] }).unwrap();
      } catch {
        // Silent fail for read marking
      }
    }

    // If message has action, you could navigate here
    if (message.actionUrl) {
      // Handle action navigation
      Alert.alert(message.title, message.content);
    } else {
      Alert.alert(message.title, message.content);
    }
  }, [markAsRead]);

  const handleDismiss = useCallback(async (messageId: string) => {
    try {
      await dismissMessage({ messageId }).unwrap();
    } catch {
      Alert.alert('Error', 'Failed to dismiss message');
    }
  }, [dismissMessage]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      const result = await markAllAsRead().unwrap();
      if (result.markedCount > 0) {
        Alert.alert('Success', `${result.markedCount} message(s) marked as read`);
      }
    } catch {
      Alert.alert('Error', 'Failed to mark messages as read');
    }
  }, [markAllAsRead]);

  const renderFilterChip = useCallback(
    ({ label, value }: { label: string; value: MessageType | null }) => (
      <TouchableOpacity
        key={label}
        style={[styles.filterChip, selectedFilter === value && styles.filterChipActive]}
        onPress={() => setSelectedFilter(value)}
      >
        <Text style={[styles.filterChipText, selectedFilter === value && styles.filterChipTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    ),
    [selectedFilter]
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="mail-outline" size={64} color={colors.text.disabled} />
      <Text style={styles.emptyTitle}>No Messages</Text>
      <Text style={styles.emptySubtitle}>
        {selectedFilter
          ? `No ${selectedFilter} messages at the moment`
          : 'You have no messages yet'}
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyState}>
      <Icon name="alert-circle-outline" size={64} color={colors.status.error} />
      <Text style={styles.emptyTitle}>Error Loading Messages</Text>
      <Text style={styles.emptySubtitle}>Please try again later</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !data) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {renderErrorState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Messages</Text>
            {data?.unreadCount ? (
              <Text style={styles.unreadCount}>{data.unreadCount} unread</Text>
            ) : (
              <Text style={styles.unreadCount}>All caught up</Text>
            )}
          </View>
          {data?.unreadCount ? (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={handleMarkAllRead}
              disabled={isMarkingAll}
            >
              {isMarkingAll ? (
                <ActivityIndicator size="small" color={colors.primary.main} />
              ) : (
                <>
                  <Icon name="checkmark-done" size={18} color={colors.primary.main} />
                  <Text style={styles.markAllText}>Mark all read</Text>
                </>
              )}
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filters */}
        <View style={styles.filters}>
          {FILTER_OPTIONS.map(renderFilterChip)}
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        data={data?.messages || []}
        renderItem={({ item }) => (
          <MessageCard
            message={item}
            onPress={() => handleMessagePress(item)}
            onDismiss={() => handleDismiss(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.main}
            colors={[colors.primary.main]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.body,
    color: colors.text.secondary,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.sizes.h2,
    fontWeight: '700',
    color: colors.text.primary,
  },
  unreadCount: {
    fontSize: typography.sizes.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary.main + '15',
    borderRadius: borderRadius.full,
  },
  markAllText: {
    fontSize: typography.sizes.caption,
    fontWeight: '500',
    color: colors.primary.main,
    marginLeft: spacing.xs,
  },
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  filterChipActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterChipText: {
    fontSize: typography.sizes.caption,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: colors.common.white,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: typography.sizes.h3,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    fontSize: typography.sizes.body,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    fontSize: typography.sizes.body,
    fontWeight: '600',
    color: colors.common.white,
  },
});

export default MessagesScreen;
