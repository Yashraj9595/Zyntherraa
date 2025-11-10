"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Eye, Edit, Plus, Image, Video, Loader2, AlertCircle } from "lucide-react"
import { ProductForm } from "../../../components/admin/ProductForm"
import { productApi } from "../../../utils/api"

interface ProductVariant {
  _id?: string
  id?: string
  size: string
  color: string
  images: (string | File)[]
  videos: (string | File)[]
  price: number
  stock: number
  styleNumber?: string
  fabric?: string
  customSize?: string
  customColor?: string
}

interface Product {
  _id: string
  title: string
  description: string
  category: string
  subcategory?: string
  variants: ProductVariant[]
  status: 'Active' | 'Inactive'
  styleNumber?: string
  fabric?: string
  createdAt?: string
  updatedAt?: string
}

// const sizes = [
//   { id: "xs", name: "XS" },
//   { id: "s", name: "S" },
//   { id: "m", name: "M" },
//   { id: "l", name: "L" },
//   { id: "xl", name: "XL" },
//   { id: "xxl", name: "XXL" },
//   { id: "free", name: "Free Size" },
//   { id: "custom", name: "Custom Size" }
// ]

// const colors = [
//   { id: "red", name: "Red", hex: "#EF4444" },
//   { id: "blue", name: "Blue", hex: "#3B82F6" },
//   { id: "green", name: "Green", hex: "#10B981" },
//   { id: "black", name: "Black", hex: "#000000" },
//   { id: "white", name: "White", hex: "#FFFFFF" },
//   { id: "yellow", name: "Yellow", hex: "#FBBF24" },
//   { id: "pink", name: "Pink", hex: "#EC4899" },
//   { id: "purple", name: "Purple", hex: "#8B5CF6" },
//   { id: "orange", name: "Orange", hex: "#F97316" },
//   { id: "brown", name: "Brown", hex: "#92400E" },
//   { id: "custom", name: "Custom Color" }
// ]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // New state for filtering and sorting
  const [categoryFilter, setCategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [sortBy, setSortBy] = useState("name")

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params: any = {}
      if (categoryFilter) params.category = categoryFilter
      if (statusFilter) params.status = statusFilter
      if (searchTerm) params.search = searchTerm

      const response = await productApi.getAll(params)
      if (response.error) {
        setError(response.error)
      } else if (response.data) {
        // Handle the response structure from backend
        const productsData = (response.data as any).products || response.data
        setProducts(Array.isArray(productsData) ? productsData : [])
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }, [categoryFilter, statusFilter, searchTerm])

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm || !searchTerm) {
        fetchProducts();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchProducts, searchTerm]);

  // Get unique categories for filter
  const categories: string[] = []
  products.forEach(product => {
    if (!categories.includes(product.category)) {
      categories.push(product.category)
    }
  })

  // Filter products locally (backend also filters, but we do client-side for search)
  const filteredProducts = products.filter(
    (product) => {
      const matchesSearch = searchTerm ? (
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.subcategory && product.subcategory.toLowerCase().includes(searchTerm.toLowerCase()))
      ) : true
      
      return matchesSearch
    }
  ).sort((a, b) => {
    if (sortBy === "name") return a.title.localeCompare(b.title)
    if (sortBy === "category") return a.category.localeCompare(b.category)
    if (sortBy === "status") return a.status.localeCompare(b.status)
    return 0
  })

  const toggleProductStatus = async (productId: string) => {
    try {
      const response = await productApi.toggleStatus(productId)
      if (response.error) {
        setError(response.error)
      } else if (response.data) {
        // Update the product in the list
        setProducts(prev => prev.map(product => 
          product._id === productId 
            ? { ...product, status: (response.data as Product).status } 
            : product
        ))
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update product status')
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setShowEditForm(true)
  }

  const handleAddProduct = () => {
    setEditingProduct(null)
    setShowAddForm(true)
  }

  const saveProduct = async (product: any) => {
    try {
      setError(null)
      let response
      
      if (editingProduct) {
        // Update existing product
        response = await productApi.update(editingProduct._id, product)
      } else {
        // Create new product
        response = await productApi.create(product)
      }
      
      if (response.error) {
        setError(response.error)
        return
      }
      
      if (response.data) {
        // Refresh products list
        await fetchProducts()
        // Reset forms
        setEditingProduct(null)
        setShowAddForm(false)
        setShowEditForm(false)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save product')
    }
  }

  const cancelForm = () => {
    setShowAddForm(false)
    setShowEditForm(false)
    setEditingProduct(null)
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-2">Manage your product inventory</p>
        </div>
        <button 
          onClick={handleAddProduct}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center p-4 bg-red-100 text-red-800 rounded-lg">
          <AlertCircle className="mr-2" size={20} />
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin" size={32} />
          <span className="ml-2">Loading products...</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800">Total Products</h3>
          <p className="text-3xl font-bold text-blue-600">{products.length}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-800">Active Products</h3>
          <p className="text-3xl font-bold text-green-600">
            {products.filter(p => p.status === "Active").length}
          </p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-800">Total Variants</h3>
          <p className="text-3xl font-bold text-purple-600">
            {products.reduce((acc, product) => acc + product.variants.length, 0)}
          </p>
        </div>
        <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
          <h3 className="text-lg font-semibold text-indigo-800">Products with Style Numbers</h3>
          <p className="text-3xl font-bold text-indigo-600">
            {products.filter(p => p.styleNumber).length}
          </p>
        </div>
      </div>

      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <ProductForm
            initialData={editingProduct ? {
              ...editingProduct,
              id: editingProduct._id ? parseInt(editingProduct._id, 10) : Date.now(),
              _id: editingProduct._id,
              variants: editingProduct.variants.map(variant => ({
                ...variant,
                id: variant.id || variant._id || Date.now().toString()
              }))
            } : undefined}
            onSubmit={saveProduct}
            onCancel={cancelForm}
            isEditing={!!editingProduct}
          />
        </div>
      )}

      {/* Filters and search section */}
      <div className="p-6 border border-input rounded-lg bg-background">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  fetchProducts()
                }
              }}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
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
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="name">Name</option>
              <option value="category">Category</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Product</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Variants</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filteredProducts.map((product) => (
                <tr key={product._id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-foreground">{product.title}</div>
                      <div className="text-sm text-muted-foreground">{product.description}</div>
                      {(product.styleNumber || product.fabric) && (
                        <div className="flex gap-2 mt-1">
                          {product.styleNumber && (
                            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                              Style: {product.styleNumber}
                            </span>
                          )}
                          {product.fabric && (
                            <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">
                              Fabric: {product.fabric}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-foreground font-medium">{product.category}</div>
                    {product.subcategory && (
                      <div className="text-sm text-muted-foreground">{product.subcategory}</div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-2">
                      {product.variants.slice(0, 3).map((variant) => (
                        <div key={variant.id || variant._id} className="flex items-center gap-2 text-xs bg-gray-100 px-2 py-1 rounded">
                          <span className="font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded">{variant.size}</span>
                          <span className="font-medium px-2 py-1 bg-purple-100 text-purple-800 rounded">{variant.color}</span>
                          <span className="text-green-600 font-medium">₹{variant.price}</span>
                          <span className="text-orange-600">Stock: {variant.stock}</span>
                          <div className="flex gap-1">
                            {variant.images.length > 0 && (
                              <span className="text-orange-600 flex items-center gap-1" title="Images">
                                <Image size={12} />
                                <span className="text-xs">{variant.images.length}</span>
                              </span>
                            )}
                            {variant.videos.length > 0 && (
                              <span className="text-purple-600 flex items-center gap-1" title="Videos">
                                <Video size={12} />
                                <span className="text-xs">{variant.videos.length}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {product.variants.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          + {product.variants.length - 3} more variants
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <button 
                      onClick={() => toggleProductStatus(product._id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.status === "Active"
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                    >
                      {product.status}
                    </button>
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <button 
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Eye size={16} className="text-foreground" />
                    </button>
                    <button 
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit size={16} className="text-foreground" />
                    </button>
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No products found matching your criteria
          </div>
        )}
      </div>
    </div>
  )
}
