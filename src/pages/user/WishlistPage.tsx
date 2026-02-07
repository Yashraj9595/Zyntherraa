import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, X } from 'lucide-react';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const WishlistPage: React.FC = () => {
  const { wishlistItems, isLoading, removeFromWishlist, moveToCart, clearWishlist, fetchWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Only depend on user, fetchWishlist is stable now

  const handleRemove = async (itemId: string) => {
    try {
      await removeFromWishlist(itemId);
      setMessage({ type: 'success', text: 'Item removed from wishlist' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to remove item' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleMoveToCart = async (item: any) => {
    try {
      const product = await moveToCart(item._id);
      if (product) {
        // Get image from product or item
        let imagePath = product.image || '';
        if (!imagePath && item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
          imagePath = item.product.images[0];
        }
        if (!imagePath) {
          imagePath = '/images/placeholder.jpg';
        }
        
        // Add to cart
        addToCart({
          productId: product.id,
          productTitle: product.title,
          variantId: '',
          size: product.variant?.size || '',
          color: product.variant?.color || '',
          price: product.price,
          image: imagePath,
        });
        setMessage({ type: 'success', text: 'Item moved to cart' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to move to cart' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      try {
        await clearWishlist();
        setMessage({ type: 'success', text: 'Wishlist cleared' });
        setTimeout(() => setMessage(null), 3000);
      } catch (error: any) {
        setMessage({ type: 'error', text: error.message || 'Failed to clear wishlist' });
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bottom-nav-safe">
        <div className="text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold mb-2">Please Login</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to view your wishlist</p>
          <Link
            to="/account"
            className="inline-block px-6 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-dark transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 bottom-nav-safe">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600 mt-1">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>
            {wishlistItems.length > 0 && (
              <button
                onClick={handleClearWishlist}
                className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-4 p-4 rounded-lg ${
                message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary"></div>
              <p className="mt-4 text-gray-600">Loading wishlist...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && wishlistItems.length === 0 && (
            <div className="text-center py-12">
              <Heart className="w-24 h-24 mx-auto mb-4 text-gray-300" />
              <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-6">Start adding items you love!</p>
              <Link
                to="/shop"
                className="inline-block px-6 py-3 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-dark transition"
              >
                Start Shopping
              </Link>
            </div>
          )}

          {/* Wishlist Items */}
          {!isLoading && wishlistItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => {
                const product = item.product;
                const image = product.images?.[0] || '/placeholder-image.jpg';
                const price = product.price || 0;

                return (
                  <div
                    key={item._id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden group"
                  >
                    {/* Product Image */}
                    <Link to={`/product/${product._id}`} className="block relative">
                      <div className="aspect-square bg-gray-100 overflow-hidden">
                        <img
                          src={image}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemove(item._id);
                        }}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                        aria-label="Remove from wishlist"
                      >
                        <X className="w-4 h-4 text-gray-600 hover:text-red-600" />
                      </button>
                    </Link>

                    {/* Product Info */}
                    <div className="p-4">
                      <Link to={`/product/${product._id}`}>
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-theme-primary transition">
                          {product.title}
                        </h3>
                      </Link>

                      {/* Variant Info */}
                      {item.variant && (item.variant.size || item.variant.color) && (
                        <div className="text-sm text-gray-600 mb-2">
                          {item.variant.size && <span>Size: {item.variant.size}</span>}
                          {item.variant.size && item.variant.color && <span> • </span>}
                          {item.variant.color && <span>Color: {item.variant.color}</span>}
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-theme-primary">
                          ₹{price.toLocaleString()}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMoveToCart(item)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-dark transition"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>Move to Cart</span>
                        </button>
                        <button
                          onClick={() => handleRemove(item._id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          aria-label="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
  );
};

export default WishlistPage;

