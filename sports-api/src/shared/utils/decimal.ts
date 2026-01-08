/**
 * Safe decimal arithmetic utilities for monetary calculations.
 * Avoids floating-point precision issues by using integer math.
 * All amounts are stored as strings with 2 decimal places.
 */

const PRECISION = 2;
const MULTIPLIER = Math.pow(10, PRECISION);

/**
 * Convert a string or number to cents (integer)
 */
export function toCents(value: string | number): number {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return Math.round(numValue * MULTIPLIER);
}

/**
 * Convert cents (integer) back to string with 2 decimal places
 */
export function fromCents(cents: number): string {
  return (cents / MULTIPLIER).toFixed(PRECISION);
}

/**
 * Add two decimal values safely
 */
export function addDecimals(a: string | number, b: string | number): string {
  const centsA = toCents(a);
  const centsB = toCents(b);
  return fromCents(centsA + centsB);
}

/**
 * Subtract two decimal values safely (a - b)
 */
export function subtractDecimals(a: string | number, b: string | number): string {
  const centsA = toCents(a);
  const centsB = toCents(b);
  return fromCents(centsA - centsB);
}

/**
 * Compare two decimal values
 * Returns: -1 if a < b, 0 if a == b, 1 if a > b
 */
export function compareDecimals(a: string | number, b: string | number): number {
  const centsA = toCents(a);
  const centsB = toCents(b);
  if (centsA < centsB) return -1;
  if (centsA > centsB) return 1;
  return 0;
}

/**
 * Check if a is greater than or equal to b
 */
export function isGreaterOrEqual(a: string | number, b: string | number): boolean {
  return compareDecimals(a, b) >= 0;
}

/**
 * Check if a is less than b
 */
export function isLessThan(a: string | number, b: string | number): boolean {
  return compareDecimals(a, b) < 0;
}

/**
 * Parse a decimal string to number (for display/API responses)
 */
export function toNumber(value: string): number {
  return parseFloat(value);
}
