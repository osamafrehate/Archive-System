/**
 * API Error Handler
 * Centralized error handling for all API requests
 */

import { HTTP_STATUS, ERROR_MESSAGES } from './apiConfig';

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  isAuthError() {
    return this.status === HTTP_STATUS.UNAUTHORIZED;
  }

  isForbiddenError() {
    return this.status === HTTP_STATUS.FORBIDDEN;
  }

  isServerError() {
    return this.status >= 500;
  }

  isClientError() {
    return this.status >= 400 && this.status < 500;
  }

  isNetworkError() {
    return !this.status;
  }
}

/**
 * Parse API error response and return user-friendly message
 */
export async function parseErrorResponse(response) {
  try {
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return {
        message: data.message || data.title || ERROR_MESSAGES[response.status] || ERROR_MESSAGES.UNKNOWN,
        data: data
      };
    } else {
      const text = await response.text();
      return {
        message: text || ERROR_MESSAGES[response.status] || ERROR_MESSAGES.UNKNOWN,
        data: null
      };
    }
  } catch (e) {
    // Fallback if response parsing fails
    return {
      message: ERROR_MESSAGES[response.status] || ERROR_MESSAGES.UNKNOWN,
      data: null
    };
  }
}

/**
 * Handle network/fetch errors
 */
export function handleNetworkError(error) {
  if (error.name === 'AbortError') {
    return new ApiError(ERROR_MESSAGES.TIMEOUT, null, { type: 'timeout' });
  }
  
  if (error.message.includes('Failed to fetch') || !navigator.onLine) {
    return new ApiError(ERROR_MESSAGES.NETWORK_ERROR, null, { type: 'network' });
  }
  
  return new ApiError(error.message || ERROR_MESSAGES.UNKNOWN, null, { type: 'unknown' });
}

/**
 * Handle HTTP error responses
 */
export async function handleHttpError(response) {
  const errorData = await parseErrorResponse(response);
  return new ApiError(errorData.message, response.status, errorData.data);
}

/**
 * Log API errors for debugging
 */
export function logApiError(error, context = {}) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    name: error.name,
    message: error.message,
    status: error.status,
    context,
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔴 API Error: ${error.message}`);
    console.error(errorLog);
    console.groupEnd();
  }

  // In production, you could send this to a logging service
  // Example: sendToErrorTracking(errorLog);

  return errorLog;
}

/**
 * Determine if error should trigger automatic logout
 */
export function shouldLogoutOnError(error) {
  return error.isAuthError() || (error.status === HTTP_STATUS.FORBIDDEN && isProtectedRoute());
}

function isProtectedRoute() {
  const publicRoutes = ['/login', '/register'];
  return !publicRoutes.includes(window.location.pathname);
}
