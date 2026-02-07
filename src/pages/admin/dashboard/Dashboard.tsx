import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { analyticsApi } from '../../../utils/api';

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<any>;
}

interface RecentOrder {
  id: string;
  customer: string;
  amount: string;
  status: string;
  date: string;
}

interface LowStockAlert {
  productId: string;
  productName: string;
  variantId: string;
  size?: string;
  color?: string;
  currentStock: number;
  minStockLevel: number;
  category: string;
  isOutOfStock?: boolean;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const response = await analyticsApi.getDashboard();
        
        if (response.data) {
          const data = response.data as any;
          
          // Format stats from API
          if (data.stats) {
            setStats([
              {
                title: 'Total Revenue',
                value: `₹${data.stats.totalRevenue.value.toLocaleString()}`,
                change: `${data.stats.totalRevenue.change >= 0 ? '+' : ''}${data.stats.totalRevenue.change}%`,
                changeType: data.stats.totalRevenue.changeType,
                icon: DollarSign
              },
              {
                title: 'Total Orders',
                value: data.stats.totalOrders.value.toString(),
                change: `${data.stats.totalOrders.change >= 0 ? '+' : ''}${data.stats.totalOrders.change}%`,
                changeType: data.stats.totalOrders.changeType,
                icon: ShoppingCart
              },
              {
                title: 'Total Customers',
                value: data.stats.totalCustomers.value.toString(),
                change: `${data.stats.totalCustomers.change >= 0 ? '+' : ''}${data.stats.totalCustomers.change}%`,
                changeType: data.stats.totalCustomers.changeType,
                icon: Users
              },
              {
                title: 'Total Products',
                value: data.stats.totalProducts.value.toString(),
                change: data.stats.totalProducts.change,
                changeType: data.stats.totalProducts.changeType,
                icon: Package
              }
            ]);
          }

          // Format recent orders
          if (data.recentOrders) {
            const formattedOrders = data.recentOrders.map((order: any) => {
              const orderDate = new Date(order.date);
              const timeAgo = getTimeAgo(orderDate);
              
              return {
                id: `#ORD-${order.id.slice(-6).toUpperCase()}`,
                customer: order.customer,
                amount: `₹${order.amount.toLocaleString()}`,
                status: order.status,
                date: timeAgo
              };
            });
            setRecentOrders(formattedOrders);
          }

          // Set low stock alerts
          if (data.lowStockAlerts) {
            setLowStockAlerts(data.lowStockAlerts);
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                {stat.changeType === 'increase' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ml-1 ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-muted-foreground ml-1">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-card rounded-lg border border-border">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Recent Orders</h2>
              <button 
                onClick={() => navigate('/admin/orders')}
                className="text-primary hover:text-primary/80 text-sm font-medium"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            {recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-foreground">{order.customer}</p>
                          <p className="text-sm text-muted-foreground">{order.id}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{order.amount}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {order.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-lg border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/admin/products')}
                className="flex flex-col items-center gap-2 p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
              >
                <Package className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium text-foreground">Add Product</span>
              </button>
              <button 
                onClick={() => navigate('/admin/orders')}
                className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <ShoppingCart className="h-6 w-6 text-blue-600" />
                <span className="text-sm font-medium text-foreground">View Orders</span>
              </button>
              <button 
                onClick={() => navigate('/admin/customers')}
                className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <Users className="h-6 w-6 text-green-600" />
                <span className="text-sm font-medium text-foreground">Customers</span>
              </button>
              <button 
                onClick={() => navigate('/admin/reports')}
                className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <TrendingUp className="h-6 w-6 text-purple-600" />
                <span className="text-sm font-medium text-foreground">Reports</span>
              </button>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        {lowStockAlerts.length > 0 && (
          <div className="bg-card rounded-lg border border-border">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  Low Stock Alerts
                </h2>
                <button 
                  onClick={() => navigate('/admin/inventory')}
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {lowStockAlerts.slice(0, 5).map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{alert.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {alert.size && alert.color ? `${alert.size} / ${alert.color}` : alert.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        alert.isOutOfStock ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {alert.isOutOfStock ? 'Out of Stock' : `Low: ${alert.currentStock} units`}
                      </p>
                      <p className="text-xs text-muted-foreground">Min: {alert.minStockLevel}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
