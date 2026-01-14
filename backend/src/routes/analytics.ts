import express, { Router } from 'express';
const router: Router = express.Router();
import Order from '../models/Order';
import Product from '../models/Product';
import User from '../models/User';
import { protect, admin } from '../middleware/auth';
import { getLowStockProducts, getOutOfStockProducts } from '../utils/inventoryManager';

// GET /api/analytics/dashboard - Get dashboard statistics
router.get('/dashboard', protect, admin, async (req: any, res) => {
  try {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastMonthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all orders
    const allOrders = await Order.find({}).populate('user', 'name email');
    const paidOrders = allOrders.filter(order => order.isPaid);
    
    // Calculate total revenue
    const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    
    // Calculate last month revenue for comparison
    const lastMonthOrders = paidOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= lastMonthStart && orderDate <= lastMonthEnd;
    });
    const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    
    // Calculate this month revenue
    const thisMonthOrders = paidOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= thisMonthStart;
    });
    const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    
    // Calculate revenue change
    const revenueChange = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : '0';

    // Get total orders
    const totalOrders = allOrders.length;
    const lastMonthOrderCount = lastMonthOrders.length;
    const thisMonthOrderCount = thisMonthOrders.length;
    const orderChange = lastMonthOrderCount > 0
      ? ((thisMonthOrderCount - lastMonthOrderCount) / lastMonthOrderCount * 100).toFixed(1)
      : '0';

    // Get total customers
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const lastMonthCustomers = await User.countDocuments({
      role: 'user',
      createdAt: { $lte: lastMonthEnd }
    });
    const customerChange = lastMonthCustomers > 0
      ? (((totalCustomers - lastMonthCustomers) / lastMonthCustomers) * 100).toFixed(1)
      : '0';

    // Get total products
    const totalProducts = await Product.countDocuments({ status: 'Active' });
    
    // Get recent orders (last 5)
    const recentOrders = allOrders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(order => {
        const user = order.user as any;
        return {
          id: order._id,
          customer: user?.name || order.shippingAddress?.fullName || 'Unknown',
          amount: order.totalPrice,
          status: order.status || (order.isDelivered ? 'delivered' : order.isPaid ? 'processing' : 'pending'),
          date: order.createdAt,
        };
      });

    // Get low stock and out of stock alerts using inventory manager
    const lowStockItemsFromManager = await getLowStockProducts(10);
    const outOfStockItems = await getOutOfStockProducts();
    
    // Format low stock items for response
    const lowStockItems = lowStockItemsFromManager.map((item: any) => ({
      productId: item.product._id,
      productName: item.product.title,
      variantId: item.variantIndex,
      size: item.variant.size,
      color: item.variant.color,
      currentStock: item.stock,
      minStockLevel: 10,
      category: item.product.category,
    }));
    
    // Add out of stock items
    const outOfStockFormatted = outOfStockItems.map((item: any) => ({
      productId: item.product._id,
      productName: item.product.title,
      variantId: item.variantIndex,
      size: item.variant.size,
      color: item.variant.color,
      currentStock: 0,
      minStockLevel: 10,
      category: item.product.category,
      isOutOfStock: true,
    }));
    
    // Combine low stock and out of stock
    const allStockAlerts = [...lowStockItems, ...outOfStockFormatted];

    res.json({
      stats: {
        totalRevenue: {
          value: totalRevenue,
          change: revenueChange,
          changeType: parseFloat(revenueChange) >= 0 ? 'increase' : 'decrease',
        },
        totalOrders: {
          value: totalOrders,
          change: orderChange,
          changeType: parseFloat(orderChange) >= 0 ? 'increase' : 'decrease',
        },
        totalCustomers: {
          value: totalCustomers,
          change: customerChange,
          changeType: parseFloat(customerChange) >= 0 ? 'increase' : 'decrease',
        },
        totalProducts: {
          value: totalProducts,
          change: '0',
          changeType: 'increase' as const,
        },
      },
      recentOrders,
      lowStockAlerts: allStockAlerts.slice(0, 10), // Top 10 stock alerts
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
    });
  } catch (error: any) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch dashboard data' });
  }
});

