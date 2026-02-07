import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { getImageUrl } from '../../utils/imageUtils';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartItemCount,
  } = useCart();

  const subtotal = getCartTotal();
  const tax = Math.round(subtotal * 0.18);
  const shipping = 0; // Free shipping
  const total = subtotal + tax + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 bottom-nav-safe">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link
              to="/shop"
              className="inline-block bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 bottom-nav-safe">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {cartItems.map((item, index) => (
                <div key={`${item.productId}-${item.size}-${item.color}-${index}`} className="flex items-center p-4 sm:p-6 border-b border-gray-200 last:border-b-0">
                  {/* Product Image */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg overflow-hidden mr-3 sm:mr-4 flex-shrink-0 bg-gray-100">
                    {(() => {
                      const hasImage = typeof item.image === 'string' && item.image.trim() !== '';
                      const imageSrc = hasImage ? getImageUrl(item.image) : '/images/placeholder.jpg';
                      return (
                        <img
                          src={imageSrc}
                          alt={item.productTitle}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== '/images/placeholder.jpg') {
                              target.src = '/images/placeholder.jpg';
                            }
                          }}
                        />
                      );
                    })()}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.productId}`}>
                      <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-1 truncate hover:text-blue-600">
                        {item.productTitle}
                      </h3>
                    </Link>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                      Size: {item.size} | Color: {item.color}
                    </p>
                    <p className="text-base sm:text-xl font-bold text-gray-900">₹{item.price.toLocaleString()}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 mr-2 sm:mr-6">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                        className="p-1.5 sm:p-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <span className="text-sm sm:text-lg font-medium w-6 sm:w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                        className="p-1.5 sm:p-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.productId, item.size, item.color)}
                    className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 sticky top-4 sm:top-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Order Summary</h2>
              
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Subtotal ({getCartItemCount()} items)</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-800">Free</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Tax (18%)</span>
                  <span className="font-medium">₹{tax.toLocaleString()}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-base sm:text-lg font-bold">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-black text-white py-2.5 sm:py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors mb-3 sm:mb-4 text-sm sm:text-base"
              >
                Proceed to Checkout
              </button>
              
              <Link
                to="/shop"
                className="block w-full text-center text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
