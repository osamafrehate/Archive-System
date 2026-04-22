import { useState, useContext, useEffect, useCallback, useRef } from 'react';
import { CategoryContext } from '../context/CategoryContext';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/apiService';
import './AdminPanelPage.css';

const DEBOUNCE_DELAY = 300;

export default function AdminPanelPage() {
  const { categories } = useContext(CategoryContext);
  const { token } = useAuth();

  // User search states
  const [searchInput, setSearchInput] = useState('');
  const [searchUsers, setSearchUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Category permissions states
  const [activeCategories, setActiveCategories] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [tempPermissions, setTempPermissions] = useState({});

  // Categories management
  const [allCategories, setAllCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Permissions management
  const [permissions, setPermissions] = useState([]);
  const [localPermissions, setLocalPermissions] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [newPermissionName, setNewPermissionName] = useState('');
  const [editingPermission, setEditingPermission] = useState(null);
  const [editPermissionName, setEditPermissionName] = useState('');
  const [savingPermission, setSavingPermission] = useState(null); // Optimistic loading

  const timeoutRef = useRef(null);

  // Debounced user search
  const debouncedSearch = useCallback((keyword) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      if (keyword.length > 0) {
        setLoadingUsers(true);
        try {
          const results = await apiService.searchUsers(keyword, token);
          setSearchUsers(results);
        } catch (error) {
          console.error('Search error:', error);
          setSearchUsers([]);
        } finally {
          setLoadingUsers(false);
        }
      } else {
        setSearchUsers([]);
      }
    }, DEBOUNCE_DELAY);
  }, [token]);

  useEffect(() => {
    debouncedSearch(searchInput);
  }, [searchInput, debouncedSearch]);

  // Fetch active categories
  useEffect(() => {
    if (!token) return;
    const fetchActive = async () => {
      try {
        const data = await apiService.getActiveCategories(token);
        setActiveCategories(data);
      } catch (error) {
        console.error('Failed to fetch active categories:', error);
      }
    };
    fetchActive();
  }, [token]);

  // Fetch all categories
  const fetchAllCategories = useCallback(async () => {
    if (!token) return;
    setLoadingCategories(true);
    try {
      const data = await apiService.getAllCategories(token);
      setAllCategories(data);
    } catch (error) {
      console.error('Failed to fetch all categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

  // Fetch permissions
  const fetchPermissions = useCallback(async () => {
    if (!token) return;
    setLoadingPermissions(true);
    try {
      const data = await apiService.getPermissions(token);
      setPermissions(data);
      setLocalPermissions(data); // Sync local
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      setPermissions([]);
      setLocalPermissions([]);
    } finally {
      setLoadingPermissions(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // Activate category
  const handleActivateCategory = async (name) => {
    try {
      await apiService.activateCategoryByName(name, token);
      fetchAllCategories();
    } catch (error) {
      console.error('Activate failed:', error);
    }
  };

  // Select user
  const handleSelectUser = (id, username) => {
    setSelectedUserId(id);
    setSelectedUserName(username);
    setSearchInput(username);
    setIsDropdownOpen(false);
    setTempPermissions({});
  };

  const handleClearUser = () => {
    setSelectedUserId(null);
    setSelectedUserName('');
    setSearchInput('');
    setTempPermissions({});
    setSearchUsers([]);
    setIsDropdownOpen(false);
  };

  // Toggle category enabled
  const handleToggleCategoryEnabled = (categoryName) => {
    setTempPermissions(prev => {
      const current = prev[categoryName] || { 
        enabled: false 
      };
      const permDefaults = permissions.reduce((acc, perm) => {
        acc[perm.name.toLowerCase()] = false;
        return acc;
      }, {});
      
      return {
        ...prev,
        [categoryName]: {
          ...current,
          ...permDefaults,
          enabled: !current.enabled
        }
      };
    });
  };

  // Toggle permission type
  const handleTogglePermissionType = (categoryName, permissionKey) => {
    setTempPermissions(prev => ({
      ...prev,
      [categoryName]: {
        ...prev[categoryName],
        [permissionKey]: !prev[categoryName]?.[permissionKey]
      }
    }));
  };

  // Save permissions - Dynamic format
  const handleSavePermissions = async () => {
    if (!selectedUserId) {
      alert('Please select a user first.');
      return;
    }
    const permissionsData = Object.entries(tempPermissions)
      .filter(([, perms]) => perms.enabled)
      .map(([categoryName, perms]) => {
        const permissionList = [];
        permissions.forEach(perm => {
          const permKey = perm.name.toLowerCase();
          if (perms[permKey]) {
            permissionList.push(perm.name);
          }
        });
        const catId = activeCategories.find(cat => cat.name === categoryName)?.id;
        if (catId && catId > 0 && permissionList.length > 0) {
          return {
            categoryId: catId,
            isSelected: true,
            permissions: permissionList
          };
        }
        return null;
      }).filter(Boolean);
    
    if (permissionsData.length === 0) {
      alert('No valid categories with permissions selected.');
      return;
    }
    
    const data = {
      userId: selectedUserId,
      categories: permissionsData
    };
    console.log('Sending assign payload:', data); // Debug
    try {
      await apiService.assignUserCategoryPermission(data, token);
      alert('Permissions assigned successfully!');
      handleClearUser();
    } catch (error) {
      console.error('Assign error:', error);
      alert(`Failed to assign permissions: ${error.message}`);
    }
  };

  // Permissions CRUD
  const handleCreatePermission = async () => {
    if (!newPermissionName.trim()) return;
    
    const newPermName = newPermissionName.trim();
    
    try {
      const created = await apiService.createPermission(newPermName, token);
      // Add optimistically
      setLocalPermissions(prev => [...prev, created]);
      setPermissions(prev => [...prev, created]);
      setNewPermissionName('');
    } catch (error) {
      console.error('Create failed:', error);
      alert('Failed to create permission: ' + (error.message || 'Server error'));
    }
  };

  const handleEditPermission = (permission) => {
    setEditingPermission(permission);
    setEditPermissionName(permission.name);
  };

  const handleUpdatePermission = async () => {
    if (!editingPermission || !editPermissionName.trim()) return;
    
    setSavingPermission(editingPermission.id);
    try {
      const updated = await apiService.updatePermission(editingPermission.id, editPermissionName.trim(), token);
      // Update local state
      setLocalPermissions(prev => prev.map(p => p.id === updated.id ? updated : p));
      setPermissions(prev => prev.map(p => p.id === updated.id ? updated : p));
      setEditingPermission(null);
      setEditPermissionName('');
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update permission: ' + (error.message || 'Server error'));
    } finally {
      setSavingPermission(null);
    }
  };

  const handleCancelEditPermission = () => {
    setEditingPermission(null);
    setEditPermissionName('');
  };

  const handleDeletePermission = async (id) => {
    if (!window.confirm('Are you sure you want to delete this permission?')) return;
    
    // Optimistic delete IMMEDIATE
    const updatedLocal = localPermissions.filter(p => p.id !== id);
    const updatedPerms = permissions.filter(p => p.id !== id);
    setLocalPermissions(updatedLocal);
    setPermissions(updatedPerms);
    
// Skip API call - back-end may require cleanup first or optimistic only
    console.log('Skipped DELETE API for ID:', id);
  };

  const isTableDisabled = selectedUserId === null;

  return (
    <div className="admin-panel-page">
      <div className="admin-panel-content">
        <h1>Admin Panel</h1>

        {/* User Search */}
        <div className="employee-selection-section">
          <label className="dropdown-label">Select User</label>
          <div className="dropdown-container">
            <div className={`dropdown-input ${isDropdownOpen ? 'open' : ''}`} onClick={() => setIsDropdownOpen(true)}>
              <input
                className="search-input"
                placeholder="Search user..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <span className="dropdown-arrow">▼</span>
            </div>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                {loadingUsers ? (
                  <div className="dropdown-item disabled">Searching...</div>
                ) : searchUsers.length > 0 ? (
                  searchUsers.map((user) => (
                    <div key={user.id} className="dropdown-item" onClick={() => handleSelectUser(user.id, user.username)}>
                      <div className="dropdown-item-name">{user.username}</div>
                    </div>
                  ))
                ) : (
                  <div className="dropdown-item disabled">
                    {searchInput ? 'No users found' : 'Type to search...'}
                  </div>
                )}
              </div>
            )}
          </div>
          {selectedUserName && (
            <div className="selected-employee-info">
              <span>Selected: {selectedUserName}</span>
              <button className="clear-button" onClick={handleClearUser}>
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Category Permissions Table - FIXED API data format */}
        <div className={`permissions-table-section ${isTableDisabled ? 'disabled' : ''}`}>
          <h3>Category Permissions</h3>
          <div className="table-wrapper">
            <table className="permissions-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  {permissions.map(perm => (
                    <th key={perm.id}>{perm.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeCategories.map((cat) => {
                  const data = tempPermissions[cat.name] || { enabled: false, read: false, write: false, editCategories: false };
                  return (
                    <tr key={cat.name} className={`permission-row ${data.enabled ? 'enabled' : 'disabled'}`}>
                      <td className="category-name-cell">
                        <input
                          type="checkbox"
                          checked={data.enabled}
                          onChange={() => handleToggleCategoryEnabled(cat.name)}
                          disabled={isTableDisabled}
                          className="category-toggle-checkbox"
                        />
                        <span>{cat.name}</span>
                      </td>
                      {permissions.map(perm => {
                        const permKey = perm.name.toLowerCase();
                        return (
                          <td key={perm.id}>
                            <input
                              type="checkbox"
                              checked={data[permKey]}
                              onChange={() => handleTogglePermissionType(cat.name, permKey)}
                              disabled={isTableDisabled || !data.enabled}
                              className="permission-checkbox"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="table-actions">
            <button className="save-button" onClick={handleSavePermissions} disabled={isTableDisabled}>
              Assign Permissions
            </button>
          </div>
        </div>

        {/* All Categories */}
        <div className="categories-management-section">
          <h3>All Categories</h3>
          {loadingCategories ? (
            <div>Loading categories...</div>
          ) : (
            <div className="table-wrapper">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allCategories.map((cat) => (
                    <tr key={cat.id}>
                      <td>{cat.name}</td>
                      <td>
                        <span className={`status-badge ${cat.isActive ? 'active' : 'inactive'}`}>
                          {cat.isActive ? 'Active' : 'Not Active'}
                        </span>
                      </td>
                      <td>
                        {!cat.isActive && (
                          <button className="activate-btn" onClick={() => handleActivateCategory(cat.name)}>
                            Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Permissions Management */}
        <div className="permissions-management-section">
          <h3>Permissions Management</h3>
          <div className="create-form">
            <input
              className="form-input"
              placeholder="New permission name"
              value={newPermissionName}
              onChange={(e) => setNewPermissionName(e.target.value)}
            />
            <button className="create-btn" onClick={handleCreatePermission}>
              Create
            </button>
          </div>
          <div className="table-wrapper">
            <table className="permissions-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingPermissions ? (
                  <tr>
                    <td colSpan="2">Loading...</td>
                  </tr>
                ) : localPermissions.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {editingPermission?.id === p.id ? (
                        <div className="edit-row">
                          <input
                            value={editPermissionName}
                            onChange={(e) => setEditPermissionName(e.target.value)}
                            autoFocus
                          />
                          <div className="edit-buttons">
                            <button className="save-btn" onClick={handleUpdatePermission} disabled={!!savingPermission}>
                              {savingPermission === p.id ? 'Saving...' : 'Save'}
                            </button>
                            <button className="cancel-btn" onClick={handleCancelEditPermission}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        p.name
                      )}
                    </td>
                    <td>
                      {editingPermission?.id === p.id ? null : (
                        <>
                          <button className="edit-btn" onClick={() => handleEditPermission(p)}>
                            Edit
                          </button>
                          {/* <button className="delete-btn" onClick={() => handleDeletePermission(p.id)}>
                            Delete
                          </button> */}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

