import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { wishlistApi } from '../utils/api';

export interface WishlistItem {
  _id: string;
  product: {
    _id: string;
    title: string;
    price: number;
    images?: string[];
    [key: string]: any;
  };
  variant?: {
    size?: string;
    color?: string;
  };
  addedAt: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  addToWishlist: (productId: string, variant?: { size?: string; color?: string }) => Promise<void>;
  removeFromWishlist: (itemId: string) => Promise<void>;
  moveToCart: (itemId: string) => Promise<any>;
  clearWishlist: () => Promise<void>;
  getWishlistCount: () => number;
  isInWishlist: (productId: string, variant?: { size?: string; color?: string }) => boolean;
  fetchWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch wishlist from API (memoized to prevent infinite loops)
  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await wishlistApi.getWishlist();
      if (response.data && (response.data as any).success) {
        setWishlistItems((response.data as any).wishlist?.items || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch wishlist:', err);
      setError(err.message || 'Failed to fetch wishlist');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load wishlist when user logs in
  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [user, fetchWishlist]);

  // Add item to wishlist
  const addToWishlist = async (productId: string, variant?: { size?: string; color?: string }) => {
    if (!user) {
      throw new Error('Please login to add items to wishlist');
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await wishlistApi.addItem(productId, variant);
      if (response.data && (response.data as any).success) {
        await fetchWishlist(); // Refresh wishlist
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add to wishlist';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (itemId: string) => {
    if (!user) {
      throw new Error('Please login to remove items from wishlist');
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await wishlistApi.removeItem(itemId);
      if (response.data && (response.data as any).success) {
        setWishlistItems((prev) => prev.filter((item) => item._id !== itemId));
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to remove from wishlist';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Move item to cart
  const moveToCart = async (itemId: string) => {
    if (!user) {
      throw new Error('Please login to move items to cart');
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await wishlistApi.moveToCart(itemId);
      if (response.data && (response.data as any).success) {
        // Remove from wishlist
        setWishlistItems((prev) => prev.filter((item) => item._id !== itemId));
        return (response.data as any).product;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to move to cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear wishlist
  const clearWishlist = async () => {
    if (!user) {
      throw new Error('Please login to clear wishlist');
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await wishlistApi.clearWishlist();
      if (response.data && (response.data as any).success) {
        setWishlistItems([]);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to clear wishlist';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Get wishlist count
  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  // Check if product is in wishlist
  const isInWishlist = (productId: string, variant?: { size?: string; color?: string }) => {
    return wishlistItems.some((item) => {
      if (item.product._id !== productId) return false;
      if (variant) {
        return (
          item.variant?.size === variant.size &&
          item.variant?.color === variant.color
        );
      }
      return !item.variant || (!item.variant.size && !item.variant.color);
    });
  };

  const value: WishlistContextType = {
    wishlistItems,
    isLoading,
    error,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    clearWishlist,
    getWishlistCount,
    isInWishlist,
    fetchWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

