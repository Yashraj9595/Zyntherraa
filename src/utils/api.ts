// API Service Utility
import API_CONFIG from '../config/api';

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const token = localStorage.getItem('token'); // For JWT authentication

      const config: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // If token is invalid, remove it
        if (response.status === 401) {
          localStorage.removeItem('token');
        }
        
        return {
          error: data.message || data.error || 'An error occurred',
          message: data.message,
        };
      }

      return { data };
    } catch (error: any) {
      console.error('API Error:', error);
      return {
        error: error.message || 'Network error. Please check your connection.',
      };
    }
  }

  // GET request
  async get<T>(endpoint: string, options?: { params?: Record<string, any> }): Promise<ApiResponse<T>> {
    let url = endpoint;
    if (options?.params) {
      const queryParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        url += (endpoint.includes('?') ? '&' : '?') + queryString;
      }
    }
    return this.request<T>(url, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Upload file
  async uploadFile<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const token = localStorage.getItem('token');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // If token is invalid, remove it
        if (response.status === 401) {
          localStorage.removeItem('token');
        }
        
        return {
          error: data.message || data.error || 'Upload failed',
          message: data.message,
        };
      }

      return { data };
    } catch (error: any) {
      console.error('Upload Error:', error);
      return {
        error: error.message || 'Upload failed. Please try again.',
      };
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; message: string; timestamp: string }>> {
    return this.get(API_CONFIG.ENDPOINTS.HEALTH);
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Product API methods
export const productApi = {
  getAll: (params?: {
    category?: string;
    status?: string;
    search?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    minPrice?: string;
    maxPrice?: string;
    size?: string;
    color?: string;
    brand?: string;
  }) => {
    return apiService.get(API_CONFIG.ENDPOINTS.PRODUCTS, { params });
  },
  
  getById: (id: string) => {
    return apiService.get(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`);
  },
  
  create: (product: any) => {
    return apiService.post(API_CONFIG.ENDPOINTS.PRODUCTS, product);
  },
  
  update: (id: string, product: any) => {
    return apiService.put(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`, product);
  },
  
  delete: (id: string) => {
    return apiService.delete(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}`);
  },
  
  toggleStatus: (id: string) => {
    return apiService.put(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${id}/status`);
  },
};

// Category API methods
export const categoryApi = {
  getAll: () => {
    return apiService.get(API_CONFIG.ENDPOINTS.CATEGORIES);
  },
  
  getById: (id: string) => {
    return apiService.get(`${API_CONFIG.ENDPOINTS.CATEGORIES}/${id}`);
  },
  
  create: (category: any) => {
    return apiService.post(API_CONFIG.ENDPOINTS.CATEGORIES, category);
  },
  
  update: (id: string, category: any) => {
    return apiService.put(`${API_CONFIG.ENDPOINTS.CATEGORIES}/${id}`, category);
  },
  
  delete: (id: string) => {
    return apiService.delete(`${API_CONFIG.ENDPOINTS.CATEGORIES}/${id}`);
  },
  
  addSubcategory: (categoryId: string, subcategory: any) => {
    return apiService.post(
      `${API_CONFIG.ENDPOINTS.CATEGORIES}/${categoryId}/subcategories`,
      subcategory
    );
  },
  
  updateSubcategory: (categoryId: string, subcategoryId: string, subcategory: any) => {
    return apiService.put(
      `${API_CONFIG.ENDPOINTS.CATEGORIES}/${categoryId}/subcategories/${subcategoryId}`,
      subcategory
    );
  },
  
  deleteSubcategory: (categoryId: string, subcategoryId: string) => {
    return apiService.delete(
      `${API_CONFIG.ENDPOINTS.CATEGORIES}/${categoryId}/subcategories/${subcategoryId}`
    );
  },
};

