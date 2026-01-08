/**
 * Sport Period Name Converter
 * Converts technical period names (e.g., "Soccerset1") to human-readable names (e.g., "1st Half")
 */

const PERIOD_NAMES: Record<string, string> = {
  // Soccer
  Soccerset0: '1st Half',
  Soccerset1: '1st Half',
  Soccerset2: '2nd Half',
  Soccerset3: 'Extra Time 1st Half',
  Soccerset4: 'Extra Time 2nd Half',
  Soccerset5: 'Penalties',
  Soccerset6: 'Full Time',
  Socceradditional_time1: 'Additional Time 1',
  Socceradditional_time2: 'Additional Time 2',
  Soccerpenalty: 'Penalty',
  Soccerfinished: 'Finished',
  Soccerwait: 'Waiting',
  Soccertimeout: 'Timeout',

  // Cyber Football
  CyberFootballset0: '1st Half',
  CyberFootballset1: '1st Half',
  CyberFootballset2: '2nd Half',
  CyberFootballset3: 'Extra Time 1st Half',
  CyberFootballset4: 'Extra Time 2nd Half',
  CyberFootballset5: 'Penalties',

  // Boxing
  Boxingset: 'Round',
  Boxingset0: 'Round 0',
  Boxingset1: 'Round 1',
  Boxingset2: 'Round 2',
  Boxingset3: 'Round 3',
  Boxingset4: 'Round 4',
  Boxingset5: 'Round 5',
  Boxingset6: 'Round 6',
  Boxingset7: 'Round 7',
  Boxingset8: 'Round 8',
  Boxingset9: 'Round 9',
  Boxingset10: 'Round 10',
  Boxingset11: 'Round 11',
  Boxingset12: 'Round 12',

  // Tennis
  Tennisset: 'Set',
  Tennisset0: 'Set 0',
  Tennisset1: 'Set 1',
  Tennisset2: 'Set 2',
  Tennisset3: 'Set 3',
  Tennisset4: 'Set 4',
  Tennisset5: 'Set 5',
  Tennisset6: 'Set 6',
  Tennisset7: 'Set 7',
  Tennisset8: 'Set 8',
  Tennisset9: 'Set 9',
  Tennisset10: 'Set 10',

  // Ice Hockey
  IceHockeyset: 'Period',
  IceHockeyset0: 'Period 0',
  IceHockeyset1: 'Period 1',
  IceHockeyset2: 'Period 2',
  IceHockeyset3: 'Period 3',
  IceHockeyset4: 'Overtime',
  'E-IceHockeyset': 'Period',
  'E-IceHockeyset0': 'Period 0',
  'E-IceHockeyset1': 'Period 1',
  'E-IceHockeyset2': 'Period 2',
  'E-IceHockeyset3': 'Period 3',
  'E-IceHockeyset4': 'Overtime',

  // Basketball
  Basketballset: 'Quarter',
  Basketballset0: 'Quarter 0',
  Basketballset1: '1st Quarter',
  Basketballset2: '2nd Quarter',
  Basketballset3: '3rd Quarter',
  Basketballset4: '4th Quarter',
  Basketballset5: 'Overtime',
  EBasketballset: 'Quarter',
  EBasketballset0: 'Quarter 0',
  EBasketballset1: '1st Quarter',
  EBasketballset2: '2nd Quarter',
  EBasketballset3: '3rd Quarter',
  EBasketballset4: '4th Quarter',
  EBasketballset5: 'Overtime',

  // Volleyball
  Volleyballset: 'Set',
  Volleyballset0: 'Set 0',
  Volleyballset1: 'Set 1',
  Volleyballset2: 'Set 2',
  Volleyballset3: 'Set 3',
  Volleyballset4: 'Set 4',
  Volleyballset5: 'Set 5',
  Volleyballset6: 'Set 6',
  Volleyballset7: 'Set 7',
  Volleyballset8: 'Set 8',
  Volleyballset9: 'Set 9',
  Volleyballset10: 'Set 10',

  // Handball
  Handballset: 'Half',
  Handballset0: '0 Half',
  Handballset1: '1st Half',
  Handballset2: '2nd Half',

  // Baseball
  Baseballset: 'Inning',
  Baseballset0: 'Inning 0',
  Baseballset1: '1st Inning',
  Baseballset2: '2nd Inning',
  Baseballset3: '3rd Inning',
  Baseballset4: '4th Inning',
  Baseballset5: '5th Inning',
  Baseballset6: '6th Inning',
  Baseballset7: '7th Inning',
  Baseballset8: '8th Inning',
  Baseballset9: '9th Inning',
  Baseballset10: 'Extra Inning',
  Baseballset11: '11th Inning',
  Baseballset12: '12th Inning',
  Baseballset13: '13th Inning',
  Baseballset14: '14th Inning',
  Baseballset15: '15th Inning',
  Baseballset16: '16th Inning',
  Baseballset17: '17th Inning',
  Baseballset18: '18th Inning',
  Baseballset19: '19th Inning',
  Baseballset20: '20th Inning',
  Baseballset21: '21st Inning',
  Baseballset22: '22nd Inning',
  Baseballset23: '23rd Inning',
  Baseballset24: '24th Inning',
  Baseballset25: '25th Inning',

  // Beach Volleyball
  BeachVolleyballset: 'Set',
  BeachVolleyballset1: 'Set 1',
  BeachVolleyballset2: 'Set 2',
  BeachVolleyballset3: 'Set 3',

  // Beach Soccer/Football
  BeachSoccerset: 'Period',
  BeachSoccerset1: 'Period 1',
  BeachSoccerset2: 'Period 2',
  BeachSoccerset3: 'Period 3',
  BeachFootballset: 'Period',
  BeachFootballset1: 'Period 1',
  BeachFootballset2: 'Period 2',
  BeachFootballset3: 'Period 3',

  // Rugby
  Rugbyset: 'Time',
  Rugbyset0: 'Time 0',
  Rugbyset1: '1st Half',
  Rugbyset2: '2nd Half',
  RugbyLeagueset: 'Half',
  RugbyLeagueset1: '1st Half',
  RugbyLeagueset2: '2nd Half',
  RugbyUnionset: 'Half',
  RugbyUnionset1: '1st Half',
  RugbyUnionset2: '2nd Half',

  // Snooker
  Snookerset: 'Frame',
  Snookerset0: 'Frame 0',
  Snookerset1: 'Frame 1',
  Snookerset2: 'Frame 2',
  Snookerset3: 'Frame 3',
  Snookerset4: 'Frame 4',
  Snookerset5: 'Frame 5',
  Snookerset6: 'Frame 6',
  Snookerset7: 'Frame 7',
  Snookerset8: 'Frame 8',
  Snookerset9: 'Frame 9',
  Snookerset10: 'Frame 10',
  Snookerset11: 'Frame 11',
  Snookerset12: 'Frame 12',
  Snookerset13: 'Frame 13',
  Snookerset14: 'Frame 14',
  Snookerset15: 'Frame 15',
  Snookerset16: 'Frame 16',
  Snookerset17: 'Frame 17',
  Snookerset18: 'Frame 18',
  Snookerset19: 'Frame 19',
  Snookerset20: 'Frame 20',

  // American Football
  AmericanFootballset: 'Quarter',
  AmericanFootballset0: 'Quarter 0',
  AmericanFootballset1: '1st Quarter',
  AmericanFootballset2: '2nd Quarter',
  AmericanFootballset3: '3rd Quarter',
  AmericanFootballset4: '4th Quarter',

  // Australian Football
  AustralianFootballset: 'Quarter',
  AustralianFootballset0: 'Quarter 0',
  AustralianFootballset1: '1st Quarter',
  AustralianFootballset2: '2nd Quarter',
  AustralianFootballset3: '3rd Quarter',
  AustralianFootballset4: '4th Quarter',

  // Water Polo
  WaterPoloset: 'Period',
  WaterPoloset0: 'Period 0',
  WaterPoloset1: 'Period 1',
  WaterPoloset2: 'Period 2',
  WaterPoloset3: 'Period 3',
  WaterPoloset4: 'Period 4',
  WaterPoloset5: 'Period 5',
  WaterPoloset6: 'Period 6',

  // Mini Soccer
  MiniSoccerset: 'Time',
  MiniSoccerset0: 'Time 0',
  MiniSoccerset1: '1st Half',
  MiniSoccerset2: '2nd Half',

  // Ball Hockey
  BallHockeyset: 'Period',
  BallHockeyset1: 'Period 1',
  BallHockeyset2: 'Period 2',

  // Table Tennis
  TableTennisset: 'Set',
  TableTennisset1: 'Set 1',
  TableTennisset2: 'Set 2',
  TableTennisset3: 'Set 3',
  TableTennisset4: 'Set 4',
  TableTennisset5: 'Set 5',
  TableTennisset6: 'Set 6',
  TableTennisset7: 'Set 7',

  // Badminton
  Badmintonset: 'Game',
  Badmintonset1: 'Game 1',
  Badmintonset2: 'Game 2',
  Badmintonset3: 'Game 3',

  // Squash
  Squashset: 'Game',
  Squashset0: ' 0',
  Squashset1: 'Game 1',
  Squashset2: 'Game 2',
  Squashset3: 'Game 3',
  Squashset4: 'Game 4',
  Squashset5: 'Game 5',

  // Netball
  Netballset: 'Quarter',
  Netballset1: '1st Quarter',
  Netballset2: '2nd Quarter',
  Netballset3: '3rd Quarter',
  Netballset4: '4th Quarter',

  // eSports - Dota 2
  Dotaset: 'Game',
  Dotaset1: 'Game 1',
  Dotaset2: 'Game 2',
  Dotaset3: 'Game 3',
  Dotaset4: 'Game 4',
  Dotaset5: 'Game 5',
  Dotaset6: 'Game 6',
  Dotaset7: 'Game 7',
  Dota2set: 'Game',
  Dota2set1: 'Game 1',
  Dota2set2: 'Game 2',
  Dota2set3: 'Game 3',
  Dota2set4: 'Game 4',
  Dota2set5: 'Game 5',
  Dota2set6: 'Game 6',
  Dota2set7: 'Game 7',

  // eSports - Counter Strike
  CounterStrikeset: 'Map',
  CounterStrikeset1: 'Map 1',
  CounterStrikeset2: 'Map 2',
  CounterStrikeset3: 'Map 3',
  CounterStrikeset4: 'Map 4',
  CounterStrikeset5: 'Map 5',
  CounterStrikeset6: 'Map 6',
  CounterStrikeset7: 'Map 7',

  // eSports - Hearthstone
  Hearthstoneset: 'Game',
  Hearthstoneset1: 'Game 1',
  Hearthstoneset2: 'Game 2',
  Hearthstoneset3: 'Game 3',
  Hearthstoneset4: 'Game 4',
  Hearthstoneset5: 'Game 5',
  Hearthstoneset6: 'Game 6',
  Hearthstoneset7: 'Game 7',

  // eSports - Heroes of the Storm
  HeroesOfTheStorm: 'Game',
  HeroesOfTheStorm1: 'Game 1',
  HeroesOfTheStorm2: 'Game 2',
  HeroesOfTheStorm3: 'Game 3',
  HeroesOfTheStorm4: 'Game 4',
  HeroesOfTheStorm5: 'Game 5',
  HeroesOfTheStorm6: 'Game 6',
  HeroesOfTheStorm7: 'Game 7',

  // eSports - League of Legends
  LeagueOfLegendsset: 'Game',
  LeagueOfLegendsset1: 'Game 1',
  LeagueOfLegendsset2: 'Game 2',
  LeagueOfLegendsset3: 'Game 3',
  LeagueOfLegendsset4: 'Game 4',
  LeagueOfLegendsset5: 'Game 5',
  LeagueOfLegendsset6: 'Game 6',
  LeagueOfLegendsset7: 'Game 7',
  LeagueofLegendsset: 'Game',
  LeagueofLegendsset1: 'Game 1',
  LeagueofLegendsset2: 'Game 2',
  LeagueofLegendsset3: 'Game 3',
  LeagueofLegendsset4: 'Game 4',
  LeagueofLegendsset5: 'Game 5',
  LeagueofLegendsset6: 'Game 6',
  LeagueofLegendsset7: 'Game 7',

  // eSports - StarCraft
  StarCraftset: 'Map',
  StarCraftset1: 'Map 1',
  StarCraftset2: 'Map 2',
  StarCraftset3: 'Map 3',
  StarCraftset4: 'Map 4',
  StarCraftset5: 'Map 5',
  StarCraftset6: 'Map 6',
  StarCraftset7: 'Map 7',
  StarCraft2set: 'Map',
  StarCraft2set1: 'Map 1',
  StarCraft2set2: 'Map 2',
  StarCraft2set3: 'Map 3',
  StarCraft2set4: 'Map 4',
  StarCraft2set5: 'Map 5',
  StarCraft2set6: 'Map 6',
  StarCraft2set7: 'Map 7',

  // Generic sets
  set: 'Set',
  set0: 'Set 0',
  set1: 'Set 1',
  set2: 'Set 2',
  set3: 'Set 3',
  set4: 'Set 4',
  set5: 'Set 5',
  set6: 'Set 6',
  set7: 'Set 7',
  set8: 'Set 8',
  set9: 'Set 9',
  set10: 'Set 10',
  set11: 'Set 11',
  set12: 'Set 12',
  set13: 'Set 13',
  set14: 'Set 14',
  set15: 'Set 15',
  set16: 'Set 16',
  set17: 'Set 17',
  set18: 'Set 18',
  set19: 'Set 19',
  set20: 'Set 20',

  // Futsal
  Futsalset: 'Half',
  Futsalset1: '1st Half',
  Futsalset2: '2nd Half',
  Futsalset3: 'Extra Time 1st Half',
  Futsalset4: 'Extra Time 2nd Half',
  Futsalset5: 'Penalties',

  // Fighting Games
  MortalKombatXLset: 'Game',
  MortalKombatXLset1: 'Game 1',
  MortalKombatXLset2: 'Game 2',
  MortalKombatXLset3: 'Game 3',
  MortalKombatXLset4: 'Game 4',
  MortalKombatXLset5: 'Game 5',
  StreetFighterVset: 'Game',
  StreetFighterVset1: 'Game 1',
  StreetFighterVset2: 'Game 2',
  StreetFighterVset3: 'Game 3',
  StreetFighterVset4: 'Game 4',
  StreetFighterVset5: 'Game 5',

  // Cricket
  Cricketset: 'Innings',
  Cricketset0: 'Innings 0',
  Cricketset1: '1st Innings',
  Cricketset2: '2nd Innings',

  // Floorball
  Floorballset: 'Period',
  Floorballset0: 'Period 0',
  Floorballset1: 'Period 1',
  Floorballset2: 'Period 2',
  Floorballset3: 'Period 3',
  Floorballset4: 'Period 4',

  // Hockey (Field)
  Hockeyset: 'Period',
  Hockeyset0: 'Period 0',
  Hockeyset1: 'Period 1',
  Hockeyset2: 'Period 2',
  Hockeyset3: 'Period 3',
  Hockeyset4: 'Period 4',

  // Darts
  Dartsset1: 'Leg 1',
  Dartsset2: 'Leg 2',
  Dartsset3: 'Leg 3',
  Dartsset4: 'Leg 4',
  Dartsset5: 'Leg 5',

  // 3x3 Basketball
  '3x3 Basketballset1': '1st Period',

  // Common states
  finished: 'Finished',
};

