import React, { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NavigationContainerRef } from '@react-navigation/native';
import { notificationService, PushNotificationData } from '@/shared/services/notificationService';
import { useRegisterFcmTokenMutation } from '@/features/auth/api';
import { useToast } from '@/shared/context';
import { useAppSelector } from '@/store/hooks';
import type { RootStackParamList } from '@/navigation/types';

interface NotificationInitializerProps {
  children: React.ReactNode;
}

export const NotificationInitializer: React.FC<NotificationInitializerProps> = ({ children }) => {
  const toast = useToast();
  const [registerFcmToken] = useRegisterFcmTokenMutation();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initializeNotifications = async () => {
      try {
        await notificationService.initialize();

        // Handle incoming notifications
        notificationService.onNotification((notification: PushNotificationData) => {
          handleNotification(notification);
        });

        // Register FCM token when it's available
        notificationService.onTokenRefresh(async (token: string) => {
          if (isAuthenticated && token) {
            try {
              await registerFcmToken({ token }).unwrap();
              console.log('[NotificationInitializer] FCM token registered');
            } catch (error) {
              console.error('[NotificationInitializer] Failed to register FCM token:', error);
            }
          }
        });

        // Request permissions on iOS
        await notificationService.requestPermissions();
      } catch (error) {
        console.error('[NotificationInitializer] Failed to initialize:', error);
      }
    };

    initializeNotifications();
  }, []);

  // Register token when user authenticates
  useEffect(() => {
    const registerTokenIfAuthenticated = async () => {
      if (isAuthenticated) {
        const token = notificationService.getToken();
        if (token) {
          try {
            await registerFcmToken({ token }).unwrap();
            console.log('[NotificationInitializer] FCM token registered on auth');
          } catch (error) {
            console.error('[NotificationInitializer] Failed to register FCM token on auth:', error);
          }
        }
      }
    };

    registerTokenIfAuthenticated();
  }, [isAuthenticated, registerFcmToken]);

  const handleNotification = (notification: PushNotificationData) => {
    // Show toast for foreground notifications
    switch (notification.type) {
      case 'bet_settled':
        toast.info(notification.body, notification.title);
        break;
      case 'cashout_available':
        toast.info(notification.body, notification.title);
        break;
      case 'odds_boost':
        toast.success(notification.body, notification.title);
        break;
      case 'free_bet':
        toast.success(notification.body, notification.title);
        break;
      case 'deposit_confirmed':
        toast.success(notification.body, notification.title);
        break;
      case 'withdrawal_complete':
        toast.success(notification.body, notification.title);
        break;
      case 'promo':
        toast.info(notification.body, notification.title);
        break;
      default:
        toast.info(notification.body, notification.title);
    }

    // Navigate based on notification type
    // Note: Navigation should be handled at the root level with a navigation ref
    // This is a simplified implementation
  };

  return <>{children}</>;
};
