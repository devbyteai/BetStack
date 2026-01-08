/**
 * Event ID to Name Mapping for Live Sports Events
 * Maps numeric event IDs to human-readable event names
 */

export const EventIDToNameMap: Record<number, string> = {
  // General Events
  1: 'Goal',
  2: 'Red Card',
  3: 'Yellow Card',
  4: 'Corner',
  5: 'Penalty',
  6: 'Substitution',
  10: 'Period',
  20: 'Ball Safe',
  21: 'Dangerous Attack',
  22: 'Kick Off',
  23: 'Goal Kick',
  24: 'Free Kick',
  25: 'Throw In',
  26: 'Shot Off Target',
  27: 'Shot On Target',
  28: 'Offside',
  29: 'Goalkeeper Save',
  30: 'Shot Blocked',

  // Soccer Match States
  100: 'Not Started',
  101: 'First Half',
  102: 'Half Time',
  103: 'Second Half',
  104: 'Pre Extra Half',
  105: 'Extra Time 1st Half',
  106: 'Extra Time Half Time',
  107: 'Extra Time 2nd Half',
  108: 'Finished',
  199: 'Timeout',

  // Tennis Events
  200: 'First Set',
  201: 'Second Set',
  202: 'Third Set',
  203: 'Fourth Set',
  204: 'Fifth Set',
  205: 'Point',
  206: 'Ball In Play',
  207: 'Service Fault',
  208: 'Double Fault',
  209: 'Ace',
  210: 'Injury Break',
  211: 'Rain Delay',
  212: 'Challenge',
  213: 'Final Set',
  214: 'Let 1st Serve',
  215: 'Retired',
  216: 'Walkover',
  217: 'Game',
  218: 'Set',

  // Basketball Events
  300: 'First Quarter',
  301: 'First Quarter Ended',
  302: 'Second Quarter',
  303: 'Second Quarter Ended',
  304: 'Third Quarter',
  305: 'Third Quarter Ended',
  306: 'Fourth Quarter',
  307: 'Fourth Quarter Ended',
  308: 'Over Time',
  309: 'Over Time Ended',
  320: 'Foul',
  321: 'Free Throw',
  322: 'Free 1 Throw',
  323: 'Free 2 Throws',
  324: 'Free 3 Throws',
  325: 'Missed Free Throw',
  326: 'Attack',
  327: 'One Point',
  328: 'Two Points',
  329: 'Three Points',

  // Ice Hockey Events
  400: 'First Period',
  401: 'First Period Ended',
  402: 'Second Period',
  403: 'Second Period Ended',
  404: 'Third Period',
  405: 'Third Period Ended',
  410: 'Timer Status',
  420: 'Suspension',
  421: 'Suspension Over',

  // Handball Events
  500: 'Throw In',
  501: 'Throw Out',
  502: 'Goalkeeper Throw',
  503: 'Free Throw',
  504: 'Seven Meter Throw',
  505: 'Penalty Scored',
  506: 'Penalty Missed',
};

/**
 * Get human-readable event name from event ID
 */
export function getEventName(eventId: number): string {
  return EventIDToNameMap[eventId] || `Event ${eventId}`;
}

/**
 * Event category for grouping/styling
 */
export type EventCategory = 'goal' | 'card' | 'period' | 'score' | 'general';

/**
 * Get event category for styling purposes
 */
export function getEventCategory(eventId: number): EventCategory {
  // Goals
  if (eventId === 1 || eventId === 505) return 'goal';

  // Cards
  if (eventId === 2 || eventId === 3) return 'card';

  // Period changes
  if (
    [10, 100, 101, 102, 103, 104, 105, 106, 107, 108, 199, 200, 201, 202, 203, 204, 213, 217, 218, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 400, 401, 402, 403, 404, 405].includes(eventId)
  ) {
    return 'period';
  }

  // Scoring events
  if ([205, 327, 328, 329].includes(eventId)) return 'score';

  return 'general';
}

/**
 * Get event icon/emoji for display
 */
export function getEventIcon(eventId: number): string {
  const icons: Record<number, string> = {
    1: '\u26BD', // Goal - soccer ball
    2: '\uD83D\uDFE5', // Red Card
    3: '\uD83D\uDFE8', // Yellow Card
    4: '\uD83D\uDEA9', // Corner - flag
    5: '\u26BD', // Penalty
    6: '\uD83D\uDD04', // Substitution
    21: '\u26A0\uFE0F', // Dangerous Attack
    27: '\uD83C\uDFAF', // Shot On Target
    28: '\uD83D\uDEAB', // Offside
    29: '\uD83E\uDD45', // Goalkeeper Save
    108: '\uD83C\uDFC1', // Finished
    209: '\uD83C\uDFBE', // Ace (tennis)
    320: '\uD83D\uDE45', // Foul
    328: '\uD83C\uDFC0', // Two Points (basketball)
    329: '\uD83C\uDFC0', // Three Points (basketball)
  };

  return icons[eventId] || '\u2022'; // Bullet point as default
}
