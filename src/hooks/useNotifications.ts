import { useState, useEffect, useCallback } from 'react';
import { notificationManager, NotificationTemplates, AppNotificationOptions } from '../utils/notifications';

export interface UseNotificationsReturn {
  // State
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  
  // Actions
  requestPermission: () => Promise<NotificationPermission>;
  showNotification: (title: string, options?: AppNotificationOptions) => Promise<void>;
  subscribeToPush: () => Promise<boolean>;
  unsubscribeFromPush: () => Promise<boolean>;
  scheduleNotification: (title: string, options: AppNotificationOptions, delay: number) => number;
  cancelScheduledNotification: (id: number) => void;
  
  // Templates
  showWelcomeNotification: () => Promise<void>;
  showUpdateNotification: () => Promise<void>;
  showOfflineNotification: () => Promise<void>;
  showOnlineNotification: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize notification system
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        
        // Check support
        const supported = notificationManager.isSupported();
        setIsSupported(supported);
        
        if (supported) {
          // Initialize notification manager
          await notificationManager.initialize();
          
          // Get current permission status
          const currentPermission = notificationManager.getPermissionStatus();
          setPermission(currentPermission);
          
          // Check if subscribed to push notifications
          if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
          }
        }
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    try {
      const newPermission = await notificationManager.requestPermission();
      setPermission(newPermission);
      return newPermission;
    } catch (error) {
      console.error('Failed to request permission:', error);
      return 'denied';
    }
  }, []);

  // Show notification with enhanced options
  const showNotification = useCallback(async (
    title: string, 
    options: AppNotificationOptions = {}
  ): Promise<void> => {
    try {
      // Auto-close functionality
      if (options.autoClose && options.closeDelay) {
        setTimeout(() => {
          // Close notification logic would go here
          // This is a simplified implementation
        }, options.closeDelay);
      }

      await notificationManager.showNotification(title, options);
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }, []);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async (): Promise<boolean> => {
    try {
      const subscription = await notificationManager.subscribeToPush();
      const success = !!subscription;
      setIsSubscribed(success);
      
      if (success && subscription) {
        // Send subscription to your server here
        console.log('Push subscription successful:', subscription);
        
        // You would typically send this to your backend:
        // await sendSubscriptionToServer(subscription);
      }
      
      return success;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
  }, []);

  // Unsubscribe from push notifications
  const unsubscribeFromPush = useCallback(async (): Promise<boolean> => {
    try {
      const success = await notificationManager.unsubscribeFromPush();
      setIsSubscribed(!success);
      
      if (success) {
        // Remove subscription from your server here
        console.log('Push unsubscription successful');
        
        // You would typically notify your backend:
        // await removeSubscriptionFromServer();
      }
      
      return success;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }, []);

  // Schedule notification
  const scheduleNotification = useCallback((
    title: string,
    options: AppNotificationOptions,
    delay: number
  ): number => {
    return notificationManager.scheduleNotification(title, options, delay);
  }, []);

  // Cancel scheduled notification
  const cancelScheduledNotification = useCallback((id: number): void => {
    notificationManager.cancelScheduledNotification(id);
  }, []);

  // Template notifications
  const showWelcomeNotification = useCallback(async (): Promise<void> => {
    await showNotification(
      NotificationTemplates.welcome.title,
      {
        ...NotificationTemplates.welcome,
        type: 'success',
        autoClose: true,
        closeDelay: 5000
      }
    );
  }, [showNotification]);

  const showUpdateNotification = useCallback(async (): Promise<void> => {
    await showNotification(
      NotificationTemplates.update.title,
      {
        ...NotificationTemplates.update,
        type: 'info',
        autoClose: true,
        closeDelay: 3000
      }
    );
  }, [showNotification]);

  const showOfflineNotification = useCallback(async (): Promise<void> => {
    await showNotification(
      NotificationTemplates.offline.title,
      {
        ...NotificationTemplates.offline,
        type: 'warning',
        autoClose: true,
        closeDelay: 4000
      }
    );
  }, [showNotification]);

  const showOnlineNotification = useCallback(async (): Promise<void> => {
    await showNotification(
      NotificationTemplates.online.title,
      {
        ...NotificationTemplates.online,
        type: 'success',
        autoClose: true,
        closeDelay: 3000
      }
    );
  }, [showNotification]);

  return {
    // State
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    
    // Actions
    requestPermission,
    showNotification,
    subscribeToPush,
    unsubscribeFromPush,
    scheduleNotification,
    cancelScheduledNotification,
    
    // Templates
    showWelcomeNotification,
    showUpdateNotification,
    showOfflineNotification,
    showOnlineNotification
  };
};
