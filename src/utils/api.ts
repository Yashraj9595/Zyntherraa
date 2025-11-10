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
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
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
  getAll: (params?: { category?: string; status?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS}${queryString ? `?${queryString}` : ''}`;
    return apiService.get(endpoint);
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
  
  login: (credentials: { email: string; password: string }) => {
    return apiService.post(`${API_CONFIG.ENDPOINTS.USERS}/login`, credentials);
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

export default apiService;