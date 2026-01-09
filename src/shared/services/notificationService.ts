import { Notifications, Notification, Registered, RegistrationError } from 'react-native-notifications';
import { Platform } from 'react-native';

export type NotificationType =
  | 'bet_settled'
  | 'cashout_available'
  | 'odds_boost'
  | 'free_bet'
  | 'deposit_confirmed'
  | 'withdrawal_complete'
  | 'promo'
  | 'general';

export interface PushNotificationData {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

type NotificationCallback = (notification: PushNotificationData) => void;

class NotificationService {
  private fcmToken: string | null = null;
  private isInitialized = false;
  private onNotificationCallback: NotificationCallback | null = null;
  private onTokenRefreshCallback: ((token: string) => void) | null = null;

  /**
   * Initialize the notification service
   * Should be called once at app startup
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Register for remote notifications
      Notifications.registerRemoteNotifications();

      // Handle registration success
      Notifications.events().registerRemoteNotificationsRegistered((event: Registered) => {
        this.fcmToken = event.deviceToken;
        console.log('[NotificationService] Device token:', event.deviceToken);

        if (this.onTokenRefreshCallback) {
          this.onTokenRefreshCallback(event.deviceToken);
        }
      });

      // Handle registration failure
      Notifications.events().registerRemoteNotificationsRegistrationFailed((event: RegistrationError) => {
        console.error('[NotificationService] Registration failed:', event);
      });

      // Handle notification received while app is in foreground
      Notifications.events().registerNotificationReceivedForeground(
        (notification: Notification, completion: (response: { alert: boolean; sound: boolean; badge: boolean }) => void) => {
          console.log('[NotificationService] Notification received in foreground:', notification.payload);

          const data = this.parseNotification(notification);
          if (data && this.onNotificationCallback) {
            this.onNotificationCallback(data);
          }

          // Show the notification
          completion({ alert: true, sound: true, badge: true });
        }
      );

      // Handle notification received while app is in background
      Notifications.events().registerNotificationReceivedBackground(
        (notification: Notification, completion: (response: { alert: boolean; sound: boolean; badge: boolean }) => void) => {
          console.log('[NotificationService] Notification received in background:', notification.payload);
          completion({ alert: true, sound: true, badge: true });
        }
      );

      // Handle notification opened (user tapped on notification)
      Notifications.events().registerNotificationOpened(
        (notification: Notification, completion: () => void) => {
          console.log('[NotificationService] Notification opened:', notification.payload);

          const data = this.parseNotification(notification);
          if (data && this.onNotificationCallback) {
            this.onNotificationCallback(data);
          }

          completion();
        }
      );

      this.isInitialized = true;
      console.log('[NotificationService] Initialized successfully');
    } catch (error) {
      console.error('[NotificationService] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get the current FCM token
   */
  getToken(): string | null {
    return this.fcmToken;
  }

  /**
   * Set callback for when notifications are received/opened
   */
  onNotification(callback: NotificationCallback): void {
    this.onNotificationCallback = callback;
  }

  /**
   * Set callback for when token is refreshed
   */
  onTokenRefresh(callback: (token: string) => void): void {
    this.onTokenRefreshCallback = callback;
  }

  /**
   * Request notification permissions (iOS specific)
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      const hasPermission = await Notifications.isRegisteredForRemoteNotifications();
      if (!hasPermission) {
        Notifications.registerRemoteNotifications();
      }
      return true;
    }
    return true;
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    return Notifications.isRegisteredForRemoteNotifications();
  }

  /**
   * Post a local notification
   */
  postLocalNotification(title: string, body: string, data?: Record<string, unknown>): void {
    Notifications.postLocalNotification({
      title,
      body,
      identifier: String(Date.now()),
      payload: data || {},
      sound: 'default',
      badge: 1,
    });
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    Notifications.removeAllDeliveredNotifications();
  }

  /**
   * Set badge count (iOS only)
   */
  setBadgeCount(count: number): void {
    if (Platform.OS === 'ios') {
      Notifications.ios.setBadgeCount(count);
    }
  }

  /**
   * Parse notification payload into our format
   */
  private parseNotification(notification: Notification): PushNotificationData | null {
    try {
      const payload = notification.payload || {};
      return {
        type: (payload.type as NotificationType) || 'general',
        title: notification.title || payload.title || 'BetStack',
        body: notification.body || payload.body || '',
        data: payload.data,
      };
    } catch {
      return null;
    }
  }
}

export const notificationService = new NotificationService();