// User API methods
export const userApi = {
  register: (userData: any) => {
    return apiService.post(`${API_CONFIG.ENDPOINTS.USERS}/register`, userData);
  },
  
  verifyOTP: (email: string, otp: string) => {
    return apiService.post(`${API_CONFIG.ENDPOINTS.USERS}/verify-otp`, { email, otp });
  },
  
  resendOTP: (email: string, purpose?: string) => {
    return apiService.post(`${API_CONFIG.ENDPOINTS.USERS}/resend-otp`, { email, purpose });
  },
  
  login: (credentials: { email: string; password: string }) => {
    return apiService.post(`${API_CONFIG.ENDPOINTS.USERS}/login`, credentials);
  },
  
  verifyLoginOTP: (email: string, otp: string) => {
    return apiService.post(`${API_CONFIG.ENDPOINTS.USERS}/verify-login-otp`, { email, otp });
  },
  
  getProfile: () => {
    return apiService.get(`${API_CONFIG.ENDPOINTS.USERS}/profile`);
  },
  
  getAll: () => {
    return apiService.get(API_CONFIG.ENDPOINTS.USERS);
  },
  
  update: (id: string, userData: any) => {
    return apiService.put(`${API_CONFIG.ENDPOINTS.USERS}/${id}`, userData);
  },
  
  forgotPassword: (email: string) => {
    return apiService.post(`${API_CONFIG.ENDPOINTS.USERS}/forgot-password`, { email });
  },
  
  verifyResetOTP: (email: string, otp: string) => {
    return apiService.post(`${API_CONFIG.ENDPOINTS.USERS}/verify-reset-otp`, { email, otp });
  },
  
  resetPassword: (resetToken: string, newPassword: string) => {
    return apiService.post(`${API_CONFIG.ENDPOINTS.USERS}/reset-password`, { resetToken, newPassword });
  },
  
  updateProfile: (profileData: { name?: string; phone?: string }) => {
    return apiService.put(`${API_CONFIG.ENDPOINTS.USERS}/profile`, profileData);
  },
  
  changePassword: (currentPassword: string, newPassword: string) => {
    return apiService.put(`${API_CONFIG.ENDPOINTS.USERS}/profile/password`, {
      currentPassword,
      newPassword,
    });
  },
  
  // Address management
  getAddresses: () => {
    return apiService.get(`${API_CONFIG.ENDPOINTS.USERS}/addresses`);
  },
  
  addAddress: (addressData: any) => {
    return apiService.post(`${API_CONFIG.ENDPOINTS.USERS}/addresses`, addressData);
  },
  
  updateAddress: (id: string, addressData: any) => {
    return apiService.put(`${API_CONFIG.ENDPOINTS.USERS}/addresses/${id}`, addressData);
  },
  
  deleteAddress: (id: string) => {
    return apiService.delete(`${API_CONFIG.ENDPOINTS.USERS}/addresses/${id}`);
  },
  
  // Order history
  getOrderHistory: (page?: number, limit?: number) => {
    const params: any = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;
    return apiService.get(`${API_CONFIG.ENDPOINTS.USERS}/orders`, { params });
  },
  
  reorder: (orderId: string) => {
    return apiService.post(`${API_CONFIG.ENDPOINTS.USERS}/orders/${orderId}/reorder`);
  },
};

// Order API methods
export const orderApi = {
  getAll: () => {
    return apiService.get(API_CONFIG.ENDPOINTS.ORDERS);
  },
  
  getById: (id: string) => {
    return apiService.get(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}`);
  },
  
  create: (order: any) => {
    return apiService.post(API_CONFIG.ENDPOINTS.ORDERS, order);
  },
  
  update: (id: string, order: any) => {
    return apiService.put(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}`, order);
  },
  
  markAsPaid: (id: string, paymentData: any) => {
    return apiService.put(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}/pay`, paymentData);
  },
  
  markAsDelivered: (id: string) => {
    return apiService.put(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}/deliver`, {});
  },
  
  updateStatus: (id: string, status: string) => {
    return apiService.put(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}/status`, { status });
  },
  
  delete: (id: string) => {
    return apiService.delete(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}`);
  },
};

// Payment API response types
export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  key: string;
  orderId: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  order: any;
}

