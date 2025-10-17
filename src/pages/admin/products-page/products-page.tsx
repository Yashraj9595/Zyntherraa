"use client"

import { useState } from "react"
import { Search, Eye, Edit, Plus } from "lucide-react"

// Mock product data with Indian products and Rupees
const mockProducts = [
  { id: 1, name: "Cotton Kurta", category: "Clothing", price: 1299, stock: 45, status: "Active" },
  { id: 2, name: "Silk Saree", category: "Clothing", price: 2499, stock: 32, status: "Active" },
  { id: 3, name: "Leather Mojari", category: "Footwear", price: 1899, stock: 18, status: "Active" },
  { id: 4, name: "Pashmina Shawl", category: "Accessories", price: 2999, stock: 0, status: "Out of Stock" },
  { id: 5, name: "Banarasi Brocade", category: "Clothing", price: 3999, stock: 67, status: "Active" },
]

export default function ProductsPage() {
  const [products] = useState(mockProducts)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-2">Manage your product inventory</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors">
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Using a simple div with styling instead of Card component */}
      <div className="p-6 border border-input rounded-lg bg-background">
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Product</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Price (₹)</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Stock</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4 text-foreground font-medium">{product.name}</td>
                  <td className="py-3 px-4 text-foreground">{product.category}</td>
                  <td className="py-3 px-4 text-foreground font-semibold">₹{product.price}</td>
                  <td className="py-3 px-4 text-foreground">{product.stock}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <Eye size={16} className="text-foreground" />
                    </button>
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <Edit size={16} className="text-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}