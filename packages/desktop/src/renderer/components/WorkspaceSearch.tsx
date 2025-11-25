import React, { useState, useRef, useEffect } from 'react';
import './ProjectSearch.css'; // Reuse the same styles

export type WorkspaceSortType = 'name-asc' | 'name-desc' | 'recent' | 'recently-opened' | 'projects';

interface WorkspaceSearchProps {
  onSearchChange: (query: string) => void;
  onSortChange?: (sortType: WorkspaceSortType) => void;
}

const WorkspaceSearch: React.FC<WorkspaceSearchProps> = ({ onSearchChange, onSortChange }) => {
  const [query, setQuery] = useState('');
  const [sortType, setSortType] = useState<WorkspaceSortType>('name-asc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearchChange(newQuery);
  };

  const handleSortChange = (newSort: WorkspaceSortType) => {
    setSortType(newSort);
    setShowSortMenu(false);
    if (onSortChange) {
      onSortChange(newSort);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
    };

    if (showSortMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSortMenu]);

  const sortOptions: { value: WorkspaceSortType; label: string }[] = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'recent', label: 'Recently Created' },
    { value: 'recently-opened', label: 'Recently Opened' },
    { value: 'projects', label: 'Most Projects' },
  ];

  return (
    <div className="project-search">
      <div className="search-input-group" ref={menuRef}>
        <div className="search-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search workspaces..."
            value={query}
            onChange={handleQueryChange}
            className="search-input"
          />
          <button
            type="button"
            className="sort-icon-btn"
            onClick={() => setShowSortMenu(!showSortMenu)}
            title="Sort options"
            tabIndex={0}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 4h10M3 8h7M3 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        {showSortMenu && (
          <div className="sort-menu">
            {sortOptions.map((option) => (
              <div
                key={option.value}
                className={`sort-menu-item ${sortType === option.value ? 'active' : ''}`}
                onClick={() => handleSortChange(option.value)}
              >
                {option.label}
                {sortType === option.value && <span className="checkmark">✓</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceSearch;