// GET /api/analytics/reports - Get reports data
router.get('/reports', protect, admin, async (req: any, res) => {
  try {
    const { timeRange = 'monthly', startDate, endDate } = req.query;
    
    let dateFilter: any = {};
    const now = new Date();
    
    // Set date range based on timeRange or custom dates
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    } else {
      switch (timeRange) {
        case 'daily':
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          dateFilter = { createdAt: { $gte: todayStart } };
          break;
        case 'weekly':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - 7);
          dateFilter = { createdAt: { $gte: weekStart } };
          break;
        case 'monthly':
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          dateFilter = { createdAt: { $gte: monthStart } };
          break;
        case 'yearly':
          const yearStart = new Date(now.getFullYear(), 0, 1);
          dateFilter = { createdAt: { $gte: yearStart } };
          break;
        default:
          // Last 10 months for default view
          const defaultStart = new Date(now.getFullYear(), now.getMonth() - 10, 1);
          dateFilter = { createdAt: { $gte: defaultStart } };
      }
    }

    // Get orders in date range
    const orders = await Order.find({
      ...dateFilter,
      isPaid: true,
    }).populate('items.product');

    // Calculate total sales and orders
    const totalSales = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Group sales by month
    const salesByMonth: Record<string, { sales: number; orders: number }> = {};
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      const monthName = orderDate.toLocaleDateString('en-US', { month: 'short' });
      
      if (!salesByMonth[monthName]) {
        salesByMonth[monthName] = { sales: 0, orders: 0 };
      }
      salesByMonth[monthName].sales += order.totalPrice || 0;
      salesByMonth[monthName].orders += 1;
    });

    // Convert to array format
    const salesData = Object.entries(salesByMonth)
      .map(([month, data]) => ({
        month,
        sales: Math.round(data.sales),
        orders: data.orders,
      }))
      .sort((a, b) => {
        // Sort by actual date, not month name
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(a.month) - months.indexOf(b.month);
      });

    // Category-wise sales breakdown
    const categorySales: Record<string, number> = {};
    orders.forEach(order => {
      order.items.forEach((item: any) => {
        const product = item.product;
        if (product && product.category) {
          categorySales[product.category] = (categorySales[product.category] || 0) + (item.price * item.quantity);
        }
      });
    });

    const categoryData = Object.entries(categorySales)
      .map(([name, value]) => ({
        name,
        value: Math.round(value),
        color: getCategoryColor(name),
      }))
      .sort((a, b) => b.value - a.value);

    // Top products by sales
    const productSales: Record<string, { name: string; category: string; sales: number; revenue: number }> = {};
    orders.forEach(order => {
      order.items.forEach((item: any) => {
        const product = item.product;
        if (product) {
          const productId = product._id.toString();
          if (!productSales[productId]) {
            productSales[productId] = {
              name: product.title || 'Unknown Product',
              category: product.category || 'Uncategorized',
              sales: 0,
              revenue: 0,
            };
          }
          productSales[productId].sales += item.quantity;
          productSales[productId].revenue += item.price * item.quantity;
        }
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((product, index) => ({
        id: index + 1,
        name: product.name,
        category: product.category,
        sales: product.sales,
        revenue: Math.round(product.revenue),
      }));

    res.json({
      summary: {
        totalSales: Math.round(totalSales),
        totalOrders,
        avgOrderValue: Math.round(avgOrderValue),
        topProduct: topProducts[0] || null,
      },
      salesData,
      categoryData,
      topProducts,
    });
  } catch (error: any) {
    console.error('Reports analytics error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch reports data' });
  }
});

// GET /api/analytics/inventory - Get inventory data
router.get('/inventory', protect, admin, async (req: any, res) => {
  try {
    const products = await Product.find({ status: 'Active' });
    
    const inventoryItems: any[] = [];
    
    products.forEach(product => {
      const categoryName = typeof product.category === 'string' 
        ? product.category 
        : (product.category as any)?.name || 'Uncategorized';
      
      product.variants.forEach((variant: any) => {
        const stock = variant.stock || 0;
        const minStock = 10; // Default minimum stock level
        const maxStock = 1000; // Default maximum stock level
        
        let status: 'in-stock' | 'low-stock' | 'out-of-stock';
        if (stock === 0) {
          status = 'out-of-stock';
        } else if (stock <= minStock) {
          status = 'low-stock';
        } else {
          status = 'in-stock';
        }

        inventoryItems.push({
          id: `${product._id}-${variant._id || variant.variantId}`,
          productId: product._id,
          productName: product.title,
          category: categoryName,
          sku: variant.sku || `${product.title}-${variant.size}-${variant.color}`,
          variantId: variant._id || variant.variantId,
          size: variant.size,
          color: variant.color,
          currentStock: stock,
          reservedStock: 0, // Can be calculated from pending orders
          availableStock: stock,
          minStockLevel: minStock,
          maxStockLevel: maxStock,
          lastUpdated: product.updatedAt || product.createdAt,
          status,
        });
      });
    });

    // Calculate summary statistics
    const totalItems = inventoryItems.length;
    const inStockItems = inventoryItems.filter(item => item.status === 'in-stock').length;
    const lowStockItems = inventoryItems.filter(item => item.status === 'low-stock').length;
    const outOfStockItems = inventoryItems.filter(item => item.status === 'out-of-stock').length;
    const totalAvailableStock = inventoryItems.reduce((sum, item) => sum + item.availableStock, 0);

    // Get unique categories
    const categories = Array.from(new Set(inventoryItems.map(item => item.category)));

    res.json({
      items: inventoryItems,
      summary: {
        totalItems,
        inStockItems,
        lowStockItems,
        outOfStockItems,
        totalAvailableStock,
      },
      categories,
    });
  } catch (error: any) {
    console.error('Inventory analytics error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch inventory data' });
  }
});

// Helper function to assign colors to categories
function getCategoryColor(categoryName: string): string {
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#EF4444', // Red
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16', // Lime
  ];
  
  const hash = categoryName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export default router;

