import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { orderApi, paymentApi, RazorpayOrderResponse, PaymentVerificationResponse } from '../../utils/api';
import { Loader2 } from 'lucide-react';

// Declare Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    address: '',
    city: '',
    postalCode: '',
    country: 'India',
    phone: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const subtotal = getCartTotal();
  const tax = Math.round(subtotal * 0.18);
  const shipping = 0;
  const total = subtotal + tax + shipping;

  // Load Razorpay script
  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      setError('Failed to load payment gateway. Please refresh the page.');
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount (optional, usually not needed)
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRazorpayPayment = async (orderId: string) => {
    if (!window.Razorpay || !razorpayLoaded) {
      setError('Payment gateway is not loaded. Please refresh the page.');
      return;
    }

    try {
      // Create Razorpay order
      const paymentResponse = await paymentApi.createOrder({
        amount: total,
        currency: 'INR',
        orderId: orderId,
      });

      if (!paymentResponse.data) {
        setError(paymentResponse.error || 'Failed to initialize payment');
        return;
      }

      const paymentData = paymentResponse.data as RazorpayOrderResponse;
      const { id: razorpayOrderId, key } = paymentData;

      // Razorpay options
      const options = {
        key: key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: 'Zyntherraa',
        description: `Order #${orderId.slice(-8)}`,
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            setLoading(true);
            // Verify payment
            const verifyResponse = await paymentApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderId,
            });

            const verifyData = verifyResponse.data as PaymentVerificationResponse | undefined;
            if (verifyData && verifyData.success) {
              // Clear cart
              clearCart();
              // Redirect to order confirmation
              navigate(`/order-confirmation/${orderId}`);
            } else {
              const errorMsg = verifyResponse.error || 'Payment verification failed. Please contact support if payment was successful.';
              setError(errorMsg);
              setLoading(false);
              
              // Log verification failure for investigation
              console.error('Payment verification failed:', {
                orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                timestamp: new Date().toISOString(),
              });
            }
          } catch (err: any) {
            setError(err.message || 'Payment verification failed');
            setLoading(false);
          }
        },
        prefill: {
          name: shippingAddress.fullName,
          email: user?.email || '',
          contact: shippingAddress.phone,
        },
        notes: {
          orderId: orderId,
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      
      // Enhanced payment failure handling
      razorpay.on('payment.failed', async (response: any) => {
        try {
          const errorMessage = response.error?.description || response.error?.reason || 'Payment failed. Please try again.';
          const errorCode = response.error?.code || 'UNKNOWN';
          
          console.error('Payment failed:', {
            error: response.error,
            orderId: orderId,
            timestamp: new Date().toISOString(),
          });

          // Log payment failure for analytics
          // You can send this to your analytics service
          
          setError(`Payment failed: ${errorMessage} (Error Code: ${errorCode})`);
          setLoading(false);

          // Optionally, you can update order with failure information
          // This helps track payment failures
        } catch (err: any) {
          console.error('Error handling payment failure:', err);
          setError('Payment failed. Please contact support if the amount was deducted.');
          setLoading(false);
        }
      });

      // Handle payment retry
      razorpay.on('payment.retry', (response: any) => {
        console.log('Payment retry initiated:', response);
      });

      razorpay.open();
    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city || 
        !shippingAddress.postalCode || !shippingAddress.phone) {
      setError('Please fill in all required fields');
      return;
    }

    if (!user) {
      setError('Please login to place an order');
      navigate('/auth/login');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    // If Razorpay is selected but not loaded
    if (paymentMethod === 'Razorpay' && !razorpayLoaded) {
      setError('Payment gateway is loading. Please wait...');
      return;
    }

    try {
      setLoading(true);

      // Prepare order items
      const items = cartItems.map((item) => ({
        product: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
      }));

      // Create order
      const orderData = {
        items,
        shippingAddress,
        paymentMethod: paymentMethod === 'Razorpay' ? 'Razorpay' : paymentMethod,
        itemsPrice: subtotal,
        taxPrice: tax,
        shippingPrice: shipping,
        totalPrice: total,
      };

      const response = await orderApi.create(orderData);

      if (response.data) {
        const orderId = (response.data as any)._id || (response.data as any).id;
        
        if (!orderId) {
          setError('Order created but could not get order ID');
          setLoading(false);
          return;
        }

        // If Razorpay payment, initiate payment flow
        if (paymentMethod === 'Razorpay') {
          setLoading(false); // Reset loading as Razorpay will handle its own loading
          await handleRazorpayPayment(orderId);
        } else {
          // For Cash on Delivery, just redirect
          clearCart();
          navigate(`/order-confirmation/${orderId}`);
          setLoading(false);
        }
      } else {
        setError(response.error || 'Failed to place order');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 bottom-nav-safe flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <button
            onClick={() => navigate('/shop')}
            className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8 bottom-nav-safe">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">Checkout</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <p className="text-red-800 text-sm sm:text-base">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Shipping Information */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Shipping Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingAddress.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Payment Method</h2>
              
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={paymentMethod === 'Cash on Delivery'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <span className="font-medium">Cash on Delivery</span>
                    <p className="text-sm text-gray-500 mt-1">Pay when you receive your order</p>
                  </div>
                </label>
                
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Razorpay"
                    checked={paymentMethod === 'Razorpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                    disabled={!razorpayLoaded}
                  />
                  <div className="flex-1">
                    <span className="font-medium">Razorpay</span>
                    <p className="text-sm text-gray-500 mt-1">
                      {razorpayLoaded 
                        ? 'Pay securely with Credit/Debit Card, UPI, Net Banking, or Wallets'
                        : 'Loading payment gateway...'}
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 sticky top-4 sm:top-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item, index) => (
                  <div key={`${item.productId}-${index}`} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.productTitle}</p>
                      <p className="text-gray-600 text-xs">
                        {item.size} / {item.color} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <hr className="border-gray-200 mb-4" />

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (18%)</span>
                  <span className="font-medium">₹{tax.toLocaleString()}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-2.5 sm:py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Placing Order...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="w-full mt-3 text-center text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                Back to Cart
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;

