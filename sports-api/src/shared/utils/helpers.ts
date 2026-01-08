import crypto from 'crypto';

/**
 * Generate a unique booking code for bets
 * Format: 8 alphanumeric characters (uppercase)
 */
export function generateBookingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars: I, O, 0, 1
  const length = 8;
  let code = '';

  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    code += chars[randomBytes[i] % chars.length];
  }

  return code;
}

/**
 * Generate a random alphanumeric string
 */
export function generateRandomString(length: number): string {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency = 'GHS'): string {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate odds in different formats
 */
export function convertOdds(decimalOdds: number, format: 'decimal' | 'fractional' | 'american' | 'malay'): string {
  switch (format) {
    case 'decimal':
      return decimalOdds.toFixed(2);

    case 'fractional': {
      const numerator = Math.round((decimalOdds - 1) * 100);
      const denominator = 100;
      const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
      const divisor = gcd(numerator, denominator);
      return `${numerator / divisor}/${denominator / divisor}`;
    }

    case 'american': {
      if (decimalOdds >= 2) {
        return `+${Math.round((decimalOdds - 1) * 100)}`;
      } else {
        return `${Math.round(-100 / (decimalOdds - 1))}`;
      }
    }

    case 'malay': {
      if (decimalOdds >= 2) {
        return (decimalOdds - 1).toFixed(2);
      } else {
        return (-1 / (decimalOdds - 1)).toFixed(2);
      }
    }

    default:
      return decimalOdds.toFixed(2);
  }
}

/**
 * Paginate array
 */
export function paginate<T>(items: T[], limit: number, offset: number): T[] {
  return items.slice(offset, offset + limit);
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
