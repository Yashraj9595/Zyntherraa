import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationSettingsProps {
  className?: string;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ 
  className = '' 
}) => {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    showNotification,
    showWelcomeNotification
  } = useNotifications();

  const [isProcessing, setIsProcessing] = useState(false);

  const handleRequestPermission = async () => {
    setIsProcessing(true);
    try {
      await requestPermission();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTogglePushSubscription = async () => {
    setIsProcessing(true);
    try {
      if (isSubscribed) {
        await unsubscribeFromPush();
      } else {
        await subscribeToPush();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestNotification = async () => {
    await showNotification('Test Notification', {
      body: 'This is a test notification from Zyntherraa!',
      type: 'info',
      autoClose: true,
      closeDelay: 3000
    });
  };

  const handleWelcomeNotification = async () => {
    await showWelcomeNotification();
  };

  if (isLoading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
        <div className="flex items-center">
          <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-yellow-800">
            Notifications are not supported in this browser.
          </p>
        </div>
      </div>
    );
  }

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { text: 'Enabled', color: 'text-gray-800', bgColor: 'bg-gray-100' };
      case 'denied':
        return { text: 'Blocked', color: 'text-red-600', bgColor: 'bg-red-100' };
      default:
        return { text: 'Not Set', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    }
  };

  const permissionStatus = getPermissionStatus();

  return (
    <div className={`p-6 bg-white rounded-lg shadow-sm border ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Notification Settings
      </h3>
      
      {/* Permission Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Permission Status</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${permissionStatus.bgColor} ${permissionStatus.color}`}>
            {permissionStatus.text}
          </span>
        </div>
        
        {permission !== 'granted' && (
          <button
            onClick={handleRequestPermission}
            disabled={isProcessing || permission === 'denied'}
            className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Requesting...' : 'Enable Notifications'}
          </button>
        )}
        
        {permission === 'denied' && (
          <p className="text-xs text-gray-500 mt-2">
            Notifications are blocked. Please enable them in your browser settings.
          </p>
        )}
      </div>

      {/* Push Notifications */}
      {permission === 'granted' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Push Notifications</span>
            <button
              onClick={handleTogglePushSubscription}
              disabled={isProcessing}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                isSubscribed
                  ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              {isProcessing ? 'Processing...' : isSubscribed ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Receive notifications even when the app is closed.
          </p>
        </div>
      )}

      {/* Test Notifications */}
      {permission === 'granted' && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Test Notifications</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleTestNotification}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Test Basic
            </button>
            
            <button
              onClick={handleWelcomeNotification}
              className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              Test Welcome
            </button>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-6 p-3 bg-blue-50 rounded-md">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm text-blue-800 font-medium">About Notifications</p>
            <p className="text-xs text-blue-700 mt-1">
              Notifications help you stay updated with important information from Zyntherraa. 
              You can disable them at any time in your browser settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
