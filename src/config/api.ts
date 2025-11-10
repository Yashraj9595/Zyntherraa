// API Configuration
const resolveDefaultBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.origin}/api`;
  }

  return 'http://localhost:5050/api';
};

const normaliseBaseUrl = (url: string) => url.replace(/\/+$/, '');

const API_BASE_URL = normaliseBaseUrl(resolveDefaultBaseUrl());

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