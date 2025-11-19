import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Project } from '../../types';
import './ProjectListView.css';

interface ProjectListViewProps {
  vscode: any;
}

type SortType = 'name-asc' | 'name-desc' | 'recent' | 'oldest' | 'tests' | 'running';

const ProjectListView: React.FC<ProjectListViewProps> = ({ vscode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortType, setSortType] = useState<SortType>('name-asc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [currentProjectPath, setCurrentProjectPath] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Listen for messages from extension
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      switch (message.command) {
        case 'updateProjects':
          setProjects(message.projects || []);
          setLoading(false);
          if (message.currentProject) {
            setCurrentProjectPath(message.currentProject.path);
          }
          break;
        case 'updateCurrentProject':
          if (message.project) {
            setCurrentProjectPath(message.project.path);
          } else {
            setCurrentProjectPath(null);
          }
          break;
        case 'updateSelectedProject':
          setSelectedProjectId(message.project?.id || null);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    vscode.postMessage({ command: 'refreshProjects' });

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [vscode]);

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

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.path.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    // Sort
    const sorted = [...filtered];
    switch (sortType) {
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'recent':
        sorted.sort((a, b) => (b.last_scanned || 0) - (a.last_scanned || 0));
        break;
      case 'oldest':
        sorted.sort((a, b) => (a.last_scanned || 0) - (b.last_scanned || 0));
        break;
      case 'tests':
        // Would need test counts - simplified for now
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'running':
        // Would need running status - simplified for now
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return sorted;
  }, [projects, searchQuery, sortType]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (newSort: SortType) => {
    setSortType(newSort);
    setShowSortMenu(false);
  };

  const handleProjectClick = (project: Project) => {
    vscode.postMessage({
      command: 'openProject',
      project,
    });
  };

  const handleAddProject = () => {
    vscode.postMessage({
      command: 'addProject',
    });
  };

  const getDisplayPath = (fullPath: string): string => {
    const parts = fullPath.split('/').filter(Boolean);
    if (parts.length === 0) return fullPath;
    const lastDir = parts[parts.length - 1];
    if (lastDir === 'src' && parts.length > 1) {
      return parts[parts.length - 2];
    }
    return lastDir;
  };

  const sortOptions: { value: SortType; label: string }[] = [
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'recent', label: 'Recently Scanned' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'tests', label: 'Most Tests' },
    { value: 'running', label: 'Running First' },
  ];

  if (loading) {
    return (
      <div className="project-list-loading">
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="project-list-container">
      <div className="project-search">
        <div className="search-input-group" ref={menuRef}>
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
            <button
              className="sort-icon-btn"
              onClick={() => setShowSortMenu(!showSortMenu)}
              title="Sort options"
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

      <div className="project-list">
        {filteredAndSortedProjects.length === 0 ? (
          <div className="project-list-empty">
            <p>{searchQuery ? 'No projects match your search' : 'No projects yet'}</p>
            {!searchQuery && (
              <button className="btn-add-project" onClick={handleAddProject}>
                + Add Project
              </button>
            )}
          </div>
        ) : (
          filteredAndSortedProjects.map((project) => {
            const isCurrent = currentProjectPath && (
              project.path === currentProjectPath || 
              project.path.startsWith(currentProjectPath + '/')
            );
            const isSelected = selectedProjectId === project.id;

            return (
              <div
                key={project.id}
                className={`project-item ${isCurrent ? 'current' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => handleProjectClick(project)}
              >
                <div className="project-item-header">
                  <h3 className="project-name">
                    {isCurrent && <span className="current-indicator">●</span>}
                    {project.name}
                  </h3>
                </div>
                <p className="project-path">
                  {project.description || getDisplayPath(project.path)}
                </p>
                {project.tags && project.tags.length > 0 && (
                  <div className="project-tags">
                    {project.tags.map((tag) => (
                      <span key={tag} className="project-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProjectListView;

