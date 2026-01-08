import { useState, useEffect, useRef, useCallback } from 'react';
import type { LiveEvent, LiveEventType } from '../components/LiveEventAnimation';

interface GameScore {
  team1: number;
  team2: number;
}

interface UseLiveEventAnimationsOptions {
  gameId: string;
  currentScore?: GameScore;
  enabled?: boolean;
}

interface UseLiveEventAnimationsReturn {
  currentEvent: LiveEvent | null;
  team1ScoreChanged: boolean;
  team2ScoreChanged: boolean;
  clearEvent: () => void;
  triggerEvent: (event: LiveEvent) => void;
}

export const useLiveEventAnimations = ({
  gameId,
  currentScore,
  enabled = true,
}: UseLiveEventAnimationsOptions): UseLiveEventAnimationsReturn => {
  const [currentEvent, setCurrentEvent] = useState<LiveEvent | null>(null);
  const [team1ScoreChanged, setTeam1ScoreChanged] = useState(false);
  const [team2ScoreChanged, setTeam2ScoreChanged] = useState(false);
  const previousScore = useRef<GameScore | undefined>(undefined);
  const eventQueue = useRef<LiveEvent[]>([]);
  const isAnimating = useRef(false);

  // Process next event in queue
  const processNextEvent = useCallback(() => {
    if (eventQueue.current.length === 0) {
      isAnimating.current = false;
      return;
    }

    isAnimating.current = true;
    const nextEvent = eventQueue.current.shift()!;
    setCurrentEvent(nextEvent);
  }, []);

  // Clear current event and process next
  const clearEvent = useCallback(() => {
    setCurrentEvent(null);
    setTeam1ScoreChanged(false);
    setTeam2ScoreChanged(false);

    // Small delay before processing next event
    setTimeout(() => {
      processNextEvent();
    }, 300);
  }, [processNextEvent]);

  // Trigger a new event
  const triggerEvent = useCallback((event: LiveEvent) => {
    if (!enabled) return;

    eventQueue.current.push(event);

    if (!isAnimating.current) {
      processNextEvent();
    }
  }, [enabled, processNextEvent]);

  // Detect score changes
  useEffect(() => {
    if (!enabled || !currentScore) return;

    const prevScore = previousScore.current;

    // Skip first render (initial score)
    if (!prevScore) {
      previousScore.current = currentScore;
      return;
    }

    // Check for team 1 goal
    if (currentScore.team1 > prevScore.team1) {
      setTeam1ScoreChanged(true);
      triggerEvent({
        type: 'goal',
        team: 1,
      });
    }

    // Check for team 2 goal
    if (currentScore.team2 > prevScore.team2) {
      setTeam2ScoreChanged(true);
      triggerEvent({
        type: 'goal',
        team: 2,
      });
    }

    previousScore.current = currentScore;
  }, [currentScore, enabled, triggerEvent, gameId]);

  // Reset when game changes
  useEffect(() => {
    previousScore.current = undefined;
    setCurrentEvent(null);
    setTeam1ScoreChanged(false);
    setTeam2ScoreChanged(false);
    eventQueue.current = [];
    isAnimating.current = false;
  }, [gameId]);

  return {
    currentEvent,
    team1ScoreChanged,
    team2ScoreChanged,
    clearEvent,
    triggerEvent,
  };
};

// Helper function to map backend event types to animation types
export const mapEventType = (backendType: string): LiveEventType | null => {
  const eventMap: Record<string, LiveEventType> = {
    goal: 'goal',
    Goal: 'goal',
    GOAL: 'goal',
    red_card: 'red_card',
    RedCard: 'red_card',
    RED_CARD: 'red_card',
    yellow_card: 'yellow_card',
    YellowCard: 'yellow_card',
    YELLOW_CARD: 'yellow_card',
    penalty: 'penalty',
    Penalty: 'penalty',
    PENALTY: 'penalty',
    corner: 'corner',
    Corner: 'corner',
    CORNER: 'corner',
    substitution: 'substitution',
    Substitution: 'substitution',
    SUBSTITUTION: 'substitution',
    half_time: 'half_time',
    HalfTime: 'half_time',
    HALF_TIME: 'half_time',
    full_time: 'full_time',
    FullTime: 'full_time',
    FULL_TIME: 'full_time',
    period_end: 'period_end',
    PeriodEnd: 'period_end',
    PERIOD_END: 'period_end',
  };

  return eventMap[backendType] || null;
};

export default useLiveEventAnimations;
