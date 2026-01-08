// Game statistics types for different sports

export interface BaseStats {
  [key: string]: number | string | undefined;
}

export interface SoccerStats extends BaseStats {
  // Attacks
  attacks?: number;
  dangerousAttacks?: number;
  // Shots
  shotsOnTarget?: number;
  shotsOffTarget?: number;
  totalShots?: number;
  // Set pieces
  corners?: number;
  freeKicks?: number;
  throwIns?: number;
  // Discipline
  yellowCards?: number;
  redCards?: number;
  // Possession
  possession?: number;
  // Goals
  goals?: number;
}

export interface BasketballStats extends BaseStats {
  // Fouls
  fouls?: number;
  // Timeouts
  timeouts?: number;
  timeoutsRemaining?: number;
  // Scoring
  twoPointers?: number;
  threePointers?: number;
  freeThrows?: number;
  // Rebounds
  rebounds?: number;
  offensiveRebounds?: number;
  defensiveRebounds?: number;
  // Turnovers
  turnovers?: number;
  steals?: number;
}

export interface TennisStats extends BaseStats {
  // Service
  aces?: number;
  doubleFaults?: number;
  firstServe?: number;
  secondServe?: number;
  // Points
  breakPoints?: number;
  breakPointsWon?: number;
  // Games
  gamesWon?: number;
}

export interface IceHockeyStats extends BaseStats {
  shotsOnGoal?: number;
  powerPlays?: number;
  penalties?: number;
  faceoffsWon?: number;
}

export interface GameStatsData {
  team1: BaseStats;
  team2: BaseStats;
  sportAlias?: string;
}

export type StatItem = {
  key: string;
  label: string;
  team1Value: number;
  team2Value: number;
};