/**
 * Convert a period identifier to a human-readable name
 * @param periodId - The raw period identifier (e.g., "set1", "1")
 * @param sportAlias - The sport alias (e.g., "Soccer", "Basketball")
 * @returns Human-readable period name
 */
export function convertPeriodName(periodId: string, sportAlias?: string): string {
  if (!periodId) return '';

  // Try with sport prefix first
  if (sportAlias) {
    const sportKey = `${sportAlias}${periodId}`;
    if (PERIOD_NAMES[sportKey]) {
      return PERIOD_NAMES[sportKey];
    }

    // Try with lowercase sport
    const sportKeyLower = `${sportAlias.toLowerCase()}${periodId}`;
    if (PERIOD_NAMES[sportKeyLower]) {
      return PERIOD_NAMES[sportKeyLower];
    }
  }

  // Try direct match
  if (PERIOD_NAMES[periodId]) {
    return PERIOD_NAMES[periodId];
  }

  // Try generic set format
  const setKey = `set${periodId}`;
  if (PERIOD_NAMES[setKey]) {
    return PERIOD_NAMES[setKey];
  }

  // Return the original if no match
  return periodId;
}

/**
 * Get period info for a sport
 * @param sportAlias - The sport alias
 * @returns Object with period label (e.g., "Half", "Quarter", "Set")
 */
export function getSportPeriodLabel(sportAlias: string): string {
  const periodLabels: Record<string, string> = {
    Soccer: 'Half',
    Football: 'Half',
    Basketball: 'Quarter',
    Tennis: 'Set',
    Volleyball: 'Set',
    IceHockey: 'Period',
    Baseball: 'Inning',
    Handball: 'Half',
    AmericanFootball: 'Quarter',
    TableTennis: 'Set',
    Badminton: 'Game',
    Cricket: 'Innings',
    Rugby: 'Half',
    Snooker: 'Frame',
    Darts: 'Leg',
    Boxing: 'Round',
    MMA: 'Round',
    UFC: 'Round',
    Dota2: 'Game',
    CounterStrike: 'Map',
    LeagueOfLegends: 'Game',
    Futsal: 'Half',
    WaterPolo: 'Period',
    Floorball: 'Period',
  };

  return periodLabels[sportAlias] || 'Period';
}
