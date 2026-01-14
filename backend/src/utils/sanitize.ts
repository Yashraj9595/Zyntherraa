import DOMPurify from 'isomorphic-dompurify';

// Sanitize string input
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  return sanitized;
};

// Sanitize HTML content
export const sanitizeHTML = (html: string): string => {
  if (typeof html !== 'string') {
    return '';
  }
  
  try {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      ALLOWED_ATTR: [],
    });
  } catch (error) {
    console.error('HTML sanitization error:', error);
    return sanitizeString(html);
  }
};

// Sanitize object recursively
export const sanitizeObject = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Sanitize key name
        const cleanKey = sanitizeString(key);
        sanitized[cleanKey] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
};

// Sanitize email
export const sanitizeEmail = (email: string): string => {
  return sanitizeString(email).toLowerCase().trim();
};

// Sanitize phone number
export const sanitizePhone = (phone: string): string => {
  // Remove all non-digit characters except +
  return sanitizeString(phone).replace(/[^\d+]/g, '');
};

// Sanitize URL
export const sanitizeURL = (url: string): string => {
  const sanitized = sanitizeString(url);
  
  // Basic URL validation
  try {
    const urlObj = new URL(sanitized);
    return urlObj.toString();
  } catch {
    // If not a valid URL, return sanitized string
    return sanitized;
  }
};

// Sanitize MongoDB ObjectId
export const sanitizeObjectId = (id: string): string => {
  const sanitized = sanitizeString(id);
  // ObjectId should be 24 hex characters
  if (/^[0-9a-fA-F]{24}$/.test(sanitized)) {
    return sanitized;
  }
  throw new Error('Invalid ObjectId format');
};

