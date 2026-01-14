import React from 'react';
import { 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  Clock
} from 'lucide-react';

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
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  date: string;
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: string;
  image: string;
}

export default function Dashboard() {
  const stats: StatCard[] = [
    {
      title: 'Total Revenue',
      value: '₹2,45,680',
      change: '+12.5%',
      changeType: 'increase',
      icon: DollarSign
    },
    {
      title: 'Total Orders',
      value: '1,248',
      change: '+8.2%',
      changeType: 'increase',
      icon: ShoppingCart
    },
    {
      title: 'Total Customers',
      value: '892',
      change: '+15.3%',
      changeType: 'increase',
      icon: Users
    },
    {
      title: 'Products Sold',
      value: '3,456',
      change: '-2.1%',
      changeType: 'decrease',
      icon: Package
    }
  ];

  const recentOrders: RecentOrder[] = [
    {
      id: 'ORD-001',
      customer: 'Priya Sharma',
      amount: '₹3,250',
      status: 'pending',
      date: '2 hours ago'
    },
    {
      id: 'ORD-002',
      customer: 'Rahul Patel',
      amount: '₹1,890',
      status: 'processing',
      date: '4 hours ago'
    },
    {
      id: 'ORD-003',
      customer: 'Anjali Singh',
      amount: '₹4,560',
      status: 'shipped',
      date: '6 hours ago'
    },
    {
      id: 'ORD-004',
      customer: 'Vikram Kumar',
      amount: '₹2,340',
      status: 'delivered',
      date: '1 day ago'
    },
    {
      id: 'ORD-005',
      customer: 'Meera Joshi',
      amount: '₹5,670',
      status: 'processing',
      date: '1 day ago'
    }
  ];

  const topProducts: TopProduct[] = [
    {
      id: '1',
      name: 'Silk Saree - Royal Blue',
      sales: 45,
      revenue: '₹67,500',
      image: '/api/placeholder/60/60'
    },
    {
      id: '2',
      name: 'Cotton Kurta Set',
      sales: 38,
      revenue: '₹45,600',
      image: '/api/placeholder/60/60'
    },
    {
      id: '3',
      name: 'Embroidered Lehenga',
      sales: 32,
      revenue: '₹96,000',
      image: '/api/placeholder/60/60'
    },
    {
      id: '4',
      name: 'Designer Dupatta',
      sales: 28,
      revenue: '₹22,400',
      image: '/api/placeholder/60/60'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
              <button className="text-primary hover:text-primary/80 text-sm font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
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
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-card rounded-lg border border-border">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Top Products</h2>
              <button className="text-primary hover:text-primary/80 text-sm font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{product.revenue}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600">+5.2%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-foreground">Add Product</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <ShoppingCart className="h-6 w-6 text-blue-600" />
            <span className="text-sm font-medium text-foreground">View Orders</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <Users className="h-6 w-6 text-green-600" />
            <span className="text-sm font-medium text-foreground">Customers</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <TrendingUp className="h-6 w-6 text-purple-600" />
            <span className="text-sm font-medium text-foreground">Reports</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
            <Eye className="h-6 w-6 text-orange-600" />
            <span className="text-sm font-medium text-foreground">Inventory</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
            <Calendar className="h-6 w-6 text-red-600" />
            <span className="text-sm font-medium text-foreground">Schedule</span>
          </button>
        </div>
      </div>
    </div>
  );
}
