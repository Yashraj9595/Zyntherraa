"use client";

import { useState, useEffect } from "react";
import { BarChart, TrendingUp, ShoppingCart, IndianRupee, Loader2 } from "lucide-react";
import { analyticsApi } from "../../../utils/api";

interface SalesData {
  month: string;
  sales: number;
  orders: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface TopProduct {
  id: number;
  name: string;
  category: string;
  sales: number;
  revenue: number;
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState("sales");
  const [timeRange, setTimeRange] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    topProduct: null as TopProduct | null,
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await analyticsApi.getReports({ timeRange });
        
        if (response.data) {
          const data = response.data as any;
          setSalesData(data.salesData || []);
          setCategoryData(data.categoryData || []);
          setTopProducts(data.topProducts || []);
          if (data.summary) {
            setSummary({
              totalSales: data.summary.totalSales || 0,
              totalOrders: data.summary.totalOrders || 0,
              avgOrderValue: data.summary.avgOrderValue || 0,
              topProduct: data.summary.topProduct || null,
            });
          }
        } else {
          setError(response.error || 'Failed to load reports data');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load reports data');
        console.error('Reports fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [timeRange]);

  const totalSales = summary.totalSales || salesData.reduce((sum, item) => sum + item.sales, 0);
  const totalOrders = summary.totalOrders || salesData.reduce((sum, item) => sum + item.orders, 0);
  const avgOrderValue = summary.avgOrderValue || (totalOrders > 0 ? totalSales / totalOrders : 0);
  const topProduct = summary.topProduct || topProducts[0] || null;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading reports data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    );
  }

  // Calculate max sales for chart scaling
  const maxSales = salesData.length > 0 ? Math.max(...salesData.map(d => d.sales)) : 5000;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Business Reports</h1>
        <p className="text-muted-foreground mt-2">Analyze your business performance and trends</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Sales</h3>
              <p className="text-2xl font-bold text-foreground">₹{totalSales.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Orders</h3>
              <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-3">
              <IndianRupee className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Avg. Order Value</h3>
              <p className="text-2xl font-bold text-foreground">₹{Math.round(avgOrderValue).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center">
            <div className="rounded-full bg-yellow-100 p-3">
              <BarChart className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Top Product</h3>
              <p className="text-lg font-bold text-foreground truncate">{topProduct?.name || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Controls */}
      <div className="flex flex-wrap gap-4 p-6 border border-input rounded-lg bg-background">
        <div>
          <label className="block text-sm font-medium mb-2">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="p-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="sales">Sales Report</option>
            <option value="inventory">Inventory Report</option>
            <option value="customer">Customer Report</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Time Range</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="p-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="p-6 border border-input rounded-lg bg-background">
          <h2 className="text-xl font-bold text-foreground mb-4">Sales Overview</h2>
          <div className="h-80 flex items-end space-x-2">
            {salesData.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="text-xs text-muted-foreground mb-1">{item.month}</div>
                <div 
                  className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                  style={{ height: maxSales > 0 ? `${(item.sales / maxSales) * 250}px` : '0px' }}
                  title={`₹${item.sales.toLocaleString()} in ${item.month}`}
                />
                <div className="text-xs text-muted-foreground mt-1">{item.orders} orders</div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="p-6 border border-input rounded-lg bg-background">
          <h2 className="text-xl font-bold text-foreground mb-4">Category Distribution</h2>
          <div className="h-80 flex items-center justify-center">
            <div className="relative w-64 h-64">
              {categoryData.map((item, index) => {
                const totalValue = categoryData.reduce((sum, d) => sum + d.value, 0);
                const startAngle = categoryData.slice(0, index).reduce((sum, d) => sum + (d.value / totalValue) * 360, 0);
                const angle = (item.value / totalValue) * 360;
                const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                const x2 = 50 + 40 * Math.cos(((startAngle + angle) * Math.PI) / 180);
                const y2 = 50 + 40 * Math.sin(((startAngle + angle) * Math.PI) / 180);
                
                return (
                  <path
                    key={index}
                    d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`}
                    fill={item.color}
                    stroke="white"
                    strokeWidth="2"
                    className="hover:opacity-80 transition-opacity"
                  />
                );
              })}
              <circle cx="50" cy="50" r="15" fill="white" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {categoryData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-4 h-4 rounded mr-2" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-foreground">{item.name}</span>
                <span className="text-sm text-muted-foreground ml-auto">₹{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="p-6 border border-input rounded-lg bg-background">
        <h2 className="text-xl font-bold text-foreground mb-4">Top Selling Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Product</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Units Sold</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium text-foreground">{product.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{product.category}</td>
                  <td className="py-3 px-4 text-foreground">{product.sales}</td>
                  <td className="py-3 px-4 font-medium text-foreground">₹{product.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}