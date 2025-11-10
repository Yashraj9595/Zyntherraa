// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    PRODUCTS: '/products',
    CATEGORIES: '/categories',
    USERS: '/users',
    ORDERS: '/orders',
    UPLOAD: '/upload',
    HEALTH: '/health',
  },
};

export default API_CONFIG;