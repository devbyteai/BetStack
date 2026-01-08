import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import type { Game } from '@/features/sports/types';

interface RelatedGamesModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectGame: (gameId: string) => void;
  games: Game[];
  isLoading: boolean;
  isEmpty: boolean;
  currentGameId: string;
}

export const RelatedGamesModal: React.FC<RelatedGamesModalProps> = ({
  visible,
  onClose,
  onSelectGame,
  games,
  isLoading,
  isEmpty,
}) => {
  const formatTime = (startTs: string): string => {
    const date = new Date(startTs);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderGameItem = (game: Game) => (
    <TouchableOpacity
      key={game.id}
      style={styles.gameItem}
      onPress={() => {
        onSelectGame(game.id);
        onClose();
      }}
    >
      <View style={styles.gameInfo}>
        <View style={styles.teamsContainer}>
          <Text style={styles.teamName} numberOfLines={1}>
            {game.team1Name}
          </Text>
          <Text style={styles.vs}>vs</Text>
          <Text style={styles.teamName} numberOfLines={1}>
            {game.team2Name}
          </Text>
        </View>
        {game.isLive ? (
          <View style={styles.liveContainer}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
            {game.info?.score && (
              <Text style={styles.scoreText}>
                {game.info.score.team1} - {game.info.score.team2}
              </Text>
            )}
          </View>
        ) : (
          <Text style={styles.timeText}>{formatTime(game.startTs)}</Text>
        )}
      </View>
      <Text style={styles.competitionName} numberOfLines={1}>
        {game.competition?.name || 'Unknown Competition'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Other Games</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : isEmpty ? (
            <View style={styles.centerContent}>
              <Text style={styles.emptyText}>No related games found</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {games.map(renderGameItem)}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
    minHeight: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 28,
    color: COLORS.textSecondary,
    lineHeight: 28,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: SPACING.sm,
  },
  gameItem: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  teamsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
  },
  vs: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.xs,
  },
  liveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveDot: {
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
  scoreText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  timeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  competitionName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
});
