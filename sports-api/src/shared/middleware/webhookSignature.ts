import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { env } from '../../config/env.js';
import { UnauthorizedError } from '../errors/AppError.js';

/**
 * Webhook signature verification middleware.
 *
 * In production, each payment provider (MTN, Vodafone, AirtelTigo) will have
 * their own signature verification method. This middleware provides a
 * configurable stub that should be implemented per-provider.
 *
 * Common patterns:
 * - HMAC-SHA256 signature in header
 * - Timestamp + payload hash verification
 * - Provider-specific secret keys
 */

// Get webhook secrets from environment (one per provider)
const WEBHOOK_SECRETS: Record<string, string | undefined> = {
  mtn: env.MTN_WEBHOOK_SECRET,
  vodafone: env.VODAFONE_WEBHOOK_SECRET,
  airteltigo: env.AIRTELTIGO_WEBHOOK_SECRET,
};

/**
 * Verify HMAC-SHA256 signature
 */
function verifyHmacSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Middleware to verify webhook signatures from payment providers.
 *
 * Expected headers:
 * - x-webhook-signature: HMAC-SHA256 hex signature
 * - x-webhook-provider: Provider name (mtn, vodafone, airteltigo)
 *
 * In development mode, signature verification is skipped if no secrets are configured.
 */
export function verifyWebhookSignature(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const signature = req.headers['x-webhook-signature'] as string | undefined;
  const provider = req.headers['x-webhook-provider'] as string | undefined;

  // In development, skip verification if no secrets configured
  if (env.NODE_ENV === 'development') {
    const hasAnySecret = Object.values(WEBHOOK_SECRETS).some((s) => s);
    if (!hasAnySecret) {
      console.warn('[Webhook] Skipping signature verification in development (no secrets configured)');
      return next();
    }
  }

  // Require signature in production
  if (!signature) {
    throw new UnauthorizedError('Missing webhook signature');
  }

  if (!provider) {
    throw new UnauthorizedError('Missing webhook provider header');
  }

  const secret = WEBHOOK_SECRETS[provider.toLowerCase()];
  if (!secret) {
    console.error(`[Webhook] No secret configured for provider: ${provider}`);
    throw new UnauthorizedError('Invalid webhook provider');
  }

  // Get raw body for signature verification
  // Note: Express must be configured to preserve raw body
  const rawBody = (req as Request & { rawBody?: string }).rawBody || JSON.stringify(req.body);

  const isValid = verifyHmacSignature(rawBody, signature, secret);
  if (!isValid) {
    console.error(`[Webhook] Invalid signature from provider: ${provider}`);
    throw new UnauthorizedError('Invalid webhook signature');
  }

  next();
}

/**
 * Alternative: Provider-specific signature verification
 * Each provider may have different signature algorithms
 */
export function verifyMtnSignature(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // MTN-specific implementation
  // Replace with actual MTN signature verification when integrating
  const signature = req.headers['x-mtn-signature'] as string | undefined;

  if (env.NODE_ENV === 'development' && !env.MTN_WEBHOOK_SECRET) {
    return next();
  }

  if (!signature || !env.MTN_WEBHOOK_SECRET) {
    throw new UnauthorizedError('Invalid MTN webhook signature');
  }

  const rawBody = (req as Request & { rawBody?: string }).rawBody || JSON.stringify(req.body);
  const isValid = verifyHmacSignature(rawBody, signature, env.MTN_WEBHOOK_SECRET);

  if (!isValid) {
    throw new UnauthorizedError('Invalid MTN webhook signature');
  }

  next();
}

export function verifyVodafoneSignature(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Vodafone-specific implementation
  const signature = req.headers['x-vodafone-signature'] as string | undefined;

  if (env.NODE_ENV === 'development' && !env.VODAFONE_WEBHOOK_SECRET) {
    return next();
  }

  if (!signature || !env.VODAFONE_WEBHOOK_SECRET) {
    throw new UnauthorizedError('Invalid Vodafone webhook signature');
  }

  const rawBody = (req as Request & { rawBody?: string }).rawBody || JSON.stringify(req.body);
  const isValid = verifyHmacSignature(rawBody, signature, env.VODAFONE_WEBHOOK_SECRET);

  if (!isValid) {
    throw new UnauthorizedError('Invalid Vodafone webhook signature');
  }

  next();
}

export function verifyAirtelTigoSignature(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // AirtelTigo-specific implementation
  const signature = req.headers['x-airteltigo-signature'] as string | undefined;

  if (env.NODE_ENV === 'development' && !env.AIRTELTIGO_WEBHOOK_SECRET) {
    return next();
  }

  if (!signature || !env.AIRTELTIGO_WEBHOOK_SECRET) {
    throw new UnauthorizedError('Invalid AirtelTigo webhook signature');
  }

  const rawBody = (req as Request & { rawBody?: string }).rawBody || JSON.stringify(req.body);
  const isValid = verifyHmacSignature(rawBody, signature, env.AIRTELTIGO_WEBHOOK_SECRET);

  if (!isValid) {
    throw new UnauthorizedError('Invalid AirtelTigo webhook signature');
  }

  next();
}
