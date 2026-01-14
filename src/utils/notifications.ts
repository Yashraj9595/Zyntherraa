// PWA Notification utilities
export class NotificationManager {
  private static instance: NotificationManager;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {}

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  // Initialize notification system
  public async initialize(): Promise<boolean> {
    try {
      // Check if service worker is supported
      if (!('serviceWorker' in navigator)) {
        console.warn('Service Worker not supported');
        return false;
      }

      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.warn('Notifications not supported');
        return false;
      }

      // Get service worker registration
      this.registration = await navigator.serviceWorker.ready;
      console.log('Notification system initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  // Request notification permission
  public async requestPermission(): Promise<NotificationPermission> {
    try {
      if (!('Notification' in window)) {
        throw new Error('Notifications not supported');
      }

      let permission = Notification.permission;

      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      console.log('Notification permission:', permission);
      return permission;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  }

  // Show local notification
  public async showNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<void> {
    try {
      const permission = await this.requestPermission();
      
      if (permission !== 'granted') {
        throw new Error('Notification permission not granted');
      }

      const defaultOptions: NotificationOptions = {
        body: 'New notification from Zyntherraa',
        icon: '/logo/logo192x192.png',
        badge: '/favicon.ico',
        data: {
          dateOfArrival: Date.now(),
          primaryKey: Date.now().toString()
        },
        requireInteraction: false,
        silent: false
      };

      // Add actions for service worker notifications (not supported in basic Notification API)
      const serviceWorkerOptions = {
        ...defaultOptions,
        actions: [
          {
            action: 'open',
            title: 'Open App',
            icon: '/logo/logo96x96.png'
          },
          {
            action: 'close',
            title: 'Close',
            icon: '/favicon.ico'
          }
        ]
      };

      const finalOptions = { ...defaultOptions, ...options };
      const finalServiceWorkerOptions = { ...serviceWorkerOptions, ...options };

      if (this.registration) {
        // Use service worker to show notification (better for PWA)
        await this.registration.showNotification(title, finalServiceWorkerOptions);
      } else {
        // Fallback to browser notification
        new Notification(title, finalOptions);
      }

      console.log('Notification shown:', title);
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  // Subscribe to push notifications
  public async subscribeToPush(): Promise<PushSubscription | null> {
    try {
      if (!this.registration) {
        throw new Error('Service worker not registered');
      }

      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission not granted');
      }

      // Check if already subscribed
      let subscription = await this.registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Create new subscription
        const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9f4LUjqukYiLdyS-FgS2xCcMu-QFPaXlYXGFja_5pjOTKbeKCHkE'; // Replace with your VAPID key
        
        subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
        });
      }

      console.log('Push subscription:', subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  // Unsubscribe from push notifications
  public async unsubscribeFromPush(): Promise<boolean> {
    try {
      if (!this.registration) {
        return false;
      }

      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('Unsubscribed from push notifications');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  // Check if notifications are supported and enabled
  public isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Get current notification permission status
  public getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  // Schedule a notification (using setTimeout for demo)
  public scheduleNotification(
    title: string,
    options: NotificationOptions,
    delay: number
  ): number {
    return window.setTimeout(() => {
      this.showNotification(title, options);
    }, delay);
  }

  // Cancel scheduled notification
  public cancelScheduledNotification(id: number): void {
    clearTimeout(id);
  }

  // Helper method to convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance();

// Notification types for better type safety
export interface AppNotificationOptions extends NotificationOptions {
  type?: 'info' | 'success' | 'warning' | 'error';
  autoClose?: boolean;
  closeDelay?: number;
}

// Predefined notification templates
export const NotificationTemplates = {
  welcome: {
    title: 'Welcome to Zyntherraa!',
    body: 'Thanks for installing our PWA. Enjoy the experience!',
    icon: '/logo/logo192x192.png'
  },
  
  update: {
    title: 'App Updated',
    body: 'Zyntherraa has been updated to the latest version.',
    icon: '/logo/logo192x192.png'
  },
  
  offline: {
    title: 'You\'re Offline',
    body: 'Don\'t worry, you can still use the app with cached content.',
    icon: '/logo/logo192x192.png'
  },
  
  online: {
    title: 'Back Online',
    body: 'Your connection has been restored. Syncing latest data...',
    icon: '/logo/logo192x192.png'
  }
};
