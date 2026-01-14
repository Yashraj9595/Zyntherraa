import React from 'react';
import { useCacheManager } from '../CacheManager';

export const CacheDebugger: React.FC = () => {
  const { cacheStats, refreshStats, clearCache, clearExpired, forceRefresh } = useCacheManager();

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Cache Management</h3>
      
      {/* Cache Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800">Total Items</h4>
          <p className="text-2xl font-bold text-blue-600">{cacheStats.totalItems}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-800">Cache Size</h4>
          <p className="text-2xl font-bold text-green-600">{formatBytes(cacheStats.totalSize)}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="font-medium text-red-800">Expired Items</h4>
          <p className="text-2xl font-bold text-red-600">{cacheStats.expiredItems}</p>
        </div>
      </div>

      {/* Cache Actions */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={refreshStats}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Refresh Stats
          </button>
          
          <button
            onClick={clearExpired}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
          >
            Clear Expired ({cacheStats.expiredItems})
          </button>
          
          <button
            onClick={clearCache}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
          >
            Clear All Cache
          </button>
          
          <button
            onClick={forceRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Force Refresh App
          </button>
        </div>

        {/* Service Worker Actions */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Service Worker Controls</h4>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                  navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
                }
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              Clear SW Cache
            </button>
            
            <button
              onClick={() => {
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(registrations => {
                    registrations.forEach(registration => {
                      registration.unregister();
                    });
                    window.location.reload();
                  });
                }
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Unregister SW
            </button>
          </div>
        </div>

        {/* Cache Information */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Cache Information</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>App Version:</strong> {localStorage.getItem('app_version') || 'Not set'}</p>
            <p><strong>Service Worker:</strong> {'serviceWorker' in navigator ? 'Supported' : 'Not supported'}</p>
            <p><strong>Cache API:</strong> {'caches' in window ? 'Supported' : 'Not supported'}</p>
            <p><strong>Online:</strong> {navigator.onLine ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
