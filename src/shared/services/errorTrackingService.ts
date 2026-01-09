import * as Sentry from '@sentry/react-native';

// Sentry DSN should come from environment/config
const SENTRY_DSN = process.env.SENTRY_DSN || '';

interface UserContext {
  id: string;
  mobileNumber?: string;
  email?: string;
}

interface ErrorContext {
  screen?: string;
  action?: string;
  extra?: Record<string, unknown>;
}

class ErrorTrackingService {
  private isInitialized = false;

  /**
   * Initialize Sentry error tracking
   * Should be called once at app startup before any React code
   */
  initialize(): void {
    if (this.isInitialized || !SENTRY_DSN) {
      if (!SENTRY_DSN) {
        console.log('[ErrorTracking] Sentry DSN not configured, error tracking disabled');
      }
      return;
    }

    try {
      Sentry.init({
        dsn: SENTRY_DSN,
        debug: __DEV__,
        environment: __DEV__ ? 'development' : 'production',
        tracesSampleRate: __DEV__ ? 1.0 : 0.2, // Lower sample rate in production
        enableAutoSessionTracking: true,
        sessionTrackingIntervalMillis: 30000,
        attachStacktrace: true,
        enableNdkScopeSync: true,
        enableAutoPerformanceTracing: true,
        // Don't send errors in development
        beforeSend: (event) => {
          if (__DEV__) {
            console.log('[ErrorTracking] Would send event:', event);
            return null;
          }
          return event;
        },
      });

      this.isInitialized = true;
      console.log('[ErrorTracking] Sentry initialized successfully');
    } catch (error) {
      console.error('[ErrorTracking] Failed to initialize Sentry:', error);
    }
  }

  /**
   * Set user context for error tracking
   */
  setUser(user: UserContext | null): void {
    if (!this.isInitialized) return;

    if (user) {
      Sentry.setUser({
        id: user.id,
        username: user.mobileNumber,
        email: user.email,
      });
    } else {
      Sentry.setUser(null);
    }
  }

  /**
   * Capture an exception and send to Sentry
   */
  captureException(error: Error, context?: ErrorContext): void {
    if (!this.isInitialized) {
      console.error('[ErrorTracking] Error captured (Sentry not initialized):', error);
      return;
    }

    Sentry.withScope((scope) => {
      if (context?.screen) {
        scope.setTag('screen', context.screen);
      }
      if (context?.action) {
        scope.setTag('action', context.action);
      }
      if (context?.extra) {
        Object.entries(context.extra).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }

      Sentry.captureException(error);
    });
  }

  /**
   * Capture a message/log event
   */
  captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
    if (!this.isInitialized) {
      console.log('[ErrorTracking] Message captured (Sentry not initialized):', message);
      return;
    }

    Sentry.captureMessage(message, level);
  }

  /**
   * Add a breadcrumb for debugging
   */
  addBreadcrumb(category: string, message: string, data?: Record<string, unknown>): void {
    if (!this.isInitialized) return;

    Sentry.addBreadcrumb({
      category,
      message,
      data,
      level: 'info',
    });
  }

  /**
   * Set a tag that will be attached to all events
   */
  setTag(key: string, value: string): void {
    if (!this.isInitialized) return;
    Sentry.setTag(key, value);
  }

  /**
   * Set extra context data
   */
  setExtra(key: string, value: unknown): void {
    if (!this.isInitialized) return;
    Sentry.setExtra(key, value);
  }

  /**
   * Start a performance transaction
   */
  startTransaction(name: string, op: string): Sentry.Span | undefined {
    if (!this.isInitialized) return undefined;
    return Sentry.startInactiveSpan({ name, op });
  }

  /**
   * Wrap error boundary component with Sentry
   */
  getErrorBoundaryWrapper(): typeof Sentry.ErrorBoundary {
    return Sentry.ErrorBoundary;
  }

  /**
   * Get Sentry's navigation integration for React Navigation
   */
  getNavigationIntegration(): ReturnType<typeof Sentry.reactNavigationIntegration> {
    return Sentry.reactNavigationIntegration();
  }
}

export const errorTrackingService = new ErrorTrackingService();