// Payment API methods
export const paymentApi = {
  createOrder: (data: { amount: number; currency?: string; orderId: string; paymentMethod?: string }) => {
    return apiService.post<RazorpayOrderResponse>(`${API_CONFIG.ENDPOINTS.PAYMENTS}/create-order`, data);
  },
  
  verifyPayment: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderId: string;
  }) => {
    return apiService.post<PaymentVerificationResponse>(`${API_CONFIG.ENDPOINTS.PAYMENTS}/verify`, data);
  },
  
  createRefund: (data: { orderId: string; amount?: number; reason?: string; notes?: Record<string, any> }) => {
    return apiService.post(`${API_CONFIG.ENDPOINTS.PAYMENTS}/refund`, data);
  },
  
  getRefundStatus: (orderId: string) => {
    return apiService.get(`${API_CONFIG.ENDPOINTS.PAYMENTS}/refund/${orderId}`);
  },
};

// Upload API methods
export const uploadApi = {
  upload: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }
    return apiService.uploadFile(`${API_CONFIG.ENDPOINTS.UPLOAD}`, formData);
  },
};

// Home Page API methods
export const homepageApi = {
  // Banners
  getBanners: (activeOnly?: boolean) => {
    const query = activeOnly ? '?activeOnly=true' : '';
    return apiService.get(`${API_CONFIG.ENDPOINTS.HOMEPAGE}/banners${query}`);
  },
  
  getBanner: (id: string) => {
    return apiService.get(`${API_CONFIG.ENDPOINTS.HOMEPAGE}/banners/${id}`);
  },
  
  createBanner: (banner: any) => {
    return apiService.post(`${API_CONFIG.ENDPOINTS.HOMEPAGE}/banners`, banner);
  },
  
  updateBanner: (id: string, banner: any) => {
    return apiService.put(`${API_CONFIG.ENDPOINTS.HOMEPAGE}/banners/${id}`, banner);
  },
  
  deleteBanner: (id: string) => {
    return apiService.delete(`${API_CONFIG.ENDPOINTS.HOMEPAGE}/banners/${id}`);
  },
  
  // Featured Products
  getFeatured: (activeOnly?: boolean) => {
    const query = activeOnly ? '?activeOnly=true' : '';
    return apiService.get(`${API_CONFIG.ENDPOINTS.HOMEPAGE}/featured${query}`);
  },
  
  getFeaturedById: (id: string) => {
    return apiService.get(`${API_CONFIG.ENDPOINTS.HOMEPAGE}/featured/${id}`);
  },
  
  createFeatured: (featured: any) => {
    return apiService.post(`${API_CONFIG.ENDPOINTS.HOMEPAGE}/featured`, featured);
  },
  
  updateFeatured: (id: string, featured: any) => {
    return apiService.put(`${API_CONFIG.ENDPOINTS.HOMEPAGE}/featured/${id}`, featured);
  },
  
  deleteFeatured: (id: string) => {
    return apiService.delete(`${API_CONFIG.ENDPOINTS.HOMEPAGE}/featured/${id}`);
  },
  
  // Sections
  getSections: (activeOnly?: boolean, type?: string) => {
    const params = new URLSearchParams();
    if (activeOnly) params.append('activeOnly', 'true');
    if (type) params.append('type', type);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiService.get(`${API_CONFIG.ENDPOINTS.HOMEPAGE}/sections${query}`);
  },
  
  getSectionByType: (type: string, activeOnly?: boolean) => {
    return homepageApi.getSections(activeOnly, type);
  },
  
  createSection: (section: any) => {
    return apiService.post(`${API_CONFIG.ENDPOINTS.HOMEPAGE}/sections`, section);
  },
  
  updateSection: (id: string, section: any) => {
    return apiService.put(`${API_CONFIG.ENDPOINTS.HOMEPAGE}/sections/${id}`, section);
  },
  
  deleteSection: (id: string) => {
    return apiService.delete(`${API_CONFIG.ENDPOINTS.HOMEPAGE}/sections/${id}`);
  },
  
  // Watch & Shop
  getWatchAndShop: (activeOnly?: boolean) => {
    const query = activeOnly ? '?activeOnly=true' : '';
    return apiService.get(`${API_CONFIG.ENDPOINTS.HOMEPAGE}/watch-and-shop${query}`);
  },
  
  getWatchAndShopById: (id: string) => {
    return apiService.get(`${API_CONFIG.ENDPOINTS.HOMEPAGE}/watch-and-shop/${id}`);
  },
  
  createWatchAndShop: (item: any) => {
    return apiService.post(`${API_CONFIG.ENDPOINTS.HOMEPAGE}/watch-and-shop`, item);
  },
  
  updateWatchAndShop: (id: string, item: any) => {
    return apiService.put(`${API_CONFIG.ENDPOINTS.HOMEPAGE}/watch-and-shop/${id}`, item);
  },
  
  deleteWatchAndShop: (id: string) => {
    return apiService.delete(`${API_CONFIG.ENDPOINTS.HOMEPAGE}/watch-and-shop/${id}`);
  },
};

