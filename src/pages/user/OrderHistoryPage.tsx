import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, RefreshCw, Eye } from 'lucide-react';
import { userApi } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { getImageUrl } from '../../utils/imageUtils';

interface OrderItem {
  product: {
    _id: string;
    title: string;
    images?: string[];
  };
  variantId: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  status: string;
  trackingNumber?: string;
  isPaid: boolean;
  isDelivered: boolean;
  createdAt: string;
  updatedAt: string;
}

const OrderHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reordering, setReordering] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userApi.getOrderHistory(currentPage, 10);
      if (response.data && (response.data as any).success) {
        setOrders((response.data as any).orders || []);
        setTotalPages((response.data as any).pagination?.totalPages || 1);
      } else {
        setError(response.error || 'Failed to fetch orders');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, fetchOrders]);

  const handleReorder = async (orderId: string) => {
    try {
      setReordering(orderId);
      const response = await userApi.reorder(orderId);
      if (response.data && (response.data as any).success) {
        const items = (response.data as any).items || [];
        
        // Add items to cart
        for (const item of items) {
          // Get image path - use provided image or fallback to placeholder
          let imagePath = item.image || '';
          if (!imagePath) {
            imagePath = '/images/placeholder.jpg';
          }
          
          addToCart({
            productId: item.productId,
            productTitle: item.productTitle || 'Product',
            variantId: item.variantId || '',
            size: item.size || '',
            color: item.color || '',
            price: item.price,
            image: imagePath,
          });
        }
        
        // Navigate to cart
        navigate('/cart');
      } else {
        alert(response.error || 'Failed to reorder');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to reorder');
    } finally {
      setReordering(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
      case 'Refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <strong className="font-bold">Error! </strong>
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
            <p className="text-gray-600">View and manage your past orders</p>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
              <Link
                to="/shop"
                className="inline-block bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
                  {/* Order Header */}
                  <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Order #</p>
                        <p className="font-semibold text-gray-900">
                          {order.id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                      {order.trackingNumber && (
                        <div>
                          <p className="text-sm text-gray-500">Tracking</p>
                          <p className="font-semibold text-gray-900">
                            {order.trackingNumber}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Placed on</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="px-6 py-4">
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex gap-4">
                          <img
                            src={
                              item.product.images && item.product.images.length > 0
                                ? getImageUrl(item.product.images[0])
                                : '/placeholder-product.jpg'
                            }
                            alt={item.product.title}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {item.product.title}
                            </h4>
                            {(item.size || item.color) && (
                              <p className="text-sm text-gray-600">
                                {[item.size, item.color].filter(Boolean).join(' • ')}
                              </p>
                            )}
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">₹{order.itemsPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-semibold">₹{order.shippingPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-semibold">₹{order.taxPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-gray-900">
                        ₹{order.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="px-6 py-4 border-t border-gray-200 flex flex-wrap gap-3">
                    <Link
                      to={`/orders/${order.id}`}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Link>
                    {order.status !== 'Cancelled' && order.status !== 'Refunded' && (
                      <button
                        onClick={() => handleReorder(order.id)}
                        disabled={reordering === order.id}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                      >
                        {reordering === order.id ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Reordering...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4" />
                            Reorder
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
  );
};

export default OrderHistoryPage;

