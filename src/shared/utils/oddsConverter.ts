/**
 * Odds Conversion Utility
 * Converts decimal odds to various formats: fractional, american, hongkong, malay, indonesian
 */

import type { OddsFormat } from '@/features/profile/types';

// Fractional odds lookup table for common decimal values
const FRACTIONAL_LADDER: Record<string, string> = {
  '1.001': '1/1000',
  '1.002': '1/500',
  '1.004': '1/250',
  '1.005': '1/200',
  '1.01': '1/100',
  '1.02': '1/50',
  '1.03': '1/33',
  '1.04': '1/25',
  '1.05': '1/20',
  '1.08': '1/12',
  '1.1': '1/10',
  '1.11': '1/9',
  '1.13': '1/8',
  '1.14': '1/7',
  '1.17': '1/6',
  '1.2': '1/5',
  '1.25': '1/4',
  '1.33': '1/3',
  '1.4': '2/5',
  '1.44': '4/9',
  '1.5': '1/2',
  '1.53': '8/15',
  '1.57': '4/7',
  '1.6': '3/5',
  '1.62': '8/13',
  '1.63': '5/8',
  '1.67': '4/6',
  '1.7': '7/10',
  '1.73': '73/100',
  '1.75': '3/4',
  '1.8': '4/5',
  '1.83': '5/6',
  '1.9': '9/10',
  '1.91': '10/11',
  '1.95': '20/21',
  '2': '1/1',
  '2.05': '21/20',
  '2.1': '11/10',
  '2.2': '6/5',
  '2.25': '5/4',
  '2.3': '13/10',
  '2.38': '11/8',
  '2.4': '7/5',
  '2.5': '6/4',
  '2.6': '8/5',
  '2.63': '13/8',
  '2.7': '17/10',
  '2.75': '7/4',
  '2.8': '9/5',
  '2.88': '15/8',
  '2.9': '19/10',
  '3': '2/1',
  '3.1': '21/10',
  '3.2': '11/5',
  '3.25': '9/4',
  '3.3': '23/10',
  '3.4': '12/5',
  '3.5': '5/2',
  '3.6': '13/5',
  '3.75': '11/4',
  '3.8': '14/5',
  '4': '3/1',
  '4.33': '10/3',
  '4.5': '7/2',
  '5': '4/1',
  '5.5': '9/2',
  '6': '5/1',
  '6.5': '11/2',
  '7': '6/1',
  '7.5': '13/2',
  '8': '7/1',
  '8.5': '15/2',
  '9': '8/1',
  '9.5': '17/2',
  '10': '9/1',
  '11': '10/1',
  '12': '11/1',
  '13': '12/1',
  '15': '14/1',
  '17': '16/1',
  '21': '20/1',
  '26': '25/1',
  '34': '33/1',
  '51': '50/1',
  '67': '66/1',
  '101': '100/1',
  '201': '200/1',
  '501': '500/1',
  '1001': '1000/1',
};

// Sorted keys for binary search
const LADDER_KEYS = Object.keys(FRACTIONAL_LADDER)
  .map(parseFloat)
  .sort((a, b) => a - b);

/**
 * Find closest fractional odds using binary search
 */
function findClosestFractional(decimal: number): string {
  let left = 0;
  let right = LADDER_KEYS.length - 1;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (LADDER_KEYS[mid] < decimal) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  // Check which is closer: left or left-1
  if (left > 0) {
    const diff1 = Math.abs(LADDER_KEYS[left] - decimal);
    const diff2 = Math.abs(LADDER_KEYS[left - 1] - decimal);
    if (diff2 < diff1) {
      left--;
    }
  }

  const key = LADDER_KEYS[left].toString();
  return FRACTIONAL_LADDER[key] || calculateFractional(decimal);
}

/**
 * Calculate fractional odds mathematically (fallback)
 */
