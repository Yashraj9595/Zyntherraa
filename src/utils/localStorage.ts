// Cache and localStorage utility with versioning
export interface CacheConfig {
  version: string;
  expirationTime?: number; // in milliseconds
}

export class LocalStorageManager {
  private static readonly VERSION_KEY = 'app_version';
  private static readonly CACHE_PREFIX = 'zyntherraa_cache_';
  private static readonly DEFAULT_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Set the current app version
   */
  static setAppVersion(version: string): void {
    localStorage.setItem(this.VERSION_KEY, version);
  }

  /**
   * Get the current app version
   */
  static getAppVersion(): string | null {
    return localStorage.getItem(this.VERSION_KEY);
  }

  /**
   * Check if app version has changed and clear cache if needed
   */
  static checkVersionAndClearCache(currentVersion: string): boolean {
    const storedVersion = this.getAppVersion();
    
    if (storedVersion !== currentVersion) {
      this.clearAllCache();
      this.setAppVersion(currentVersion);
      return true; // Version changed
    }
    
    return false; // Version same
  }

  /**
   * Store data with expiration
   */
  static setItem<T>(key: string, data: T, expirationMs?: number): void {
    const expiration = expirationMs || this.DEFAULT_EXPIRATION;
    const item = {
      data,
      timestamp: Date.now(),
      expiration: Date.now() + expiration
    };
    
    localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(item));
  }

  /**
   * Get data if not expired
   */
  static getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.CACHE_PREFIX + key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      
      // Check if expired
      if (Date.now() > parsed.expiration) {
        this.removeItem(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      this.removeItem(key);
      return null;
    }
  }

  /**
   * Remove specific item
   */
  static removeItem(key: string): void {
    localStorage.removeItem(this.CACHE_PREFIX + key);
  }

  /**
   * Clear all cached items
   */
  static clearAllCache(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Clear expired items
   */
  static clearExpiredItems(): void {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    
    keys.forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const parsed = JSON.parse(item);
            if (now > parsed.expiration) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // Remove corrupted items
          localStorage.removeItem(key);
        }
      }
    });
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { totalItems: number; totalSize: number; expiredItems: number } {
    const keys = Object.keys(localStorage);
    let totalItems = 0;
    let totalSize = 0;
    let expiredItems = 0;
    const now = Date.now();

    keys.forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        totalItems++;
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length;
          try {
            const parsed = JSON.parse(item);
            if (now > parsed.expiration) {
              expiredItems++;
            }
          } catch (error) {
            expiredItems++;
          }
        }
      }
    });

    return { totalItems, totalSize, expiredItems };
  }

  /**
   * Force refresh cache by clearing and updating version
   */
  static forceRefresh(): void {
    this.clearAllCache();
    // Clear service worker caches
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
        });
      });
    }
    // Reload the page
    window.location.reload();
  }
}

// Auto-clear expired items on load
LocalStorageManager.clearExpiredItems();
