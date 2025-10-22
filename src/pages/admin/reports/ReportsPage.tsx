"use client";

import { useState } from "react";
import { BarChart, TrendingUp, ShoppingCart, IndianRupee } from "lucide-react";

// Mock data for reports
const salesData = [
  { month: "Jan", sales: 4000, orders: 24 },
  { month: "Feb", sales: 3000, orders: 13 },
  { month: "Mar", sales: 2000, orders: 18 },
  { month: "Apr", sales: 2780, orders: 12 },
  { month: "May", sales: 1890, orders: 19 },
  { month: "Jun", sales: 2390, orders: 15 },
  { month: "Jul", sales: 3490, orders: 22 },
  { month: "Aug", sales: 4000, orders: 28 },
  { month: "Sep", sales: 3000, orders: 17 },
  { month: "Oct", sales: 2000, orders: 14 },
];

const categoryData = [
  { name: "Clothing", value: 400, color: "#3B82F6" },
  { name: "Footwear", value: 300, color: "#10B981" },
  { name: "Accessories", value: 200, color: "#F59E0B" },
  { name: "Other", value: 100, color: "#8B5CF6" },
];

const topProducts = [
  { id: 1, name: "Cotton Kurta", category: "Clothing", sales: 120, revenue: 156000 },
  { id: 2, name: "Running Sneakers", category: "Footwear", sales: 95, revenue: 237500 },
  { id: 3, name: "Leather Handbag", category: "Accessories", sales: 78, revenue: 312000 },
  { id: 4, name: "Silk Scarf", category: "Accessories", sales: 65, revenue: 97500 },
  { id: 5, name: "Denim Jeans", category: "Clothing", sales: 54, revenue: 108000 },
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState("sales");
  const [timeRange, setTimeRange] = useState("monthly");

  // Calculate summary statistics
  const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
  const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0);
  const avgOrderValue = totalSales / totalOrders;
  const topProduct = topProducts[0];

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
              <p className="text-lg font-bold text-foreground truncate">{topProduct.name}</p>
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
                  style={{ height: `${(item.sales / 5000) * 250}px` }}
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
                const startAngle = categoryData.slice(0, index).reduce((sum, d) => sum + (d.value / 1000) * 360, 0);
                const angle = (item.value / 1000) * 360;
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
                <span className="text-sm text-muted-foreground ml-auto">₹{item.value * 1000}</span>
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