function calculateFractional(decimal: number): string {
  const value = decimal - 1;

  if (value <= 0) return '0/1';
  if (value === Math.floor(value)) return `${value}/1`;

  // Convert to fraction using continued fractions algorithm
  const tolerance = 1e-6;
  let numerator = 1;
  let denominator = 1;
  let lowerNum = 0;
  let lowerDen = 1;
  let upperNum = 1;
  let upperDen = 0;

  while (true) {
    const middle = (lowerNum + upperNum) / (lowerDen + upperDen);
    if (Math.abs(middle - value) < tolerance) {
      numerator = lowerNum + upperNum;
      denominator = lowerDen + upperDen;
      break;
    }
    if (value > middle) {
      lowerNum = lowerNum + upperNum;
      lowerDen = lowerDen + upperDen;
    } else {
      upperNum = lowerNum + upperNum;
      upperDen = lowerDen + upperDen;
    }
    if (lowerDen > 100 || upperDen > 100) {
      numerator = Math.round(value * 100);
      denominator = 100;
      // Simplify
      const gcd = getGCD(numerator, denominator);
      numerator = numerator / gcd;
      denominator = denominator / gcd;
      break;
    }
  }

  return `${numerator}/${denominator}`;
}

/**
 * Greatest Common Divisor
 */
function getGCD(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

/**
 * Convert decimal odds to fractional format (e.g., 3/2)
 */
export function convertDecimalToFractional(decimal: number): string {
  if (!decimal || isNaN(decimal) || decimal <= 1) return '-';

  const key = decimal.toString();
  if (FRACTIONAL_LADDER[key]) {
    return FRACTIONAL_LADDER[key];
  }

  return findClosestFractional(decimal);
}

/**
 * Convert decimal odds to American format (e.g., +150, -100)
 */
export function convertDecimalToAmerican(decimal: number): string {
  if (!decimal || isNaN(decimal) || decimal <= 1) return '-';

  if (decimal >= 2) {
    // Positive odds
    const american = Math.round(100 * (decimal - 1));
    return `+${american}`;
  } else {
    // Negative odds
    const american = Math.round(-100 / (decimal - 1));
    return american.toString();
  }
}

/**
 * Convert decimal odds to Hong Kong format (e.g., 1.50)
 */
export function convertDecimalToHongKong(decimal: number): string {
  if (!decimal || isNaN(decimal) || decimal <= 1) return '-';

  const hk = decimal - 1;
  return hk.toFixed(2);
}

/**
 * Convert decimal odds to Malay format (e.g., 0.75 or -1.33)
 */
export function convertDecimalToMalay(decimal: number): string {
  if (!decimal || isNaN(decimal) || decimal <= 1) return '-';

  if (decimal === 2) {
    return '1.00';
  } else if (decimal > 2) {
    // Negative malay odds
    const malay = 1 / (1 - decimal);
    return malay.toFixed(2);
  } else {
    // Positive malay odds
    const malay = decimal - 1;
    return malay.toFixed(2);
  }
}

/**
 * Convert decimal odds to Indonesian format (e.g., 1.50 or -1.33)
 */
export function convertDecimalToIndonesian(decimal: number): string {
  if (!decimal || isNaN(decimal) || decimal <= 1) return '-';

  if (decimal === 2) {
    return '1.00';
  } else if (decimal > 2) {
    // Positive indonesian odds
    const indo = decimal - 1;
    return indo.toFixed(2);
  } else {
    // Negative indonesian odds
    const indo = 1 / (1 - decimal);
    return indo.toFixed(2);
  }
}

/**
 * Format decimal odds according to user's preferred format
 */
export function formatOdds(decimal: number, format: OddsFormat): string {
  if (!decimal || isNaN(decimal) || decimal <= 1) return '-';

  switch (format) {
    case 'decimal':
      return decimal.toFixed(2);
    case 'fractional':
      return convertDecimalToFractional(decimal);
    case 'american':
      return convertDecimalToAmerican(decimal);
    case 'hongkong':
      return convertDecimalToHongKong(decimal);
    case 'malay':
      return convertDecimalToMalay(decimal);
    case 'indonesian':
      return convertDecimalToIndonesian(decimal);
    default:
      return decimal.toFixed(2);
  }
}

/**
 * Get short format label for display
 */
export function getOddsFormatLabel(format: OddsFormat): string {
  const labels: Record<OddsFormat, string> = {
    decimal: 'DEC',
    fractional: 'FRAC',
    american: 'US',
    hongkong: 'HK',
    malay: 'MY',
    indonesian: 'ID',
  };
  return labels[format] || 'DEC';
}
