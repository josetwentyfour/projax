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
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'workspaces'>('projects');
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [gitBranches, setGitBranches] = useState<Map<number, string | null>>(new Map());
  const menuRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

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
            setCurrentProjectId(message.currentProject.id);
            // Notify extension to select and show details for current project
            vscode.postMessage({ 
              command: 'selectCurrentProject',
              projectId: message.currentProject.id 
            });
          }
          break;
        case 'updateCurrentProject':
          if (message.project) {
            setCurrentProjectPath(message.project.path);
            setCurrentProjectId(message.project.id);
            // Notify extension to select and show details for current project
            vscode.postMessage({ 
              command: 'selectCurrentProject',
              projectId: message.project.id 
            });
          } else {
            setCurrentProjectPath(null);
            setCurrentProjectId(null);
          }
          break;
        case 'updateSelectedProject':
          setSelectedProjectId(message.project?.id || null);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    vscode.postMessage({ command: 'refreshProjects' });

    // Poll for git branches and workspaces
    const updateGitBranches = async () => {
      try {
        const branches = new Map<number, string | null>();
        for (const project of projects) {
          try {
            const response = await fetch(`http://localhost:3001/api/projects/${project.id}/git-branch`);
            if (response.ok) {
              const data = await response.json();
              branches.set(project.id, data.branch);
            }
          } catch {
            branches.set(project.id, null);
          }
        }
        setGitBranches(branches);
      } catch (error) {
        console.error('Error updating git branches:', error);
      }
    };

    const loadWorkspaces = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/workspaces');
        if (response.ok) {
          const ws = await response.json();
          setWorkspaces(ws);
        }
      } catch (error) {
        console.error('Error loading workspaces:', error);
      }
    };

    if (projects.length > 0) {
      updateGitBranches();
    }
    loadWorkspaces();

    // Poll every 5 seconds
    const interval = setInterval(() => {
      if (projects.length > 0) {
        updateGitBranches();
      }
      loadWorkspaces();
    }, 5000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(interval);
    };
  }, [vscode, projects]);

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

  // Auto-scroll to current project after filtering/sorting - bring it to the top
  useEffect(() => {
    if (currentProjectId && listRef.current) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        const projectElement = listRef.current?.querySelector(`[data-project-id="${currentProjectId}"]`);
        if (projectElement) {
          // Scroll to bring current project as high as possible
          projectElement.scrollIntoView({ block: 'start', behavior: 'smooth' });
        }
      }, 100);
    }
  }, [currentProjectId, filteredAndSortedProjects]);

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
      <div className="tab-bar">
        <button
          className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          Projects
        </button>
        <button
          className={`tab-button ${activeTab === 'workspaces' ? 'active' : ''}`}
          onClick={() => setActiveTab('workspaces')}
        >
          Workspaces
        </button>
      </div>
      
      {activeTab === 'projects' ? (
        <>
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

      <div className="project-list" ref={listRef}>
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
              currentProjectPath.startsWith(project.path + '/')
            );
            const isSelected = selectedProjectId === project.id;

            return (
              <div
                key={project.id}
                data-project-id={project.id}
                className={`project-item ${isCurrent ? 'current' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => handleProjectClick(project)}
              >
                <div className="project-item-header">
                  <h3 className="project-name">
                    {isCurrent && <span className="current-indicator">●</span>}
                    {project.name}
                    {gitBranches.has(project.id) && gitBranches.get(project.id) && (
                      <span className="git-branch-badge">{gitBranches.get(project.id)}</span>
                    )}
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
      </>
      ) : (
        <div className="project-list">
          {workspaces.length === 0 ? (
            <div className="project-list-empty">
              <p>No workspaces yet</p>
            </div>
          ) : (
            workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="project-item"
                onClick={() => {
                  vscode.postMessage({
                    command: 'openWorkspace',
                    workspace,
                  });
                }}
              >
                <div className="project-item-header">
                  <h3 className="project-name">{workspace.name}</h3>
                </div>
                <p className="project-path">{workspace.workspace_file_path}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectListView;

