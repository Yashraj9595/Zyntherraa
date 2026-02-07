"use client"

import { useState, useEffect } from "react"
import { Card } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Download, 
  Upload, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  DollarSign,
  Eye,
  X,
  ChevronDown,
  User,
  Shield,
  Crown
} from "lucide-react"
import { userApi, orderApi } from "../../../utils/api"

interface UserData {
  _id: string
  id?: number
  name: string
  email: string
  phone?: string
  address?: string
  role: "customer" | "admin" | "Customer" | "Admin" | "Manager" | "Support"
  joinDate?: string
  createdAt?: string
  lastLogin?: string
  status: "Active" | "Inactive" | "Suspended" | "Pending"
  isActive?: boolean
  avatar?: string
  totalOrders?: number
  totalSpent?: number
  country?: string
  city?: string
  verified?: boolean
  newsletter?: boolean
}

// Mock users removed - using real API data
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockUsers: UserData[] = []

const roles = ["All", "Customer", "Admin", "Manager", "Support"]
const statuses = ["All", "Active", "Inactive", "Suspended", "Pending"]

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await userApi.getAll()
        if (response.data) {
          // Fetch orders to calculate stats for each user
          const ordersResponse = await orderApi.getAll()
          const orders = ordersResponse.data || []
          
          // Calculate user stats
          const usersData = Array.isArray(response.data) ? response.data : [];
          const ordersData = Array.isArray(orders) ? orders : [];
          const usersWithStats = usersData.map((user: any) => {
            const userOrders = ordersData.filter((order: any) => 
              order.user && (order.user._id === user._id || order.user.toString() === user._id.toString())
            )
            const totalSpent = userOrders.reduce((sum: number, order: any) => sum + (order.totalPrice || 0), 0)
            
            return {
              ...user,
              totalOrders: userOrders.length,
              totalSpent: totalSpent,
              status: user.isActive ? 'Active' : 'Inactive',
              role: user.role === 'admin' ? 'Admin' : 'Customer',
              joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
              lastLogin: 'N/A', // Backend doesn't track this yet
              phone: '', // Backend doesn't have phone field
              address: '', // Backend doesn't have address field
              country: 'India', // Default
              city: '', // Backend doesn't have city field
              verified: true, // Default
              newsletter: false, // Default
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
            }
          })
          
          setUsers(usersWithStats)
        } else {
          setError(response.error || 'Failed to fetch users')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Helper functions
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Admin": return <Crown size={14} className="text-yellow-600" />
      case "Manager": return <Shield size={14} className="text-blue-600" />
      case "Support": return <User size={14} className="text-green-600" />
      default: return <User size={14} className="text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800"
      case "Inactive": return "bg-gray-100 text-gray-800"
      case "Suspended": return "bg-red-100 text-red-800"
      case "Pending": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin": return "bg-purple-100 text-purple-800"
      case "Manager": return "bg-blue-100 text-blue-800"
      case "Support": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.phone && user.phone.includes(searchTerm)) ||
                         (user.city && user.city.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesRole = roleFilter === "All" || 
                       (roleFilter === "Customer" && (user.role === "customer" || user.role === "Customer")) ||
                       (roleFilter === "Admin" && (user.role === "admin" || user.role === "Admin")) ||
                       user.role === roleFilter
    const matchesStatus = statusFilter === "All" || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  // Statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === "Active").length,
    customers: users.filter(u => u.role === "customer" || u.role === "Customer").length,
    totalRevenue: users.reduce((sum, u) => sum + (u.totalSpent || 0), 0)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading users...</p>
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-2">Comprehensive user account management and analytics</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download size={16} />
            Export
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Upload size={16} />
            Import
          </Button>
          <Button onClick={() => console.log('Add user clicked')} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus size={16} className="mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Users</p>
              <p className="text-3xl font-bold text-foreground">{stats.active}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <User className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Customers</p>
              <p className="text-3xl font-bold text-foreground">{stats.customers}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold text-foreground">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, phone, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-input rounded-lg bg-background text-foreground appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary min-w-[120px]"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>{role} Role</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-muted-foreground" size={16} />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-input rounded-lg bg-background text-foreground appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary min-w-[120px]"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>{status} Status</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-muted-foreground" size={16} />
            </div>
          </div>
        </div>

        {/* Enhanced Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 font-semibold text-foreground">User</th>
                <th className="text-left py-4 px-4 font-semibold text-foreground">Contact</th>
                <th className="text-left py-4 px-4 font-semibold text-foreground">Role</th>
                <th className="text-left py-4 px-4 font-semibold text-foreground">Activity</th>
                <th className="text-left py-4 px-4 font-semibold text-foreground">Orders</th>
                <th className="text-left py-4 px-4 font-semibold text-foreground">Status</th>
                <th className="text-left py-4 px-4 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} 
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-foreground flex items-center gap-2">
                          {user.name}
                          {user.verified && <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>}
                        </div>
                        {(user.city || user.country) && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin size={12} />
                            {user.city || ''}{user.city && user.country ? ', ' : ''}{user.country || ''}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={12} className="text-muted-foreground" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone size={12} />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${getRoleColor(user.role === 'admin' ? 'Admin' : user.role === 'customer' ? 'Customer' : user.role)}`}>
                      {getRoleIcon(user.role === 'admin' ? 'Admin' : user.role === 'customer' ? 'Customer' : user.role)}
                      {user.role === 'admin' ? 'Admin' : user.role === 'customer' ? 'Customer' : user.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={12} className="text-muted-foreground" />
                        Joined {user.joinDate}
                      </div>
                      {user.lastLogin && (
                        <div className="text-xs text-muted-foreground">
                          Last login: {user.lastLogin}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <ShoppingBag size={12} className="text-muted-foreground" />
                        {user.totalOrders} orders
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        ₹{(user.totalSpent || 0).toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedUser(user)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} className="text-foreground" />
                      </button>
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Edit User">
                        <Edit2 size={16} className="text-foreground" />
                      </button>
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Delete User">
                        <Trash2 size={16} className="text-destructive" />
                      </button>
                      <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Send Email">
                        <Mail size={16} className="text-blue-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-foreground">No users found</h3>
            <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </Card>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <img 
                    src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=random`} 
                    alt={selectedUser.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                      {selectedUser.name}
                      {selectedUser.verified && <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>}
                    </h2>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-muted-foreground" />
                      <span className="text-sm">{selectedUser.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-muted-foreground" />
                      <span className="text-sm">{selectedUser.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-muted-foreground" />
                      <span className="text-sm">{selectedUser.address}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Account Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Role:</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getRoleColor(selectedUser.role)}`}>
                        {selectedUser.role}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(selectedUser.status)}`}>
                        {selectedUser.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Joined:</span>
                      <span className="text-sm">{selectedUser.joinDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Login:</span>
                      <span className="text-sm">{selectedUser.lastLogin}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Order Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Orders:</span>
                      <span className="text-sm font-medium">{selectedUser.totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Spent:</span>
                      <span className="text-sm font-medium text-green-600">₹{(selectedUser.totalSpent || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Average Order:</span>
                      <span className="text-sm font-medium">
                        ₹{(selectedUser.totalOrders || 0) > 0 ? Math.round((selectedUser.totalSpent || 0) / (selectedUser.totalOrders || 1)).toLocaleString() : '0'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Preferences</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Email Verified:</span>
                      <span className={`text-sm font-medium ${selectedUser.verified ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedUser.verified ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Newsletter:</span>
                      <span className={`text-sm font-medium ${selectedUser.newsletter ? 'text-green-600' : 'text-gray-600'}`}>
                        {selectedUser.newsletter ? 'Subscribed' : 'Not Subscribed'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <Button variant="outline" className="flex-1">
                  <Edit2 size={16} className="mr-2" />
                  Edit User
                </Button>
                <Button variant="outline" className="flex-1">
                  <Mail size={16} className="mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" className="text-destructive hover:text-destructive">
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
