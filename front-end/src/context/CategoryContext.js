import { createContext, useState } from 'react';

export const CategoryContext = createContext();

export function CategoryProvider({ children }) {
  // Global categories state - shared across UploadPage and AdminPanel (Two-way sync)
  const [categories, setCategories] = useState([
    'Official Licenses',
    'General Insurance Policies',
    'Car Insurance Policies',
    'Contracts',
    'Agreements'
  ]);

  // SearchPage categories - only adds from UploadPage, never deletes
  const [searchPageCategories, setSearchPageCategories] = useState([
    'Official Licenses',
    'General Insurance Policies',
    'Car Insurance Policies',
    'Contracts',
    'Agreements'
  ]);

  // Function to add a new category (used by UploadPage)
  const addCategory = (categoryName) => {
    const trimmed = categoryName.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
      // Also add to SearchPage (one-way sync: additions only)
      syncWithSearchPage(trimmed);
    }
  };

  // Function to delete a category (used by UploadPage)
  const deleteCategory = (categoryName) => {
    setCategories(categories.filter(cat => cat !== categoryName));
    // Note: NOT deleting from searchPageCategories (one-way sync)
  };

  // Function to sync with SearchPage (adds new categories without deleting)
  const syncWithSearchPage = (categoryName) => {
    if (categoryName && !searchPageCategories.includes(categoryName)) {
      setSearchPageCategories([...searchPageCategories, categoryName]);
    }
  };

  const value = {
    categories,
    setCategories,
    addCategory,
    deleteCategory,
    searchPageCategories,
    syncWithSearchPage
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}
