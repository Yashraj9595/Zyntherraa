"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, Package, TrendingDown, TrendingUp } from "lucide-react";

interface InventoryItem {
  id: string;
  productName: string;
  category: string;
  sku: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  lastUpdated: string;
  status: "in-stock" | "low-stock" | "out-of-stock";
}

// Mock data for inventory items
const mockInventoryData: InventoryItem[] = [
  {
    id: "1",
    productName: "Cotton Kurta",
    category: "Clothing",
    sku: "CK-2023-001-M-BLUE",
    currentStock: 45,
    reservedStock: 5,
    availableStock: 40,
    minStockLevel: 10,
    maxStockLevel: 100,
    lastUpdated: "2025-10-20",
    status: "in-stock"
  },
  {
    id: "2",
    productName: "Running Sneakers",
    category: "Footwear",
    sku: "RS-2023-002-9-BLACK",
    currentStock: 25,
    reservedStock: 10,
    availableStock: 15,
    minStockLevel: 20,
    maxStockLevel: 50,
    lastUpdated: "2025-10-19",
    status: "low-stock"
  },
  {
    id: "3",
    productName: "Leather Handbag",
    category: "Accessories",
    sku: "LH-2023-003-FS-BROWN",
    currentStock: 0,
    reservedStock: 0,
    availableStock: 0,
    minStockLevel: 5,
    maxStockLevel: 30,
    lastUpdated: "2025-10-18",
    status: "out-of-stock"
  },
  {
    id: "4",
    productName: "Silk Scarf",
    category: "Accessories",
    sku: "SS-2023-004-FS-RED",
    currentStock: 8,
    reservedStock: 2,
    availableStock: 6,
    minStockLevel: 15,
    maxStockLevel: 40,
    lastUpdated: "2025-10-20",
    status: "low-stock"
  },
  {
    id: "5",
    productName: "Denim Jeans",
    category: "Clothing",
    sku: "DJ-2023-005-32-BLUE",
    currentStock: 65,
    reservedStock: 15,
    availableStock: 50,
    minStockLevel: 20,
    maxStockLevel: 120,
    lastUpdated: "2025-10-21",
    status: "in-stock"
  }
];

export default function InventoryPage() {
  const [inventoryItems] = useState<InventoryItem[]>(mockInventoryData);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");

  // Get unique categories for filter
  const categories = Array.from(new Set(mockInventoryData.map(item => item.category)));

  // Calculate summary statistics
  const totalItems = inventoryItems.length;
  const inStockItems = inventoryItems.filter(item => item.status === "in-stock").length;
  const lowStockItems = inventoryItems.filter(item => item.status === "low-stock").length;
  const outOfStockItems = inventoryItems.filter(item => item.status === "out-of-stock").length;
  const totalAvailableStock = inventoryItems.reduce((sum, item) => sum + item.availableStock, 0);

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === "name") return a.productName.localeCompare(b.productName);
    if (sortBy === "sku") return a.sku.localeCompare(b.sku);
    if (sortBy === "stock") return b.availableStock - a.availableStock;
    if (sortBy === "status") {
      const statusOrder = { "in-stock": 1, "low-stock": 2, "out-of-stock": 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return 0;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in-stock":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="mr-1 h-3 w-3" /> In Stock
        </span>;
      case "low-stock":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertTriangle className="mr-1 h-3 w-3" /> Low Stock
        </span>;
      case "out-of-stock":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertTriangle className="mr-1 h-3 w-3" /> Out of Stock
        </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Unknown
        </span>;
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
        <p className="text-muted-foreground mt-2">Track and manage your product inventory</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Items</h3>
              <p className="text-2xl font-bold text-foreground">{totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">In Stock</h3>
              <p className="text-2xl font-bold text-foreground">{inStockItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center">
            <div className="rounded-full bg-yellow-100 p-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Low Stock</h3>
              <p className="text-2xl font-bold text-foreground">{lowStockItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center">
            <div className="rounded-full bg-red-100 p-3">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Out of Stock</h3>
              <p className="text-2xl font-bold text-foreground">{outOfStockItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Available</h3>
              <p className="text-2xl font-bold text-foreground">{totalAvailableStock}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and search section */}
      <div className="p-6 border border-input rounded-lg bg-background">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <input
              type="text"
              placeholder="Search by product, SKU, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Statuses</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>
          
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="name">Sort by Name</option>
              <option value="sku">Sort by SKU</option>
              <option value="stock">Sort by Stock Level</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Product</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">SKU</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Current Stock</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Reserved</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Available</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Min. Level</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium text-foreground">{item.productName}</td>
                  <td className="py-3 px-4 text-muted-foreground">{item.sku}</td>
                  <td className="py-3 px-4 text-muted-foreground">{item.category}</td>
                  <td className="py-3 px-4 text-foreground">{item.currentStock}</td>
                  <td className="py-3 px-4 text-muted-foreground">{item.reservedStock}</td>
                  <td className="py-3 px-4 font-medium text-foreground">{item.availableStock}</td>
                  <td className="py-3 px-4 text-muted-foreground">{item.minStockLevel}</td>
                  <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                  <td className="py-3 px-4 text-muted-foreground">{item.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No inventory items found matching your criteria
          </div>
        )}
      </div>

      {/* Low Stock Alert Section */}
      {lowStockItems > 0 && (
        <div className="p-6 border border-yellow-200 rounded-lg bg-yellow-50">
          <h2 className="text-xl font-bold text-yellow-800 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Low Stock Alerts
          </h2>
          <p className="text-yellow-700 mt-2">
            {lowStockItems} product(s) are running low on stock and need attention.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventoryItems
              .filter(item => item.status === "low-stock")
              .map(item => (
                <div key={item.id} className="bg-white p-4 rounded-lg border border-yellow-200 shadow-sm">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-yellow-900">{item.productName}</h3>
                    <span className="text-sm font-medium text-yellow-800 bg-yellow-100 px-2 py-1 rounded">
                      Low Stock
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Available: {item.availableStock} units</p>
                    <p>Minimum required: {item.minStockLevel} units</p>
                    <p className="mt-1">SKU: {item.sku}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Out of Stock Alert Section */}
      {outOfStockItems > 0 && (
        <div className="p-6 border border-red-200 rounded-lg bg-red-50">
          <h2 className="text-xl font-bold text-red-800 flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Out of Stock Alerts
          </h2>
          <p className="text-red-700 mt-2">
            {outOfStockItems} product(s) are completely out of stock.
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventoryItems
              .filter(item => item.status === "out-of-stock")
              .map(item => (
                <div key={item.id} className="bg-white p-4 rounded-lg border border-red-200 shadow-sm">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-red-900">{item.productName}</h3>
                    <span className="text-sm font-medium text-red-800 bg-red-100 px-2 py-1 rounded">
                      Out of Stock
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Available: {item.availableStock} units</p>
                    <p>Minimum required: {item.minStockLevel} units</p>
                    <p className="mt-1">SKU: {item.sku}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}