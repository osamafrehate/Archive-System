import './CategoryDropdown.css';

export default function CategoryDropdown({ categories, selectedCategory, onCategoryChange }) {
  const handleChange = (e) => {
    onCategoryChange(e.target.value);
  };

  return (
    <div className="dropdown-wrapper">
      <select 
        className="dropdown-select"
        value={selectedCategory}
        onChange={handleChange}
      >
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <span className="dropdown-icon">▼</span>
    </div>
  );
}
