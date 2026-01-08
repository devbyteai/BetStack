import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { convertPeriodName } from '@/shared/utils/periodNames';
import type { Game } from '../types';

interface GameCardProps {
  game: Game;
  onPress?: () => void;
  showCompetition?: boolean;
  enableScoreAnimation?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  onPress,
  showCompetition = true,
  enableScoreAnimation = true,
}) => {
  // Score animation state
  const [team1ScoreChanged, setTeam1ScoreChanged] = useState(false);
  const [team2ScoreChanged, setTeam2ScoreChanged] = useState(false);
  const prevScore = useRef<{ team1: number; team2: number } | null>(null);
  const team1Anim = useRef(new Animated.Value(1)).current;
  const team2Anim = useRef(new Animated.Value(1)).current;

  // Detect score changes for animations
  useEffect(() => {
    if (!enableScoreAnimation || !game.isLive || !game.info?.score) return;

    const currentScore = game.info.score;

    if (prevScore.current) {
      // Team 1 scored
      if (currentScore.team1 > prevScore.current.team1) {
        setTeam1ScoreChanged(true);
        Animated.sequence([
          Animated.timing(team1Anim, { toValue: 1.4, duration: 150, useNativeDriver: true }),
          Animated.timing(team1Anim, { toValue: 1, duration: 150, useNativeDriver: true }),
          Animated.timing(team1Anim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
          Animated.timing(team1Anim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start(() => {
          setTimeout(() => setTeam1ScoreChanged(false), 2000);
        });
      }

      // Team 2 scored
      if (currentScore.team2 > prevScore.current.team2) {
        setTeam2ScoreChanged(true);
        Animated.sequence([
          Animated.timing(team2Anim, { toValue: 1.4, duration: 150, useNativeDriver: true }),
          Animated.timing(team2Anim, { toValue: 1, duration: 150, useNativeDriver: true }),
          Animated.timing(team2Anim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
          Animated.timing(team2Anim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start(() => {
          setTimeout(() => setTeam2ScoreChanged(false), 2000);
        });
      }
    }

    prevScore.current = { team1: currentScore.team1, team2: currentScore.team2 };
  }, [game.info?.score, game.isLive, enableScoreAnimation, team1Anim, team2Anim]);

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

  const renderScore = () => {
    if (!game.isLive || !game.info?.score) return null;

    return (
      <View style={styles.scoreContainer}>
        <Animated.View
          style={[
            styles.scoreWrapper,
            team1ScoreChanged && styles.scoreHighlight,
            { transform: [{ scale: team1Anim }] },
          ]}
        >
          <Text style={[styles.score, team1ScoreChanged && styles.scoreActive]}>
            {game.info.score.team1}
          </Text>
        </Animated.View>
        <Text style={styles.scoreDivider}>-</Text>
        <Animated.View
          style={[
            styles.scoreWrapper,
            team2ScoreChanged && styles.scoreHighlight,
            { transform: [{ scale: team2Anim }] },
          ]}
        >
          <Text style={[styles.score, team2ScoreChanged && styles.scoreActive]}>
            {game.info.score.team2}
          </Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {showCompetition && game.competition && (
        <Text style={styles.competition} numberOfLines={1}>
          {game.competition.name}
        </Text>
      )}

      <View style={styles.teamsRow}>
        <View style={styles.teams}>
          <Text style={styles.teamName} numberOfLines={1}>
            {game.team1Name}
          </Text>
          <Text style={styles.teamName} numberOfLines={1}>
            {game.team2Name}
          </Text>
        </View>

        {game.isLive ? (
          <View style={styles.liveInfo}>
            {renderScore()}
            <View style={styles.liveBadge}>
              <View style={styles.liveIndicator} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            {game.info?.currentPeriod && (
              <Text style={styles.period}>
                {convertPeriodName(game.info.currentPeriod, game.sportAlias)}
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.dateContainer}>
            <Text style={styles.date}>{formatDate(game.startTs)}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.marketsCount}>
          +{game.marketsCount} markets
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.backgroundCard,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  competition: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  teamsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teams: {
    flex: 1,
    marginRight: SPACING.md,
  },
  teamName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: 4,
  },
  liveInfo: {
    alignItems: 'flex-end',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreWrapper: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scoreHighlight: {
    backgroundColor: COLORS.success + '30',
  },
  score: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scoreActive: {
    color: COLORS.success,
  },
  scoreDivider: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textMuted,
    marginHorizontal: SPACING.xs,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: SPACING.xs,
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
  period: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  date: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  footer: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  marketsCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
  },
});
