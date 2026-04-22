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
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [newPermissionName, setNewPermissionName] = useState('');
  const [editingPermission, setEditingPermission] = useState(null);
  const [editPermissionName, setEditPermissionName] = useState('');

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
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
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
      const current = prev[categoryName] || { enabled: false, read: false, write: false, editCategories: false };
      return {
        ...prev,
        [categoryName]: {
          ...current,
          enabled: !current.enabled
        }
      };
    });
  };

  // Toggle permission type
  const handleTogglePermissionType = (categoryName, permissionType) => {
    setTempPermissions(prev => ({
      ...prev,
      [categoryName]: {
        ...prev[categoryName],
        [permissionType]: !prev[categoryName]?.[permissionType]
      }
    }));
  };

  // Save permissions - FIXED format for AssignUserPermissionsDto
  const handleSavePermissions = async () => {
    if (!selectedUserId) {
      alert('Please select a user first.');
      return;
    }
    const permissionsData = Object.entries(tempPermissions)
      .filter(([, perms]) => perms.enabled)
      .map(([categoryName, perms]) => {
        const permissionList = [];
        if (perms.read) permissionList.push('Read');
        if (perms.write) permissionList.push('Write');
        if (perms.editCategories) permissionList.push('EditCategories');
        return {
          categoryId: activeCategories.find(cat => cat.name === categoryName)?.id || 0,
          isSelected: true,
          permissions: permissionList
        };
      });
    const data = {
      userId: selectedUserId,
      categories: permissionsData
    };
    try {
      await apiService.assignUserCategoryPermission(data, token);
      alert('Permissions assigned successfully!');
      handleClearUser();
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to assign permissions: ${error.message}`);
    }
  };

  // Permissions CRUD
  const handleCreatePermission = async () => {
    if (!newPermissionName.trim()) return;
    try {
      await apiService.createPermission(newPermissionName.trim(), token);
      setNewPermissionName('');
      fetchPermissions();
    } catch (error) {
      console.error('Create failed:', error);
    }
  };

  const handleEditPermission = (permission) => {
    setEditingPermission(permission);
    setEditPermissionName(permission.name);
  };

  const handleUpdatePermission = async () => {
    if (!editingPermission || !editPermissionName.trim()) return;
    try {
      await apiService.updatePermission(editingPermission.id, editPermissionName.trim(), token);
      setEditingPermission(null);
      setEditPermissionName('');
      fetchPermissions();
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleCancelEditPermission = () => {
    setEditingPermission(null);
    setEditPermissionName('');
  };

  const handleDeletePermission = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await apiService.deletePermission(id, token);
      fetchPermissions();
    } catch (error) {
      console.error('Delete failed:', error);
    }
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
                  <th>Read</th>
                  <th>Write</th>
                  <th>Edit Categories</th>
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
                      <td>
                        <input
                          type="checkbox"
                          checked={data.read}
                          onChange={() => handleTogglePermissionType(cat.name, 'read')}
                          disabled={isTableDisabled || !data.enabled}
                          className="permission-checkbox"
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={data.write}
                          onChange={() => handleTogglePermissionType(cat.name, 'write')}
                          disabled={isTableDisabled || !data.enabled}
                          className="permission-checkbox"
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={data.editCategories}
                          onChange={() => handleTogglePermissionType(cat.name, 'editCategories')}
                          disabled={isTableDisabled || !data.enabled}
                          className="permission-checkbox"
                        />
                      </td>
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
                ) : permissions.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {editingPermission?.id === p.id ? (
                        <div className="edit-row">
                          <input
                            value={editPermissionName}
                            onChange={(e) => setEditPermissionName(e.target.value)}
                            onBlur={handleUpdatePermission}
                            autoFocus
                          />
                          <button onClick={handleCancelEditPermission}>Cancel</button>
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
                          <button className="delete-btn" onClick={() => handleDeletePermission(p.id)}>
                            Delete
                          </button>
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

