import React, { useEffect, useState } from 'react';
import { LocalStorageManager } from '../utils/localStorage';

interface CacheManagerProps {
  appVersion?: string;
  showNotification?: boolean;
}

export const CacheManager: React.FC<CacheManagerProps> = ({ 
  appVersion = '1.0.0',
  showNotification = true 
}) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Check version on mount
    const versionChanged = LocalStorageManager.checkVersionAndClearCache(appVersion);
    if (versionChanged) {
      console.log('App version updated, cache cleared');
    }

    // Listen for service worker messages
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NEW_VERSION_AVAILABLE') {
        setUpdateAvailable(true);
      } else if (event.data && event.data.type === 'CACHE_CLEARED') {
        setIsUpdating(false);
        window.location.reload();
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, [appVersion]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Clear service worker cache
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
    } else {
      // Fallback: force refresh
      LocalStorageManager.forceRefresh();
    }
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
  };

  if (!showNotification || !updateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-sm">Update Available</h4>
          <p className="text-xs mt-1 opacity-90">
            A new version of the app is available. Update now to get the latest features.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="ml-2 text-white hover:text-gray-200 text-lg leading-none"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
      
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="bg-white text-blue-600 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? 'Updating...' : 'Update Now'}
        </button>
        <button
          onClick={handleDismiss}
          className="text-white border border-white px-3 py-1 rounded text-xs hover:bg-white hover:text-blue-600"
        >
          Later
        </button>
      </div>
    </div>
  );
};

// Hook for cache management
export const useCacheManager = (appVersion: string = '1.0.0') => {
  const [cacheStats, setCacheStats] = useState(LocalStorageManager.getCacheStats());

  const refreshStats = () => {
    setCacheStats(LocalStorageManager.getCacheStats());
  };

  const clearCache = () => {
    LocalStorageManager.clearAllCache();
    refreshStats();
  };

  const clearExpired = () => {
    LocalStorageManager.clearExpiredItems();
    refreshStats();
  };

  const forceRefresh = () => {
    LocalStorageManager.forceRefresh();
  };

  useEffect(() => {
    // Check version on mount
    LocalStorageManager.checkVersionAndClearCache(appVersion);
    refreshStats();
  }, [appVersion]);

  return {
    cacheStats,
    refreshStats,
    clearCache,
    clearExpired,
    forceRefresh
  };
};
