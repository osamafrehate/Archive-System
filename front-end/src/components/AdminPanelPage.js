import { useState, useContext } from 'react';
import { CategoryContext } from '../context/CategoryContext';
import './AdminPanelPage.css';


// Mock data for employees
// Each employee has categoryPermissions with enabled flag and permission settings
const initialEmployees = [
  {
    id: 1,
    name: 'Ahmad ',
    categoryPermissions: {
      'Official Licenses': { enabled: true, read: true, write: false, editCategories: false },
      'General Insurance Policies': { enabled: true, read: true, write: false, editCategories: false },
      'Car Insurance Policies': { enabled: false, read: false, write: false, editCategories: false },
      'Contracts': { enabled: false, read: false, write: false, editCategories: false },
      'Agreements': { enabled: false, read: false, write: false, editCategories: false }
    }
  },
  {
    id: 2,
    name: 'Mohammad ',
    categoryPermissions: {
      'Official Licenses': { enabled: true, read: true, write: true, editCategories: false },
      'General Insurance Policies': { enabled: true, read: true, write: true, editCategories: false },
      'Car Insurance Policies': { enabled: true, read: true, write: false, editCategories: false },
      'Contracts': { enabled: false, read: false, write: false, editCategories: false },
      'Agreements': { enabled: false, read: false, write: false, editCategories: false }
    }
  },
  {
    id: 3,
    name: 'Salem ',
    categoryPermissions: {
      'Official Licenses': { enabled: true, read: true, write: true, editCategories: true },
      'General Insurance Policies': { enabled: true, read: true, write: true, editCategories: true },
      'Car Insurance Policies': { enabled: true, read: true, write: true, editCategories: true },
      'Contracts': { enabled: true, read: true, write: true, editCategories: true },
      'Agreements': { enabled: true, read: true, write: true, editCategories: true }
    }
  },

];

