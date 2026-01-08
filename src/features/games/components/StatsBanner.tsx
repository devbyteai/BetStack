import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { StatBar } from './StatBar';
import type { GameStatsData, StatItem } from '../types';

interface StatsBannerProps {
  stats?: GameStatsData;
  team1Name: string;
  team2Name: string;
  sportAlias?: string;
  isLive?: boolean;
}

// Soccer stats configuration
const SOCCER_STATS: { key: string; label: string }[] = [
  { key: 'possession', label: 'Possession' },
  { key: 'shotsOnTarget', label: 'Shots On Target' },
  { key: 'totalShots', label: 'Total Shots' },
  { key: 'corners', label: 'Corners' },
  { key: 'dangerousAttacks', label: 'Dangerous Attacks' },
  { key: 'yellowCards', label: 'Yellow Cards' },
  { key: 'redCards', label: 'Red Cards' },
];

// Basketball stats configuration
const BASKETBALL_STATS: { key: string; label: string }[] = [
  { key: 'fouls', label: 'Fouls' },
  { key: 'timeoutsRemaining', label: 'Timeouts' },
  { key: 'turnovers', label: 'Turnovers' },
  { key: 'rebounds', label: 'Rebounds' },
];

// Tennis stats configuration
const TENNIS_STATS: { key: string; label: string }[] = [
  { key: 'aces', label: 'Aces' },
  { key: 'doubleFaults', label: 'Double Faults' },
  { key: 'breakPointsWon', label: 'Break Points Won' },
];

// Ice Hockey stats configuration
const HOCKEY_STATS: { key: string; label: string }[] = [
  { key: 'shotsOnGoal', label: 'Shots On Goal' },
  { key: 'powerPlays', label: 'Power Plays' },
  { key: 'penalties', label: 'Penalties' },
];

// Generic stats for unknown sports
const GENERIC_STATS: { key: string; label: string }[] = [
  { key: 'attacks', label: 'Attacks' },
  { key: 'shots', label: 'Shots' },
  { key: 'corners', label: 'Corners' },
  { key: 'fouls', label: 'Fouls' },
];

const getStatsConfig = (sportAlias?: string): { key: string; label: string }[] => {
  switch (sportAlias?.toLowerCase()) {
    case 'soccer':
    case 'football':
      return SOCCER_STATS;
    case 'basketball':
      return BASKETBALL_STATS;
    case 'tennis':
      return TENNIS_STATS;
    case 'icehockey':
    case 'ice_hockey':
    case 'ice-hockey':
      return HOCKEY_STATS;
    default:
      return GENERIC_STATS;
  }
};

export const StatsBanner: React.FC<StatsBannerProps> = ({
  stats,
  team1Name,
  team2Name,
  sportAlias,
  isLive = false,
}) => {
  const statItems = useMemo((): StatItem[] => {
    if (!stats?.team1 || !stats?.team2) return [];

    const config = getStatsConfig(sportAlias);
    const items: StatItem[] = [];

    for (const { key, label } of config) {
      const team1Value = parseStatValue(stats.team1[key]);
      const team2Value = parseStatValue(stats.team2[key]);

      // Only include stats where at least one team has a value
      if (team1Value !== undefined || team2Value !== undefined) {
        items.push({
          key,
          label,
          team1Value: team1Value ?? 0,
          team2Value: team2Value ?? 0,
        });
      }
    }

    return items;
  }, [stats, sportAlias]);

  // Don't render if no stats available
  if (!stats || statItems.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.teamName} numberOfLines={1}>
          {team1Name}
        </Text>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Stats</Text>
          {isLive && <View style={styles.liveDot} />}
        </View>
        <Text style={[styles.teamName, styles.teamNameRight]} numberOfLines={1}>
          {team2Name}
        </Text>
      </View>
      <View style={styles.statsContainer}>
        {statItems.map((item) => (
          <StatBar
            key={item.key}
            label={item.label}
            team1Value={item.team1Value}
            team2Value={item.team2Value}
            showPercentage={item.key === 'possession'}
          />
        ))}
      </View>
    </View>
  );
};

const parseStatValue = (value: unknown): number | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  teamName: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.text,
  },
  teamNameRight: {
    textAlign: 'right',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.error,
    marginLeft: 6,
  },
  statsContainer: {
    padding: SPACING.md,
  },
});
