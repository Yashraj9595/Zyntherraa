import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Package, Home } from 'lucide-react';
import { orderApi } from '../../utils/api';

const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;

      try {
        const response = await orderApi.getById(id);
        if (response.data) {
          setOrder(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 bottom-nav-safe flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 bottom-nav-safe flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h1>
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
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 md:py-12 bottom-nav-safe">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8 text-center">
          <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-3 sm:mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
            Thank you for your order. We've received your order and will begin processing it right away.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 text-left">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Order Details</h2>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium break-all ml-2">#{order._id.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">Order Date:</span>
                <span className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold text-base sm:text-lg">₹{order.totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium break-words ml-2">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium">{order.status || 'Pending'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              to="/account"
              className="bg-gray-200 text-gray-900 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              View Orders
            </Link>
            <Link
              to="/shop"
              className="bg-black text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Home size={18} className="sm:w-5 sm:h-5" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;