export default function AdminPanelPage() {
  // Get categories from shared context
  const { categories } = useContext(CategoryContext);

  const [employees, setEmployees] = useState(initialEmployees);

  // State for employee selection and dropdown search
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [tempPermissions, setTempPermissions] = useState({});

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  const applyEmployeePermissions = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      // Build temp permissions from context categories
      // This ensures only current categories are shown
      const permsFromContext = {};
      categories.forEach(cat => {
        permsFromContext[cat] = employee.categoryPermissions[cat] || {
          enabled: false,
          read: false,
          write: false,
          editCategories: false
        };
      });
      setTempPermissions(permsFromContext);
    }
  };

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setSearchInput('');
    setIsDropdownOpen(false);
    applyEmployeePermissions(employeeId);
  };

  const handleClearSelection = () => {
    setSelectedEmployeeId(null);
    setSearchInput('');
    setTempPermissions({});
  };

  const handleAddCategoryToUser = (category) => {
    if (!selectedEmployee || tempPermissions[category]?.enabled) return;

    setTempPermissions(prev => ({
      ...prev,
      [category]: { enabled: true, read: false, write: false, editCategories: false }
    }));
  };

  // Handle removing a category from the user
  const handleRemoveCategoryFromUser = (category) => {
    if (!selectedEmployee) return;

    setTempPermissions(prev => ({
      ...prev,
      [category]: { enabled: false, read: false, write: false, editCategories: false }
    }));
  };

  // Handle toggling category enabled/disabled state
  const handleToggleCategory = (category) => {
    if (!selectedEmployee) return;

    setTempPermissions(prev => {
      const isCurrentlyEnabled = prev[category]?.enabled;

      if (isCurrentlyEnabled) {
        // Disable category and reset its permissions
        return {
          ...prev,
          [category]: { enabled: false, read: false, write: false, editCategories: false }
        };
      } else {
        // Enable category
        return {
          ...prev,
          [category]: { enabled: true, read: false, write: false, editCategories: false }
        };
      }
    });
  };

  const handleTogglePermission = (category, permissionType) => {
    if (!selectedEmployee || !tempPermissions[category]?.enabled) return;

    setTempPermissions(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [permissionType]: !prev[category][permissionType]
      }
    }));
  };

  const handleSavePermissions = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSave = () => {
    if (!selectedEmployee) return;

    setEmployees(prev =>
      prev.map(emp =>
        emp.id === selectedEmployeeId
          ? { ...emp, categoryPermissions: { ...tempPermissions } }
          : emp
      )
    );

    setIsConfirmModalOpen(false);
    handleClearSelection();
  };

  const handleCancelSave = () => {
    setIsConfirmModalOpen(false);
  };

  const getEnabledCategoriesWithPermissions = () => {
    return categories.filter(cat => tempPermissions[cat]?.enabled);
  };

  const isTableDisabled = !selectedEmployee;

  return (
    <div className="admin-panel-page">
     

      <div className="admin-panel-content">
        <h1>Admin Panel</h1>
        

  
        <div className="employee-selection-section">
          <label htmlFor="employee-dropdown" className="dropdown-label">
            Select Employee
          </label>

          <div className="dropdown-container">
            <div
              className={`dropdown-input ${isDropdownOpen ? 'open' : ''}`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <input
                id="employee-dropdown"
                type="text"
                placeholder="Search employee by name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => setIsDropdownOpen(true)}
                className="search-input"
              />
              <span className="dropdown-arrow">▼</span>
            </div>

            {isDropdownOpen && (
              <div className="dropdown-menu">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map(emp => (
                    <div
                      key={emp.id}
                      className={`dropdown-item ${selectedEmployeeId === emp.id ? 'selected' : ''}`}
                      onClick={() => handleSelectEmployee(emp.id)}
                    >
                      <div className="dropdown-item-name">{emp.name}</div>
                    </div>
                  ))
                ) : (
                  <div className="dropdown-item disabled">No employees found</div>
                )}
              </div>
            )}
          </div>

          {selectedEmployee && (
            <div className="selected-employee-info">
              <span>Selected: {selectedEmployee.name}</span>
              <button
                className="clear-button"
                onClick={handleClearSelection}
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>

        {/* Categories Permissions Table */}
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
                {categories.map(category => {
                  const categoryData = tempPermissions[category] || {
                    enabled: false,
                    read: false,
                    write: false,
                    editCategories: false
                  };
                  const isEnabled = categoryData.enabled;

                  return (
                    <tr
                      key={category}
                      className={`permission-row ${isEnabled ? 'enabled' : 'disabled'}`}
                    >
                      <td className="category-name-cell">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => handleToggleCategory(category)}
                          disabled={isTableDisabled}
                          className="category-toggle-checkbox"
                        />
                        <span>{category}</span>
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={categoryData.read}
                          onChange={() => handleTogglePermission(category, 'read')}
                          disabled={isTableDisabled || !isEnabled}
                          className="permission-checkbox"
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={categoryData.write}
                          onChange={() => handleTogglePermission(category, 'write')}
                          disabled={isTableDisabled || !isEnabled}
                          className="permission-checkbox"
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={categoryData.editCategories}
                          onChange={() => handleTogglePermission(category, 'editCategories')}
                          disabled={isTableDisabled || !isEnabled}
                          className="permission-checkbox"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!isTableDisabled && (
            <div className="table-actions">
              <button
                className="save-button"
                onClick={handleSavePermissions}
              >
                Save Permissions
              </button>
            </div>
          )}
        </div>

        {/* Save Confirmation Modal */}
        {isConfirmModalOpen && selectedEmployee && (
          <div className="modal-overlay" onClick={handleCancelSave}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title">Confirm Permission Save</h3>

              <div className="modal-message">
                <p>
                  Are you sure to save the following permissions for <strong>{selectedEmployee.name}</strong>?
                </p>
              </div>

              <div className="modal-permissions-list">
                {getEnabledCategoriesWithPermissions().length > 0 ? (
                  <ul>
                    {getEnabledCategoriesWithPermissions().map(category => {
                      const perms = tempPermissions[category];
                      const permissionsList = [];

                      if (perms.read) permissionsList.push('Read');
                      if (perms.write) permissionsList.push('Write');
                      if (perms.editCategories) permissionsList.push('Edit Categories');

                      return (
                        <li key={category}>
                          <span className="category-label">{category}</span>
                          {permissionsList.length > 0 ? (
                            <ul className="permissions-sublist">
                              {permissionsList.map(perm => (
                                <li key={perm} className="permission-item">
                                  {perm}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="no-perms-text">No permissions</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="no-permissions">No categories assigned</p>
                )}
              </div>

              <div className="modal-actions">
                <button className="ok-button" onClick={handleConfirmSave}>
                  OK
                </button>
                <button className="no-button" onClick={handleCancelSave}>
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
