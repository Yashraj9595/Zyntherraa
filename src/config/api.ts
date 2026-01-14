// API Configuration
const normaliseBaseUrl = (url: string) => url.replace(/\/+$/, '');

const API_BASE_URL = normaliseBaseUrl(
  process.env.REACT_APP_API_URL || '/api'
);

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