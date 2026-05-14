export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5069/api';

const getAccessToken = () => localStorage.getItem('archive_access_token');
const getRefreshToken = () => localStorage.getItem('archive_refresh_token');

async function fetchWithAuth(url, options = {}) {
  const token = getAccessToken();
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 by attempting token refresh once
  if (response.status === 401 && getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry the original request with new token
      const newToken = getAccessToken();
      const retryHeaders = {
        ...options.headers,
        'Authorization': `Bearer ${newToken}`,
      };
      return fetch(url, {
        ...options,
        headers: retryHeaders,
      });
    }
  }

  return response;
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      // Clear tokens and force re-login
      localStorage.removeItem('archive_access_token');
      localStorage.removeItem('archive_refresh_token');
      window.location.href = '/login';
      return false;
    }

    const data = await response.json();
    if (data.accessToken) {
      localStorage.setItem('archive_access_token', data.accessToken);
      return true;
    }
  } catch (e) {
    console.error('Token refresh failed:', e);
  }

  return false;
}

export const apiService = {
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      let errorMessage = 'Login failed';
      try {
        const error = await response.json();
        errorMessage = error.message || error.title || JSON.stringify(error);
      } catch (e) {
        if (response.status === 500) {
          errorMessage = 'Server error (500). Check backend logs.';
        } else if (response.status === 401 || response.status === 400) {
          errorMessage = 'Invalid username or password';
        }
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const accessToken = data.accessToken || data.AccessToken;
    const refreshToken = data.refreshToken || data.RefreshToken;
    
    if (!accessToken || !refreshToken) {
      console.error('Tokens missing from response. Full response:', data);
      throw new Error(`Incomplete auth response. Got: ${JSON.stringify(data)}`);
    }
    
    return { accessToken, refreshToken };
  },

  register: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  },

  logout: async (refreshToken) => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
    } catch (e) {
      console.error('Logout API call failed:', e);
    }
  },

  getUserCategories: async (token) => {
    if (!token) throw new Error('No auth token');
    const response = await fetchWithAuth(`${API_BASE_URL}/categories/UserCategories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`); 
    }
    const data = await response.json();
    return data.map(cat => ({ id: cat.id, name: cat.name })); 
  },

  getUserCategoriesReadPermission: async (token) => {
    if (!token) throw new Error('No auth token');
    const response = await fetchWithAuth(`${API_BASE_URL}/categories/UserCategoriesReadPermission`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`); 
    }
    const data = await response.json();
    return data.map(cat => ({ id: cat.id, name: cat.name })); 
  },

  getUserCategoriesEditPermission: async (token) => {
    if (!token) throw new Error('No auth token');
    const response = await fetchWithAuth(`${API_BASE_URL}/categories/UserCategoriesEditPermission`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.map(cat => ({ id: cat.id, name: cat.name }));
  },

  getUserCategoriesEditFilePermission: async (token) => {
    if (!token) throw new Error('No auth token');
    const response = await fetchWithAuth(`${API_BASE_URL}/categories/UserCategoriesEditFilePermission`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.map(cat => ({ id: cat.id, name: cat.name }));
  },

  getUserCategoriesDeleteFilePermission: async (token) => {
    if (!token) throw new Error('No auth token');
    const response = await fetchWithAuth(`${API_BASE_URL}/categories/UserCategoriesDeleteFilePermission`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.map(cat => ({ id: cat.id, name: cat.name }));
  },

  getActiveCategories: async (token) => {
    if (!token) throw new Error('No auth token');
    const response = await fetchWithAuth(`${API_BASE_URL}/categories/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`); 
    }
    const data = await response.json();
    return data.map(cat => ({ id: cat.id, name: cat.name })); 
  },

  getAllCategories: async (token) => {
    if (!token) throw new Error('No auth token');
    const response = await fetchWithAuth(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`); 
    }
    return response.json();
  },

  createCategory: async (name, token) => {
    if (!token) throw new Error('No auth token');
    if (!name || name.trim() === '') throw new Error('Category name cannot be empty');
    
    const response = await fetchWithAuth(`${API_BASE_URL}/categories?name=${encodeURIComponent(name.trim())}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Parse response regardless of status
    let data = {};
    try {
      data = await response.json();
    } catch {
      // Some responses might not have JSON body
    }
    
    if (!response.ok) {
      const errorMessage = data.error || data.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }
    
    return { success: true, message: data.message || 'Category created successfully' };
  },

  searchUsers: async (keyword, token) => {
    if (!token) throw new Error('No auth token');
    const response = await fetchWithAuth(`${API_BASE_URL}/users/search?keyword=${encodeURIComponent(keyword)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  },

  createUser: async (username, password, token) => {
    if (!token) throw new Error('No auth token');
    if (!username || username.trim() === '') throw new Error('Username cannot be empty');
    if (!password || password.trim() === '') throw new Error('Password cannot be empty');
    
    const response = await fetchWithAuth(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: username.trim(), password })
    });
    
    // Parse response - handle both JSON and plain text
    let data = {};
    const contentType = response.headers.get('content-type');
    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        // Plain text response - just store the message
        data = { message: text };
      }
    } catch {
      // If parsing fails, continue with empty data
    }
    
    if (!response.ok) {
      const errorMessage = data.message || data.error || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }
    
    return { success: true, username: username.trim(), message: data.message || 'User created successfully' };
  },

  activateCategoryByName: async (name, token) => {
    if (!token) throw new Error('No auth token');
    const response = await fetchWithAuth(`${API_BASE_URL}/categories/activate-by-name?name=${encodeURIComponent(name)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  },

  getPermissions: async (token) => {
    if (!token) throw new Error('No auth token');
    const response = await fetchWithAuth(`${API_BASE_URL}/permissions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  },

  createPermission: async (name, token) => {
    if (!token) throw new Error('No auth token');
    const response = await fetchWithAuth(`${API_BASE_URL}/permissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    });
    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
      } catch {
        throw new Error(`HTTP ${response.status} - Server error`);
      }
    }
    if (response.headers.get('content-length') === '0' || response.status === 204) {
      return { id: Date.now(), name };
    }
    return response.json();
  },

  updatePermission: async (id, name, token) => {
    if (!token) throw new Error('No auth token');
    const response = await fetchWithAuth(`${API_BASE_URL}/permissions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    });
    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
      } catch {
        throw new Error(`HTTP ${response.status} - Server error`);
      }
    }
    if (response.headers.get('content-length') === '0' || response.status === 204) {
      return { id, name };
    }
    return response.json();
  },

  deletePermission: async (id, token) => {
    if (!token) throw new Error('No auth token');
    const response = await fetchWithAuth(`${API_BASE_URL}/permissions/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
      } catch {
        throw new Error(`HTTP ${response.status}`);
      }
    }
    return { success: true };
  },

  assignUserCategoryPermission: async (data, token) => {
    if (!token) throw new Error('No auth token');
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/assign-permissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorText = await response.text();
        console.error('Assign error response:', errorText);
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.message || errorText;
        } catch {
          errorMessage = errorText.trim() || errorMessage;
        }
      } catch {
        // Ignore
      }
      throw new Error(errorMessage);
    }
    const text = await response.text();
    return { success: true, message: text };
  },

  getUserCategoryPermissions: async (userId, token) => {
    if (!token) throw new Error('No auth token');
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/users/${userId}/category-permissions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  },

  getFiles: async (page = 1, token, filters = {}) => {
    if (!token) throw new Error('No auth token');
    
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    
    if (filters.categoryId) {
      queryParams.append('categoryId', filters.categoryId);
    }
    if (filters.fileName) {
      queryParams.append('fileName', filters.fileName);
    }
    if (filters.year) {
      queryParams.append('year', filters.year);
    }
    if (filters.status) {
      queryParams.append('status', filters.status);
    }
    
    const response = await fetchWithAuth(`${API_BASE_URL}/files?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  },

  uploadFile: async (formData, token) => {
    if (!token) throw new Error('No token');
    const response = await fetchWithAuth(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  },

  previewFile: async (fileId, token) => {
    if (!token) throw new Error('No auth token');
    const response = await fetchWithAuth(`${API_BASE_URL}/files/preview/${fileId}`, {
      method: 'GET'
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch preview: HTTP ${response.status}`);
    }
    return response;
  },

  downloadFile: async (fileId, token) => {
    if (!token) throw new Error('No auth token');
    const response = await fetchWithAuth(`${API_BASE_URL}/files/download/${fileId}`, {
      method: 'GET'
    });
    if (!response.ok) {
      throw new Error(`Failed to download file: HTTP ${response.status}`);
    }
    return response;
  },

  renameFile: async (fileId, newName, token) => {
    if (!token) throw new Error('No auth token');
    if (!newName?.trim()) throw new Error('File name cannot be empty');
    const response = await fetchWithAuth(`${API_BASE_URL}/files/${fileId}/rename`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fileName: newName.trim() })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  },

  updateFileMetadata: async (fileId, metadata, token) => {
    if (!token) throw new Error('No auth token');
    const response = await fetchWithAuth(`${API_BASE_URL}/files/${fileId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  },

  deleteFile: async (fileId, token) => {
    if (!token) throw new Error('No auth token');
    const response = await fetchWithAuth(`${API_BASE_URL}/files/${fileId}/delete`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  }
};

