// Utility functions for handling image URLs
import API_CONFIG from '../config/api';

/**
 * Get the backend base URL (without /api)
 */
const getBackendBaseUrl = (): string => {
  // Try to get from environment variable
  if (process.env.REACT_APP_API_URL) {
    const apiUrl = process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '');
    if (apiUrl.startsWith('http://') || apiUrl.startsWith('https://')) {
      return apiUrl;
    }
  }
  
  // Check if we're in development or production
  // In development, backend typically runs on port 5000
  // In production, images are served from the same origin
  if (process.env.NODE_ENV === 'production') {
    // In production, use relative URLs (same origin)
    return '';
  }
  
  // Default to localhost:5000 (backend port)
  return 'http://localhost:5000';
};

/**
 * Get the full URL for an image
 * If the image path starts with http:// or https://, return as is
 * If it starts with /uploads/, prepend the backend URL
 * Otherwise, return as is (for placeholder images, etc.)
 */
export const getImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath || imagePath.trim() === '') {
    return '/images/placeholder.jpg';
  }

  const trimmedPath = imagePath.trim();
  const backendUrl = getBackendBaseUrl();

  // If already a full URL, return as is
  if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
    console.log('Image is already a full URL:', trimmedPath);
    return trimmedPath;
  }

  // If it's a placeholder or public image, return as is
  if (trimmedPath.startsWith('/images/') || trimmedPath.startsWith('/public/')) {
    return trimmedPath;
  }

  // Normalize upload paths
  let normalizedPath = trimmedPath;
  
  // If it starts with uploads but no leading slash, add it
  if (normalizedPath.startsWith('uploads/') && !normalizedPath.startsWith('/uploads/')) {
    normalizedPath = `/${normalizedPath}`;
  }
  
  // If it's an upload path, prepend backend URL
  if (normalizedPath.startsWith('/uploads/')) {
    const fullUrl = `${backendUrl}${normalizedPath}`;
    // Always log to debug image issues
    console.log('Image URL conversion:', { 
      original: trimmedPath, 
      normalized: normalizedPath,
      fullUrl, 
      backendUrl 
    });
    return fullUrl;
  }

  // Try to prepend backend URL if it looks like a file path
  if (normalizedPath.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    const fullUrl = normalizedPath.startsWith('/') 
      ? `${backendUrl}${normalizedPath}`
      : `${backendUrl}/${normalizedPath}`;
    if (process.env.NODE_ENV === 'development') {
      console.log('Image URL (file extension detected):', { 
        original: trimmedPath, 
        fullUrl, 
        backendUrl 
      });
    }
    return fullUrl;
  }

  // Last resort: try to construct URL
  if (normalizedPath.includes('file-') || normalizedPath.includes('uploads')) {
    const fullUrl = normalizedPath.startsWith('/') 
      ? `${backendUrl}${normalizedPath}`
      : `${backendUrl}/${normalizedPath}`;
    if (process.env.NODE_ENV === 'development') {
      console.log('Image URL (fallback):', { original: trimmedPath, fullUrl, backendUrl });
    }
    return fullUrl;
  }

  console.warn('Could not determine image URL format:', trimmedPath);
  return trimmedPath;
};

/**
 * Get multiple image URLs
 */
export const getImageUrls = (imagePaths: (string | undefined | null)[]): string[] => {
  return imagePaths
    .map(path => getImageUrl(path))
    .filter(url => url !== '/images/placeholder.jpg' || imagePaths.length === 0);
};

