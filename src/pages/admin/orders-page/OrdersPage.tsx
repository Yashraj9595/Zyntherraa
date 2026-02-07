"use client"

import { useState, useEffect } from "react"
import { Search, Eye, ChevronDown, Check, X } from "lucide-react"
import { orderApi } from "../../../utils/api"

// Order status options
const orderStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Completed", "Cancelled", "Refunded"]

interface OrderItem {
  product: string | { _id: string; title: string };
  variantId: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

interface Order {
  _id: string;
  user: { _id: string; name: string; email: string };
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
  status?: string;
  isPaid: boolean;
  isDelivered: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [recentlyUpdatedOrder, setRecentlyUpdatedOrder] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await orderApi.getAll()
        if (response.data) {
          const ordersData = Array.isArray(response.data) ? response.data : [];
          setOrders(ordersData as Order[])
        } else {
          setError(response.error || 'Failed to fetch orders')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Function to update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await orderApi.updateStatus(orderId, newStatus)
      if (response.data) {
    setOrders(prevOrders => 
      prevOrders.map(order => 
            order._id === orderId 
          ? { ...order, status: newStatus }
          : order
      )
    )
    setRecentlyUpdatedOrder(orderId)
    setTimeout(() => {
      setRecentlyUpdatedOrder(null)
    }, 2000)
      } else {
        alert(response.error || 'Failed to update order status')
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update order status')
    }
  }

