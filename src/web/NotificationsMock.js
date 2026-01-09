export const Notifications = {
  registerRemoteNotifications: () => {},
  events: () => ({
    registerRemoteNotificationsRegistered: () => {},
    registerRemoteNotificationsRegistrationFailed: () => {},
    registerNotificationReceivedForeground: () => {},
    registerNotificationReceivedBackground: () => {},
    registerNotificationOpened: () => {},
  }),
  isRegisteredForRemoteNotifications: async () => false,
  postLocalNotification: () => {},
  removeAllDeliveredNotifications: () => {},
  ios: {
    setBadgeCount: () => {},
  },
};

export class Notification {
  constructor(payload) {
    this.payload = payload;
  }
}

export class Registered {
  constructor(deviceToken) {
    this.deviceToken = deviceToken;
  }
}

export class RegistrationError {
  constructor(error) {
    this.error = error;
  }
}

export default { Notifications, Notification, Registered, RegistrationError };
