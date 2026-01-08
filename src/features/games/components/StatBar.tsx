import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';

interface StatBarProps {
  label: string;
  team1Value: number;
  team2Value: number;
  team1Color?: string;
  team2Color?: string;
  showPercentage?: boolean;
}

export const StatBar: React.FC<StatBarProps> = ({
  label,
  team1Value,
  team2Value,
  team1Color = COLORS.primary,
  team2Color = COLORS.error,
  showPercentage = false,
}) => {
  const total = team1Value + team2Value;
  const team1Percent = total > 0 ? (team1Value / total) * 100 : 50;
  const team2Percent = total > 0 ? (team2Value / total) * 100 : 50;

  const formatValue = (value: number): string => {
    if (showPercentage) {
      return `${Math.round(value)}%`;
    }
    return value.toString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.value}>{formatValue(team1Value)}</Text>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{formatValue(team2Value)}</Text>
      </View>
      <View style={styles.barContainer}>
        <View
          style={[
            styles.barSegment,
            styles.team1Bar,
            { width: `${team1Percent}%`, backgroundColor: team1Color },
          ]}
        />
        <View
          style={[
            styles.barSegment,
            styles.team2Bar,
            { width: `${team2Percent}%`, backgroundColor: team2Color },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  value: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  barContainer: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.backgroundInput,
    overflow: 'hidden',
  },
  barSegment: {
    height: '100%',
  },
  team1Bar: {
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  team2Bar: {
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
});
