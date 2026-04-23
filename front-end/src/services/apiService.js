export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:7238/api';

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
    const tokenValue = data.Token || data.token;
    if (!tokenValue) {
      console.error('Token missing from response. Full response:', data);
      throw new Error(`No token in response. Got: ${JSON.stringify(data)}`);
    }
    return { Token: tokenValue };
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

  getUserCategories: async (token) => {
    if (!token) throw new Error('No auth token');
    const response = await fetch(`${API_BASE_URL}/categories/UserCategories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
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
    const response = await fetch(`${API_BASE_URL}/categories/UserCategoriesEditPermission`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
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
    const response = await fetch(`${API_BASE_URL}/categories/active`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
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
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`); 
    }
    return response.json();
  },

  searchUsers: async (keyword, token) => {
    if (!token) throw new Error('No auth token');
    const response = await fetch(`${API_BASE_URL}/users/search?keyword=${encodeURIComponent(keyword)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  },

  activateCategoryByName: async (name, token) => {
    if (!token) throw new Error('No auth token');
    const response = await fetch(`${API_BASE_URL}/categories/activate-by-name?name=${encodeURIComponent(name)}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
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
    const response = await fetch(`${API_BASE_URL}/permissions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
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
    const response = await fetch(`${API_BASE_URL}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
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
    // Back-end may return empty 200, no JSON
    if (response.headers.get('content-length') === '0' || response.status === 204) {
      return { id: Date.now(), name }; // Optimistic fallback
    }
    return response.json();
  },

  updatePermission: async (id, name, token) => {
    if (!token) throw new Error('No auth token');
    const response = await fetch(`${API_BASE_URL}/permissions/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
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
    // Back-end may return empty 200
    if (response.headers.get('content-length') === '0' || response.status === 204) {
      return { id, name }; // Return updated object
    }
    return response.json();
  },

  deletePermission: async (id, token) => {
    if (!token) throw new Error('No auth token');
    const response = await fetch(`${API_BASE_URL}/permissions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
      } catch {
        throw new Error(`HTTP ${response.status}`);
      }
    }
    // DELETE typically returns 204 No Content - no JSON needed
    return { success: true };
  },

  assignUserCategoryPermission: async (data, token) => {
    if (!token) throw new Error('No auth token');
    const response = await fetch(`${API_BASE_URL}/admin/assign-permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
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
    // May return plain text "Permissions updated successfully"
    const text = await response.text();
    return { success: true, message: text };
  },

  getUserCategoryPermissions: async (userId, token) => {
    if (!token) throw new Error('No auth token');
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/category-permissions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  },

  getFiles: async (page = 1, token) => {
    if (!token) throw new Error('No auth token');
    const response = await fetch(`${API_BASE_URL}/files?page=${page}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
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
    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
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
    const response = await fetch(`${API_BASE_URL}/files/preview/${fileId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch preview: HTTP ${response.status}`);
    }
    return response;
  },

  downloadFile: async (fileId, token) => {
    if (!token) throw new Error('No auth token');
    const response = await fetch(`${API_BASE_URL}/files/download/${fileId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to download file: HTTP ${response.status}`);
    }
    return response;
  },

  renameFile: async (fileId, newName, token) => {
    if (!token) throw new Error('No auth token');
    if (!newName?.trim()) throw new Error('File name cannot be empty');
    const response = await fetch(`${API_BASE_URL}/files/${fileId}/rename`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fileName: newName.trim() })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  }
};

