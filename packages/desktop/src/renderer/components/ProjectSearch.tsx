import React, { useState } from 'react';
import './ProjectSearch.css';

type Project = any;

export type FilterType = 'all' | 'name' | 'path' | 'ports' | 'testCount' | 'running';

interface ProjectSearchProps {
  onSearchChange: (query: string, filterType: FilterType) => void;
}

const ProjectSearch: React.FC<ProjectSearchProps> = ({ onSearchChange }) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearchChange(newQuery, filterType);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilterType = e.target.value as FilterType;
    setFilterType(newFilterType);
    onSearchChange(query, newFilterType);
  };

  return (
    <div className="project-search">
      <div className="search-input-group">
        <input
          type="text"
          placeholder="Search projects..."
          value={query}
          onChange={handleQueryChange}
          className="search-input"
        />
        <select
          value={filterType}
          onChange={handleFilterChange}
          className="search-filter"
        >
          <option value="all">All Fields</option>
          <option value="name">Name</option>
          <option value="path">Path</option>
          <option value="ports">Ports</option>
          <option value="testCount">Test Count</option>
          <option value="running">Running Status</option>
        </select>
      </div>
    </div>
  );
};

export default ProjectSearch;

