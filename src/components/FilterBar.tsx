import React, { useState } from 'react';
import { FilterOptions } from '../types';
import './FilterBar.css';

interface FilterBarProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<FilterOptions>({});

  const handleFilterUpdate = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  return (
    <div className="filter-bar">
      <div className="filter-section">
        <label htmlFor="donor-filter">Donor:</label>
        <select
          id="donor-filter"
          value={filters.donor || ''}
          onChange={(e) => handleFilterUpdate('donor', e.target.value || undefined)}
        >
          <option value="">All Donors</option>
          <option value="john-doe">John Doe</option>
          <option value="jane-smith">Jane Smith</option>
          <option value="education-foundation">Education Foundation</option>
          <option value="tech-for-good">Tech for Good</option>
        </select>
      </div>

      <div className="filter-section">
        <label htmlFor="campaign-filter">Campaign:</label>
        <select
          id="campaign-filter"
          value={filters.campaign || ''}
          onChange={(e) => handleFilterUpdate('campaign', e.target.value || undefined)}
        >
          <option value="">All Campaigns</option>
          <option value="school-lunch-program">School Lunch Program</option>
          <option value="digital-learning-initiative">Digital Learning Initiative</option>
          <option value="scholarship-fund">Scholarship Fund</option>
          <option value="library-books-drive">Library Books Drive</option>
        </select>
      </div>

      <div className="filter-section">
        <label htmlFor="region-filter">Region:</label>
        <select
          id="region-filter"
          value={filters.region || ''}
          onChange={(e) => handleFilterUpdate('region', e.target.value || undefined)}
        >
          <option value="">All Regions</option>
          <option value="North America">North America</option>
          <option value="Europe">Europe</option>
          <option value="Asia">Asia</option>
          <option value="Africa">Africa</option>
          <option value="South America">South America</option>
        </select>
      </div>

      <div className="filter-section">
        <label htmlFor="impact-type-filter">Impact Type:</label>
        <select
          id="impact-type-filter"
          value={filters.impactType || ''}
          onChange={(e) => handleFilterUpdate('impactType', e.target.value || undefined)}
        >
          <option value="">All Types</option>
          <option value="meals_served">Meals Served</option>
          <option value="books_distributed">Books Distributed</option>
          <option value="students_supported">Students Supported</option>
          <option value="scholarships_provided">Scholarships Provided</option>
        </select>
      </div>

      <div className="filter-actions">
        <button onClick={clearFilters} className="clear-filters-btn">
          Clear All Filters
        </button>
      </div>
    </div>
  );
};