// Analytics API methods
export const analyticsApi = {
  getDashboard: () => {
    return apiService.get(`${API_CONFIG.ENDPOINTS.ANALYTICS}/dashboard`);
  },
  
  getReports: (params?: { timeRange?: string; startDate?: string; endDate?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.timeRange) queryParams.append('timeRange', params.timeRange);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const queryString = queryParams.toString();
    const endpoint = `${API_CONFIG.ENDPOINTS.ANALYTICS}/reports${queryString ? `?${queryString}` : ''}`;
    return apiService.get(endpoint);
  },
  
  getInventory: () => {
    return apiService.get(`${API_CONFIG.ENDPOINTS.ANALYTICS}/inventory`);
  },
};

// Wishlist API methods
export const wishlistApi = {
  getWishlist: () => {
    return apiService.get(API_CONFIG.ENDPOINTS.WISHLIST);
  },
  
  addItem: (productId: string, variant?: { size?: string; color?: string }) => {
    return apiService.post(API_CONFIG.ENDPOINTS.WISHLIST, { productId, variant });
  },
  
  removeItem: (itemId: string) => {
    return apiService.delete(`${API_CONFIG.ENDPOINTS.WISHLIST}/${itemId}`);
  },
  
  clearWishlist: () => {
    return apiService.delete(API_CONFIG.ENDPOINTS.WISHLIST);
  },
  
  moveToCart: (itemId: string) => {
    return apiService.post(`${API_CONFIG.ENDPOINTS.WISHLIST}/${itemId}/move-to-cart`);
  },
  
  getCount: () => {
    return apiService.get(`${API_CONFIG.ENDPOINTS.WISHLIST}/count`);
  },
};

// Search API methods
export const searchApi = {
  autocomplete: (query: string, limit: number = 5) => {
    return apiService.get(`${API_CONFIG.ENDPOINTS.SEARCH}/autocomplete`, {
      params: { q: query, limit },
    });
  },
  
  getHistory: (limit: number = 20) => {
    return apiService.get(`${API_CONFIG.ENDPOINTS.SEARCH}/history`, {
      params: { limit },
    });
  },
  
  deleteHistoryItem: (id: string) => {
    return apiService.delete(`${API_CONFIG.ENDPOINTS.SEARCH}/history/${id}`);
  },
  
  clearHistory: () => {
    return apiService.delete(`${API_CONFIG.ENDPOINTS.SEARCH}/history`);
  },
  
  getAnalytics: (limit: number = 50, sortBy: string = 'count') => {
    return apiService.get(`${API_CONFIG.ENDPOINTS.SEARCH}/analytics`, {
      params: { limit, sortBy },
    });
  },
};

// Shipping API methods
export const shippingApi = {
  calculate: (data: {
    items: Array<{ product: string; quantity: number }>;
    shippingAddress: {
      country: string;
      city?: string;
      postalCode?: string;
      state?: string;
    };
    shippingMethod?: string;
    orderValue: number;
  }) => {
    return apiService.post(`${API_CONFIG.ENDPOINTS.SHIPPING}/calculate`, data);
  },
  
  getMethods: (address: {
    country: string;
    city?: string;
    postalCode?: string;
    state?: string;
  }) => {
    return apiService.get(`${API_CONFIG.ENDPOINTS.SHIPPING}/methods`, {
      params: address,
    });
  },
};

export default apiService;