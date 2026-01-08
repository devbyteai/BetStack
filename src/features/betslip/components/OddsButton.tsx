import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useOddsFormat } from '@/shared/hooks/useOddsFormat';
import {
  addSelection,
  selectIsSelectionInBetslip,
  openBetslip,
  selectQuickBetEnabled,
  openQuickBetDialog,
} from '../store';
import type { BetSelection } from '../types';

interface OddsButtonProps {
  eventId: string;
  gameId: string;
  marketId: string;
  odds: number;
  eventName: string;
  marketName: string;
  team1Name: string;
  team2Name: string;
  competitionName?: string;
  sportAlias?: string;
  isLive?: boolean;
  isSuspended?: boolean;
  gameStartTime?: string;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

export const OddsButton: React.FC<OddsButtonProps> = ({
  eventId,
  gameId,
  marketId,
  odds,
  eventName,
  marketName,
  team1Name,
  team2Name,
  competitionName = '',
  sportAlias = '',
  isLive = false,
  isSuspended = false,
  gameStartTime,
  size = 'medium',
  disabled = false,
}) => {
  const dispatch = useAppDispatch();
  const isSelected = useAppSelector(selectIsSelectionInBetslip(eventId));
  const quickBetEnabled = useAppSelector(selectQuickBetEnabled);
  const { formatOdds } = useOddsFormat();
  const [previousOdds, setPreviousOdds] = useState(odds);
  const [oddsDirection, setOddsDirection] = useState<'up' | 'down' | null>(null);
  const flashAnim = useRef(new Animated.Value(0)).current;

  // Track odds changes
  useEffect(() => {
    if (odds !== previousOdds) {
      setOddsDirection(odds > previousOdds ? 'up' : 'down');
      setPreviousOdds(odds);

      // Flash animation
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setOddsDirection(null);
      });
    }
  }, [odds, previousOdds, flashAnim]);

  const handlePress = useCallback(() => {
    if (disabled || isSuspended) return;

    const selection: BetSelection = {
      id: `${gameId}-${marketId}-${eventId}`,
      eventId,
      gameId,
      marketId,
      odds,
      initialOdds: odds,
      eventName,
      marketName,
      team1Name,
      team2Name,
      competitionName,
      sportAlias,
      isLive,
      isSuspended: false,
      gameStartTime,
    };

    // If quick bet mode is enabled and this is a live game, open quick bet dialog
    if (quickBetEnabled && isLive) {
      dispatch(openQuickBetDialog(selection));
    } else {
      // Normal behavior: add to betslip
      dispatch(addSelection(selection));
      dispatch(openBetslip());
    }
  }, [
    dispatch,
    eventId,
    gameId,
    marketId,
    odds,
    eventName,
    marketName,
    team1Name,
    team2Name,
    competitionName,
    sportAlias,
    isLive,
    gameStartTime,
    disabled,
    isSuspended,
    quickBetEnabled,
  ]);

  const sizeStyles = {
    small: { width: 50, height: 32, fontSize: FONT_SIZES.xs },
    medium: { width: 65, height: 40, fontSize: FONT_SIZES.sm },
    large: { width: 80, height: 48, fontSize: FONT_SIZES.md },
  };

  const currentSize = sizeStyles[size];

  const backgroundColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      isSelected ? COLORS.primary : COLORS.surface,
      oddsDirection === 'up' ? COLORS.success : COLORS.error,
    ],
  });

  if (isSuspended) {
    return (
      <View
        style={[
          styles.container,
          styles.suspended,
          { width: currentSize.width, height: currentSize.height },
        ]}
      >
        <Text style={styles.suspendedText}>-</Text>
      </View>
    );
  }

  return (
    <Animated.View style={{ backgroundColor, borderRadius: 6 }}>
      <TouchableOpacity
        style={[
          styles.container,
          isSelected && styles.selected,
          disabled && styles.disabled,
          { width: currentSize.width, height: currentSize.height },
        ]}
        onPress={handlePress}
        disabled={disabled || isSuspended}
        activeOpacity={0.7}
      >
        {oddsDirection && (
          <Text style={[styles.arrow, oddsDirection === 'up' ? styles.arrowUp : styles.arrowDown]}>
            {oddsDirection === 'up' ? '▲' : '▼'}
          </Text>
        )}
        <Text
          style={[
            styles.odds,
            isSelected && styles.oddsSelected,
            { fontSize: currentSize.fontSize },
          ]}
        >
          {formatOdds(odds)}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
  },
  selected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  suspended: {
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.border,
  },
  suspendedText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  odds: {
    color: COLORS.text,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  oddsSelected: {
    color: COLORS.textOnPrimary,
  },
  arrow: {
    fontSize: 8,
    marginRight: 2,
  },
  arrowUp: {
    color: COLORS.success,
  },
  arrowDown: {
    color: COLORS.error,
  },
});
