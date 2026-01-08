import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '@/shared/constants';

export type LiveEventType =
  | 'goal'
  | 'red_card'
  | 'yellow_card'
  | 'penalty'
  | 'corner'
  | 'substitution'
  | 'half_time'
  | 'full_time'
  | 'period_end';

export interface LiveEvent {
  type: LiveEventType;
  team?: 1 | 2;
  player?: string;
  minute?: string;
}

interface LiveEventAnimationProps {
  event: LiveEvent | null;
  onAnimationComplete?: () => void;
}

const ANIMATION_DURATION = 2500;

const EVENT_CONFIG: Record<LiveEventType, { icon: string; color: string; label: string }> = {
  goal: { icon: '⚽', color: COLORS.success, label: 'GOAL!' },
  red_card: { icon: '🟥', color: COLORS.error, label: 'RED CARD' },
  yellow_card: { icon: '🟨', color: '#FFD700', label: 'YELLOW CARD' },
  penalty: { icon: '⚽', color: COLORS.warning, label: 'PENALTY!' },
  corner: { icon: '🚩', color: COLORS.primary, label: 'CORNER' },
  substitution: { icon: '🔄', color: COLORS.secondary, label: 'SUBSTITUTION' },
  half_time: { icon: '⏱️', color: COLORS.textSecondary, label: 'HALF TIME' },
  full_time: { icon: '🏁', color: COLORS.textSecondary, label: 'FULL TIME' },
  period_end: { icon: '⏱️', color: COLORS.textSecondary, label: 'PERIOD END' },
};

export const LiveEventAnimation: React.FC<LiveEventAnimationProps> = ({
  event,
  onAnimationComplete,
}) => {
  const [visible, setVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!event) return;

    setVisible(true);

    // Start animation sequence
    Animated.parallel([
      // Container fade in and scale
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        // Hold
        Animated.delay(ANIMATION_DURATION - 500),
        // Fade out
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]),
      // Icon bounce animation
      Animated.sequence([
        Animated.delay(100),
        Animated.spring(iconScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 5,
        }),
        Animated.sequence([
          Animated.loop(
            Animated.sequence([
              Animated.timing(iconScale, {
                toValue: 1.2,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(iconScale, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }),
            ]),
            { iterations: 3 }
          ),
        ]),
      ]),
    ]).start(() => {
      setVisible(false);
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      iconScale.setValue(0);
      onAnimationComplete?.();
    });
  }, [event, scaleAnim, opacityAnim, iconScale, onAnimationComplete]);

  if (!visible || !event) return null;

  const config = EVENT_CONFIG[event.type];

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View
        style={[
          styles.container,
          { borderColor: config.color },
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.icon,
            {
              transform: [{ scale: iconScale }],
            },
          ]}
        >
          {config.icon}
        </Animated.Text>
        <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
        {event.minute && (
          <Text style={styles.minute}>{event.minute}'</Text>
        )}
        {event.player && (
          <Text style={styles.player} numberOfLines={1}>
            {event.player}
          </Text>
        )}
      </Animated.View>
    </View>
  );
};

// Component for showing score change animation
interface ScoreChangeAnimationProps {
  team: 1 | 2;
  visible: boolean;
}

export const ScoreChangeAnimation: React.FC<ScoreChangeAnimationProps> = ({
  team,
  visible,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      pulseAnim.setValue(1);
      colorAnim.setValue(0);
      return;
    }

    Animated.parallel([
      // Pulse animation
      Animated.sequence([
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.3,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 3 }
        ),
      ]),
      // Color flash
      Animated.sequence([
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.delay(1000),
        Animated.timing(colorAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  }, [visible, pulseAnim, colorAnim]);

  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', COLORS.success + '30'],
  });

  const borderColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', COLORS.success],
  });

  return (
    <Animated.View
      style={[
        styles.scoreChangeOverlay,
        team === 1 ? styles.scoreChangeTeam1 : styles.scoreChangeTeam2,
        {
          transform: [{ scale: pulseAnim }],
          backgroundColor,
          borderColor,
        },
      ]}
    />
  );
};

// Indicator component for showing live event badge
interface LiveEventIndicatorProps {
  eventType: LiveEventType;
  size?: 'small' | 'medium' | 'large';
}

export const LiveEventIndicator: React.FC<LiveEventIndicatorProps> = ({
  eventType,
  size = 'small',
}) => {
  const config = EVENT_CONFIG[eventType];
  const sizeStyles = {
    small: { fontSize: 14, padding: 4 },
    medium: { fontSize: 18, padding: 6 },
    large: { fontSize: 24, padding: 8 },
  };

  return (
    <View
      style={[
        styles.indicator,
        { backgroundColor: config.color + '20', borderColor: config.color },
        { padding: sizeStyles[size].padding },
      ]}
    >
      <Text style={{ fontSize: sizeStyles[size].fontSize }}>{config.icon}</Text>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 100,
  },
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 3,
    minWidth: width * 0.6,
    maxWidth: width * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  minute: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  player: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  scoreChangeOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '50%',
    borderWidth: 2,
    borderRadius: 4,
  },
  scoreChangeTeam1: {
    left: 0,
    borderRightWidth: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  scoreChangeTeam2: {
    right: 0,
    borderLeftWidth: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  indicator: {
    borderRadius: 8,
    borderWidth: 1,
  },
});

export default LiveEventAnimation;
