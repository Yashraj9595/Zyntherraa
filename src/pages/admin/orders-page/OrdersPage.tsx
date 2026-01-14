"use client"

import { useEffect, useState } from "react"
import { Search, Eye, ChevronDown, Check, X } from "lucide-react"
import { fetchOrders, type BackendOrder } from "../../../utils/ordersApi"

// Order status options
const orderStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Completed", "Cancelled", "Refunded"]

// Mock order data kept as fallback; replaced at runtime by backend data
const mockOrders = [
  { 
    id: "#ORD-001", 
    customer: "Rajesh Kumar", 
    amount: "₹2,345", 
    status: "Completed", 
    date: "2024-01-15", 
    items: 3,
    customerEmail: "rajesh.kumar@example.com",
    customerPhone: "+91 98765 43210",
    customerAddress: "123 Main Street, Mumbai, Maharashtra 400001",
    products: [
      { id: 1, name: "Premium Headphones", quantity: 1, price: "₹2,345", styleNumber: "HP-001", category: "Audio", fabric: "Plastic" }
    ]
  },
  { 
    id: "#ORD-002", 
    customer: "Priya Sharma", 
    amount: "₹5,678", 
    status: "Pending", 
    date: "2024-01-14", 
    items: 5,
    customerEmail: "priya.sharma@example.com",
    customerPhone: "+91 98765 43211",
    customerAddress: "456 Park Avenue, Delhi, Delhi 110001",
    products: [
      { id: 2, name: "Wireless Earbuds", quantity: 2, price: "₹1,890", styleNumber: "WE-002", category: "Audio", fabric: "Plastic" },
      { id: 3, name: "Charging Cable", quantity: 1, price: "₹456", styleNumber: "CC-003", category: "Accessories", fabric: "Silicon" }
    ]
  },
  { 
    id: "#ORD-003", 
    customer: "Amit Patel", 
    amount: "₹1,234", 
    status: "Shipped", 
    date: "2024-01-13", 
    items: 2,
    customerEmail: "amit.patel@example.com",
    customerPhone: "+91 98765 43212",
    customerAddress: "789 Business Park, Bangalore, Karnataka 560001",
    products: [
      { id: 4, name: "Bluetooth Speaker", quantity: 1, price: "₹1,234", styleNumber: "BS-004", category: "Audio", fabric: "Plastic" }
    ]
  },
  { 
    id: "#ORD-004", 
    customer: "Sneha Reddy", 
    amount: "₹8,900", 
    status: "Processing", 
    date: "2024-01-12", 
    items: 7,
    customerEmail: "sneha.reddy@example.com",
    customerPhone: "+91 98765 43213",
    customerAddress: "101 Tech Street, Hyderabad, Telangana 500001",
    products: [
      { id: 5, name: "Gaming Mouse", quantity: 1, price: "₹1,200", styleNumber: "GM-005", category: "Gaming", fabric: "Plastic" },
      { id: 6, name: "Mechanical Keyboard", quantity: 1, price: "₹3,500", styleNumber: "MK-006", category: "Gaming", fabric: "Plastic" },
      { id: 7, name: "RGB Headset", quantity: 1, price: "₹4,200", styleNumber: "RH-007", category: "Gaming", fabric: "Plastic" }
    ]
  },
  { 
    id: "#ORD-005", 
    customer: "Vikram Singh", 
    amount: "₹3,456", 
    status: "Delivered", 
    date: "2024-01-11", 
    items: 4,
    customerEmail: "vikram.singh@example.com",
    customerPhone: "+91 98765 43214",
    customerAddress: "202 Innovation Blvd, Pune, Maharashtra 411001",
    products: [
      { id: 8, name: "Smartphone Stand", quantity: 2, price: "₹356", styleNumber: "SS-008", category: "Accessories", fabric: "Metal" },
      { id: 9, name: "Screen Protector", quantity: 2, price: "₹300", styleNumber: "SP-009", category: "Accessories", fabric: "Glass" }
    ]
  },
  { 
    id: "#ORD-006", 
    customer: "Anita Gupta", 
    amount: "₹1,890", 
    status: "Cancelled", 
    date: "2024-01-10", 
    items: 2,
    customerEmail: "anita.gupta@example.com",
    customerPhone: "+91 98765 43215",
    customerAddress: "303 Corporate Center, Chennai, Tamil Nadu 600001",
    products: [
      { id: 10, name: "USB Hub", quantity: 1, price: "₹890", styleNumber: "UH-010", category: "Accessories", fabric: "Plastic" },
      { id: 11, name: "Laptop Sleeve", quantity: 1, price: "₹1,000", styleNumber: "LS-011", category: "Accessories", fabric: "Neoprene" }
    ]
  },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState(mockOrders)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [recentlyUpdatedOrder, setRecentlyUpdatedOrder] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Function to update order status
  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      )
    )
    // Set the recently updated order and clear it after 2 seconds
    setRecentlyUpdatedOrder(orderId)
    setTimeout(() => {
      setRecentlyUpdatedOrder(null)
    }, 2000)
  }

  // Function to print invoice
  const printInvoice = () => {
    if (!selectedOrder) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice - ${selectedOrder.id}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 20px; 
              color: #333;
            }
            .invoice-header {
              text-align: center;
              border-bottom: 2px solid #eee;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .company-info {
              text-align: center;
              margin-bottom: 20px;
            }
            .company-name {
              font-size: 28px;
              font-weight: bold;
              color: #2d3748;
              margin-bottom: 5px;
            }
            .company-address {
              color: #718096;
              margin-bottom: 5px;
            }
            .company-contact {
              color: #718096;
            }
            .invoice-title {
              font-size: 24px;
              font-weight: bold;
              color: #2d3748;
            }
            .invoice-details {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #2d3748;
              border-bottom: 1px solid #eee;
              padding-bottom: 5px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }
            .info-item {
              margin-bottom: 5px;
            }
            .info-label {
              font-weight: bold;
              display: inline-block;
              width: 120px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f7fafc;
              font-weight: bold;
            }
            .text-right {
              text-align: right;
            }
            .total-row {
              font-weight: bold;
              background-color: #f7fafc;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 14px;
              color: #718096;
            }
          </style>
        </head>
        <body>
          <div class="invoice-header">
            <div class="company-info">
              <div class="company-name">Zyntherraa</div>
              <div class="company-address">123 Tech Park, Mumbai, Maharashtra 400001</div>
              <div class="company-contact">Phone: +91 98765 43210 | Email: info@zyntherraa.com</div>
            </div>
            <div class="invoice-title">INVOICE</div>
            <div>Order ID: ${selectedOrder.id}</div>
            <div>Date: ${selectedOrder.date}</div>
          </div>
          
          <div class="invoice-details">
            <div class="section">
              <div class="section-title">Billing Information</div>
              <div class="info-item"><span class="info-label">Customer:</span> ${selectedOrder.customer}</div>
              <div class="info-item"><span class="info-label">Email:</span> ${selectedOrder.customerEmail}</div>
              <div class="info-item"><span class="info-label">Phone:</span> ${selectedOrder.customerPhone}</div>
              <div class="info-item"><span class="info-label">Address:</span> ${selectedOrder.customerAddress}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Order Items</div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Style Number</th>
                  <th>Category</th>
                  <th class="text-right">Quantity</th>
                  <th class="text-right">Price</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${selectedOrder.products.map((product: any) => `
                  <tr>
                    <td>${product.name}</td>
                    <td>${product.styleNumber}</td>
                    <td>${product.category}</td>
                    <td class="text-right">${product.quantity}</td>
                    <td class="text-right">${product.price}</td>
                    <td class="text-right">${product.price}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="5" class="text-right">Total Amount:</td>
                  <td class="text-right">${selectedOrder.amount}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>This is a computer generated invoice and does not require a signature.</p>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Function to view order details
  const viewOrderDetails = (order: any) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  // Function to close modal
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedOrder(null)
  }

  // Function to get status color classes
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Delivered":
        return "bg-emerald-100 text-emerald-800"
      case "Shipped":
        return "bg-blue-100 text-blue-800"
      case "Processing":
        return "bg-purple-100 text-purple-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      case "Refunded":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredOrders = orders.filter(
    (o) => {
      const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           o.customer.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "All" || o.status === statusFilter
      return matchesSearch && matchesStatus
    }
  )

  // Load from backend on mount and map to UI shape
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const backendOrders: BackendOrder[] = await fetchOrders()
        const mapped = backendOrders.map((o) => {
          const id = `#ORD-${o._id.slice(-6).toUpperCase()}`
          const customerName = typeof o.user === 'string' ? 'Customer' : (o.user?.name || 'Customer')
          const customerEmail = typeof o.user === 'string' ? '' : (o.user?.email || '')
          const itemsCount = o.items?.reduce((sum, it) => sum + (it.quantity || 0), 0) || 0
          const amount = `₹${o.totalPrice?.toLocaleString('en-IN') || '0'}`
          const date = new Date(o.createdAt).toISOString().slice(0,10)
          const status = o.isDelivered ? 'Delivered' : (o.isPaid ? 'Processing' : 'Pending')
          const customerPhone = o.shippingAddress?.phone || ''
          const customerAddress = [
            o.shippingAddress?.address,
            o.shippingAddress?.city,
            o.shippingAddress?.postalCode,
            o.shippingAddress?.country,
          ].filter(Boolean).join(', ')
          return {
            id,
            customer: customerName,
            amount,
            status,
            date,
            items: itemsCount,
            customerEmail,
            customerPhone,
            customerAddress,
            products: o.items?.map((it, idx) => ({
              id: idx + 1,
              name: it.variantId || 'Product',
              quantity: it.quantity,
              price: `₹${(it.price || 0).toLocaleString('en-IN')}`,
              styleNumber: it.variantId,
              category: '',
              fabric: '',
            })) || [],
          }
        })
        setOrders(mapped)
      } catch (e) {
        setError('Failed to load orders from backend')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Calculate order statistics
  const orderStats = orderStatuses.reduce((acc, status) => {
    acc[status] = orders.filter(order => order.status === status).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground mt-2">Manage customer orders and update their status</p>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {orderStatuses.map((status) => (
          <div key={status} className="bg-card p-4 rounded-lg border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 transform-gpu">
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)} transition-all duration-200 shadow-sm`}>
              {status}
            </div>
            <div className="text-2xl font-bold text-foreground mt-2">
              {orderStats[status] || 0}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border border-input rounded-lg bg-background shadow-sm">
        {loading && (
          <div className="mb-4 px-3 py-2 rounded bg-blue-50 text-blue-800">Loading orders...</div>
        )}
        {error && (
          <div className="mb-4 px-3 py-2 rounded bg-red-100 text-red-800">{error}</div>
        )}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-input rounded-lg bg-background text-foreground appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 min-w-[140px]"
            >
              <option value="All">All Status</option>
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-muted-foreground" size={16} />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-input shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Order ID</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Items</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.map((order) => (
                <tr 
                  key={order.id} 
                  className={`hover:bg-muted/50 transition-all duration-200 ${recentlyUpdatedOrder === order.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''}`}
                >
                  <td className="py-3 px-4 text-foreground font-medium">{order.id}</td>
                  <td className="py-3 px-4 text-foreground">{order.customer}</td>
                  <td className="py-3 px-4 text-foreground">{order.items}</td>
                  <td className="py-3 px-4 text-foreground font-semibold">{order.amount}</td>
                  <td className="py-3 px-4">
                    <div className="relative inline-block">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border-0 appearance-none pr-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${getStatusColor(order.status)} transition-all duration-200 ease-in-out transform hover:scale-105 shadow-sm`}
                      >
                        {orderStatuses.map((status) => (
                          <option key={status} value={status} className="bg-background text-foreground">
                            {status}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none" size={12} />
                      {recentlyUpdatedOrder === order.id && (
                        <Check className="absolute -top-2 -right-2 w-5 h-5 text-green-500 bg-white rounded-full border-2 border-green-500" size={16} />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{order.date}</td>
                  <td className="py-3 px-4">
                    <button 
                      onClick={() => viewOrderDetails(order)}
                      className="p-2 hover:bg-primary/10 rounded-lg transition-colors duration-150 group"
                      title="View Order Details"
                    >
                      <Eye size={16} className="text-foreground group-hover:text-primary" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border animate-slide-up">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-foreground">Order Details</h2>
                <button 
                  onClick={closeModal}
                  className="p-2 hover:bg-muted rounded-lg transition-colors duration-150"
                >
                  <X size={20} className="text-foreground" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Order Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Order ID:</span>
                        <span className="font-medium text-foreground">{selectedOrder.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Order Date:</span>
                        <span className="font-medium text-foreground">{selectedOrder.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Items:</span>
                        <span className="font-medium text-foreground">{selectedOrder.items}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Amount:</span>
                        <span className="font-bold text-foreground">{selectedOrder.amount}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Customer Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Customer Name:</span>
                        <span className="font-medium text-foreground">{selectedOrder.customer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium text-foreground">{selectedOrder.customerEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium text-foreground">{selectedOrder.customerPhone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Address:</span>
                        <span className="font-medium text-foreground">{selectedOrder.customerAddress}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Order Items</h3>
                  <div className="rounded-lg overflow-hidden">
                    <div className="bg-card border-b border-border">
                      <div className="grid grid-cols-12 gap-4 py-2 px-4 font-semibold text-foreground">
                        <div className="col-span-6">Product</div>
                        <div className="col-span-2 text-center">Style Number</div>
                        <div className="col-span-1 text-center">Qty</div>
                        <div className="col-span-3 text-right">Price</div>
                      </div>
                    </div>
                    <div className="divide-y divide-border">
                      {selectedOrder.products && selectedOrder.products.map((product: any, index: number) => (
                        <div key={index} className="grid grid-cols-12 gap-4 py-3 px-4 bg-background hover:bg-muted/50">
                          <div className="col-span-6 font-medium text-foreground">
                            <div>{product.name}</div>
                            <div className="text-sm text-muted-foreground">{product.category}</div>
                            {product.fabric && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Fabric: {product.fabric}
                              </div>
                            )}
                          </div>
                          <div className="col-span-2 text-center text-foreground">{product.styleNumber}</div>
                          <div className="col-span-1 text-center text-foreground">{product.quantity}</div>
                          <div className="col-span-3 text-right text-foreground">{product.price}</div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-card border-t border-border py-3 px-4">
                      <div className="flex justify-between font-bold text-foreground">
                        <span>Total:</span>
                        <span>{selectedOrder.amount}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    onClick={closeModal}
                    className="px-4 py-2 border border-input rounded-lg text-foreground hover:bg-muted transition-colors duration-150"
                  >
                    Close
                  </button>
                  <button 
                    onClick={printInvoice}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-150 flex items-center gap-2"
                  >
                    Print Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}