  // Function to print invoice
  const printInvoice = () => {
    if (!selectedOrder) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const orderDate = new Date(selectedOrder.createdAt).toLocaleDateString()
      const customerName = selectedOrder.user?.name || selectedOrder.shippingAddress?.fullName || 'Customer'
      const customerEmail = selectedOrder.user?.email || ''
      const customerPhone = selectedOrder.shippingAddress?.phone || ''
      const customerAddress = `${selectedOrder.shippingAddress?.address || ''}, ${selectedOrder.shippingAddress?.city || ''}, ${selectedOrder.shippingAddress?.postalCode || ''}, ${selectedOrder.shippingAddress?.country || ''}`
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice - ${selectedOrder._id}</title>
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
            <div>Order ID: ${selectedOrder._id}</div>
            <div>Date: ${orderDate}</div>
          </div>
          
          <div class="invoice-details">
            <div class="section">
              <div class="section-title">Billing Information</div>
              <div class="info-item"><span class="info-label">Customer:</span> ${customerName}</div>
              <div class="info-item"><span class="info-label">Email:</span> ${customerEmail}</div>
              <div class="info-item"><span class="info-label">Phone:</span> ${customerPhone}</div>
              <div class="info-item"><span class="info-label">Address:</span> ${customerAddress}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Order Items</div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Size</th>
                  <th>Color</th>
                  <th class="text-right">Quantity</th>
                  <th class="text-right">Price</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? selectedOrder.items.map((item: OrderItem) => {
                  const productName = typeof item.product === 'object' ? item.product.title : 'Product'
                  const itemTotal = item.price * item.quantity
                  return `
                    <tr>
                      <td>${productName}</td>
                      <td>${item.size || 'N/A'}</td>
                      <td>${item.color || 'N/A'}</td>
                      <td class="text-right">${item.quantity}</td>
                      <td class="text-right">₹${item.price.toLocaleString()}</td>
                      <td class="text-right">₹${itemTotal.toLocaleString()}</td>
                    </tr>
                  `
                }).join('') : '<tr><td colspan="6" class="text-center">No items found</td></tr>'}
                <tr>
                  <td colspan="5" class="text-right">Subtotal:</td>
                  <td class="text-right">₹${selectedOrder.itemsPrice.toLocaleString()}</td>
                </tr>
                <tr>
                  <td colspan="5" class="text-right">Tax:</td>
                  <td class="text-right">₹${selectedOrder.taxPrice.toLocaleString()}</td>
                </tr>
                <tr>
                  <td colspan="5" class="text-right">Shipping:</td>
                  <td class="text-right">₹${selectedOrder.shippingPrice.toLocaleString()}</td>
                  </tr>
                <tr class="total-row">
                  <td colspan="5" class="text-right">Total Amount:</td>
                  <td class="text-right">₹${selectedOrder.totalPrice.toLocaleString()}</td>
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
  const viewOrderDetails = (formattedOrder: any) => {
    // Find the original order from the orders state using the _id
    const originalOrder = orders.find(o => o._id === formattedOrder._id)
    if (originalOrder) {
      setSelectedOrder(originalOrder)
      setIsModalOpen(true)
    } else {
      // Fallback: if original order not found, use formatted order but ensure items is an array
      const orderWithItems = {
        ...formattedOrder,
        items: Array.isArray(formattedOrder.items) ? formattedOrder.items : (formattedOrder.products || [])
      }
      setSelectedOrder(orderWithItems as Order)
      setIsModalOpen(true)
    }
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

  // Format order for display
  const formatOrderForDisplay = (order: Order) => {
    const status = order.status || (order.isDelivered ? 'Delivered' : order.isPaid ? 'Processing' : 'Pending')
    const date = new Date(order.createdAt).toLocaleDateString()
    const amount = `₹${order.totalPrice.toLocaleString()}`
    const customer = order.user?.name || order.shippingAddress?.fullName || 'Unknown'
    const items = order.items.length
    
    return {
      ...order,
      id: `#ORD-${order._id.slice(-6).toUpperCase()}`,
      customer,
      amount,
      status,
      date,
      items,
      customerEmail: order.user?.email || '',
      customerPhone: order.shippingAddress?.phone || '',
      customerAddress: `${order.shippingAddress?.address || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.postalCode || ''}, ${order.shippingAddress?.country || ''}`,
      products: order.items.map((item: OrderItem) => ({
        id: typeof item.product === 'object' ? item.product._id : item.product,
        name: typeof item.product === 'object' ? item.product.title : 'Product',
        quantity: item.quantity,
        price: `₹${(item.price * item.quantity).toLocaleString()}`,
        size: item.size,
        color: item.color
      }))
    }
  }

  const filteredOrders = orders
    .map(formatOrderForDisplay)
    .filter((o: any) => {
      const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           o.customer.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "All" || o.status === statusFilter
      return matchesSearch && matchesStatus
    })

  // Calculate order statistics
  const orderStats = orderStatuses.reduce((acc, status) => {
    acc[status] = orders.filter(order => {
      const orderStatus = order.status || (order.isDelivered ? 'Delivered' : order.isPaid ? 'Processing' : 'Pending')
      return orderStatus === status
    }).length
    return acc
  }, {} as Record<string, number>)

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    )
  }

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

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No orders found</p>
          </div>
        ) : (
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
                {filteredOrders.map((order: any) => (
                <tr 
                    key={order._id} 
                    className={`hover:bg-muted/50 transition-all duration-200 ${recentlyUpdatedOrder === order._id ? 'bg-green-50 border-l-4 border-l-green-500' : ''}`}
                >
                  <td className="py-3 px-4 text-foreground font-medium">{order.id}</td>
                  <td className="py-3 px-4 text-foreground">{order.customer}</td>
                  <td className="py-3 px-4 text-foreground">{order.items}</td>
                  <td className="py-3 px-4 text-foreground font-semibold">{order.amount}</td>
                  <td className="py-3 px-4">
                    <div className="relative inline-block">
                      <select
                        value={order.status}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border-0 appearance-none pr-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${getStatusColor(order.status)} transition-all duration-200 ease-in-out transform hover:scale-105 shadow-sm`}
                      >
                        {orderStatuses.map((status) => (
                          <option key={status} value={status} className="bg-background text-foreground">
                            {status}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none" size={12} />
                        {recentlyUpdatedOrder === order._id && (
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
        )}
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
                        <span className="font-medium text-foreground">{selectedOrder._id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Order Date:</span>
                        <span className="font-medium text-foreground">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.status || 'Pending')}`}>
                          {selectedOrder.status || 'Pending'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Items:</span>
                        <span className="font-medium text-foreground">{Array.isArray(selectedOrder.items) ? selectedOrder.items.length : 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Amount:</span>
                        <span className="font-bold text-foreground">₹{selectedOrder.totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Customer Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Customer Name:</span>
                        <span className="font-medium text-foreground">{selectedOrder.user?.name || selectedOrder.shippingAddress?.fullName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium text-foreground">{selectedOrder.user?.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium text-foreground">{selectedOrder.shippingAddress?.phone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Address:</span>
                        <span className="font-medium text-foreground text-right">
                          {selectedOrder.shippingAddress?.address || ''}, {selectedOrder.shippingAddress?.city || ''}, {selectedOrder.shippingAddress?.postalCode || ''}, {selectedOrder.shippingAddress?.country || ''}
                        </span>
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
                        <div className="col-span-2 text-center">Size/Color</div>
                        <div className="col-span-1 text-center">Qty</div>
                        <div className="col-span-3 text-right">Price</div>
                      </div>
                    </div>
                    <div className="divide-y divide-border">
                      {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item: OrderItem, index: number) => {
                          const productName = typeof item.product === 'object' ? item.product.title : 'Product'
                          const itemTotal = item.price * item.quantity
                          return (
                          <div key={index} className="grid grid-cols-12 gap-4 py-3 px-4 bg-background hover:bg-muted/50">
                            <div className="col-span-6 font-medium text-foreground">
                                <div>{productName}</div>
                                </div>
                              <div className="col-span-2 text-center text-foreground">{item.size || 'N/A'} / {item.color || 'N/A'}</div>
                              <div className="col-span-1 text-center text-foreground">{item.quantity}</div>
                              <div className="col-span-3 text-right text-foreground">₹{itemTotal.toLocaleString()}</div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="py-4 px-4 text-center text-muted-foreground">
                          No items found in this order
                        </div>
                      )}
                    </div>
                    <div className="bg-card border-t border-border py-3 px-4">
                      <div className="flex justify-between font-bold text-foreground">
                        <span>Total:</span>
                        <span>₹{selectedOrder.totalPrice.toLocaleString()}</span>
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
