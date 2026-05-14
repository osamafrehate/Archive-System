/**
 * API Configuration and Constants
 * Centralized configuration for API integration with ASP.NET Core backend
 */

// API Base URL - uses environment variable or falls back to production
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.3.33:5000/api';



// API Endpoints - mapping for backend routes
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me'
  },
  CATEGORIES: {
    GET_ALL: '/categories',
    GET_ACTIVE: '/categories/active',
    GET_USER: '/categories/UserCategories',
    GET_USER_READ_PERMISSION: '/categories/UserCategoriesReadPermission',
    GET_USER_EDIT_PERMISSION: '/categories/UserCategoriesEditPermission',
    CREATE: '/categories',
    ACTIVATE_BY_NAME: '/categories/activate-by-name'
  },
  FILES: {
    GET_ALL: '/files',
    UPLOAD: '/files/upload',
    PREVIEW: '/files/preview',
    DOWNLOAD: '/files/download',
    RENAME: '/files/:id/rename'
  },
  ADMIN: {
    ASSIGN_PERMISSIONS: '/admin/assign-permissions',
    USER_PERMISSIONS: '/admin/users/:userId/category-permissions'
  },
  USERS: {
    SEARCH: '/users/search'
  },
  PERMISSIONS: {
    GET_ALL: '/permissions',
    CREATE: '/permissions',
    UPDATE: '/permissions/:id',
    DELETE: '/permissions/:id'
  }
};

// HTTP Status Codes with messaging
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// Error messages mapping
export const ERROR_MESSAGES = {
  401: 'Unauthorized. Please log in again.',
  403: 'Access denied. You do not have permission to perform this action.',
  404: 'Resource not found.',
  500: 'Server error. Please try again later or contact support.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT: 'Request timeout. Please try again.',
  UNKNOWN: 'An unexpected error occurred.'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'archive_access_token',
  REFRESH_TOKEN: 'archive_refresh_token',
  USER_DATA: 'archive_user_data'
};

// Token configuration
export const TOKEN_CONFIG = {
  HEADER_PREFIX: 'Bearer',
  REFRESH_BUFFER_MINUTES: 5, // Refresh token 5 minutes before expiry
  MAX_REFRESH_ATTEMPTS: 1
};

// Request timeouts (in milliseconds)
export const REQUEST_TIMEOUT = {
  DEFAULT: 30000,
  UPLOAD: 120000, // Longer timeout for file uploads
  DOWNLOAD: 120000 // Longer timeout for file downloads
};

// API Health Check
export async function checkApiHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      timeout: REQUEST_TIMEOUT.DEFAULT
    });
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}
