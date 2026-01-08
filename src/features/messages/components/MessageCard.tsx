import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, borderRadius } from '@/shared/constants/theme';
import type { Message, MessageType, MessagePriority } from '../types';

interface MessageCardProps {
  message: Message;
  onPress?: () => void;
  onDismiss?: () => void;
}

const TYPE_CONFIG: Record<MessageType, { icon: string; color: string }> = {
  system: { icon: 'information-circle', color: colors.primary.main },
  promotion: { icon: 'gift', color: colors.status.success },
  announcement: { icon: 'megaphone', color: colors.status.warning },
  alert: { icon: 'alert-circle', color: colors.status.error },
};

const PRIORITY_STYLES: Record<MessagePriority, { borderColor: string }> = {
  low: { borderColor: 'transparent' },
  normal: { borderColor: 'transparent' },
  high: { borderColor: colors.status.warning },
  urgent: { borderColor: colors.status.error },
};

export const MessageCard: React.FC<MessageCardProps> = ({
  message,
  onPress,
  onDismiss,
}) => {
  const typeConfig = TYPE_CONFIG[message.type];
  const priorityStyle = PRIORITY_STYLES[message.priority];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !message.isRead && styles.unread,
        { borderLeftColor: priorityStyle.borderColor },
        message.priority === 'high' && styles.highPriority,
        message.priority === 'urgent' && styles.urgentPriority,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: typeConfig.color + '20' }]}>
          <Icon name={typeConfig.icon} size={20} color={typeConfig.color} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, !message.isRead && styles.titleUnread]} numberOfLines={1}>
            {message.title}
          </Text>
          <Text style={styles.timestamp}>{formatDate(message.createdAt)}</Text>
        </View>
        {!message.isRead && <View style={styles.unreadDot} />}
        {onDismiss && (
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Icon name="close" size={18} color={colors.text.disabled} />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <Text style={styles.content} numberOfLines={2}>
        {message.content}
      </Text>

      {/* Image preview */}
      {message.imageUrl && (
        <Image source={{ uri: message.imageUrl }} style={styles.image} resizeMode="cover" />
      )}

      {/* Action button */}
      {message.actionLabel && (
        <View style={styles.actionContainer}>
          <Text style={styles.actionLabel}>{message.actionLabel}</Text>
          <Icon name="chevron-forward" size={16} color={colors.primary.main} />
        </View>
      )}

      {/* Type badge */}
      <View style={[styles.typeBadge, { backgroundColor: typeConfig.color + '15' }]}>
        <Text style={[styles.typeText, { color: typeConfig.color }]}>
          {message.type.charAt(0).toUpperCase() + message.type.slice(1)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  unread: {
    backgroundColor: colors.background.tertiary,
  },
  highPriority: {
    borderLeftWidth: 3,
    borderLeftColor: colors.status.warning,
  },
  urgentPriority: {
    borderLeftWidth: 3,
    borderLeftColor: colors.status.error,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.body,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 2,
  },
  titleUnread: {
    fontWeight: '600',
  },
  timestamp: {
    fontSize: typography.sizes.caption,
    color: colors.text.disabled,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.main,
    marginRight: spacing.sm,
  },
  dismissButton: {
    padding: spacing.xs,
  },
  content: {
    fontSize: typography.sizes.small,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  actionLabel: {
    flex: 1,
    fontSize: typography.sizes.small,
    fontWeight: '500',
    color: colors.primary.main,
  },
  typeBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  typeText: {
    fontSize: typography.sizes.caption,
    fontWeight: '500',
  },
});

export default MessageCard;
