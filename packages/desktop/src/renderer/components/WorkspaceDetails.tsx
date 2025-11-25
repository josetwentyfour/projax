import React, { useState, useEffect } from 'react';
import { ElectronAPI } from '../../main/preload';
import './WorkspaceDetails.css';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

type Workspace = any;
type Project = any;

interface WorkspaceDetailsProps {
  workspace: Workspace | null;
  onWorkspaceUpdate?: (workspace: Workspace) => void;
  onRemoveWorkspace?: (workspaceId: number) => void;
  onOpenWorkspace?: (workspace: Workspace) => void;
  onSelectProject?: (project: Project) => void;
}

const WorkspaceDetails: React.FC<WorkspaceDetailsProps> = ({
  workspace,
  onWorkspaceUpdate,
  onRemoveWorkspace,
  onOpenWorkspace,
  onSelectProject,
}) => {
  const [editingName, setEditingName] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [editingDescription, setEditingDescription] = useState(false);
  const [workspaceDescription, setWorkspaceDescription] = useState('');
  const [editingTags, setEditingTags] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [allTags, setAllTags] = useState<string[]>([]);
  const [workspaceTags, setWorkspaceTags] = useState<string[]>([]);
  const [workspaceProjects, setWorkspaceProjects] = useState<any[]>([]);
  const [projectsData, setProjectsData] = useState<Array<{ tracked: boolean; project?: Project; path: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [addingProject, setAddingProject] = useState<string | null>(null);
  const [removingProject, setRemovingProject] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showLinkProjectDropdown, setShowLinkProjectDropdown] = useState(false);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [showRemoveProjectModal, setShowRemoveProjectModal] = useState(false);
  const [projectToRemove, setProjectToRemove] = useState<string | null>(null);
  const [removeConfirmText, setRemoveConfirmText] = useState('');
  const [removeConfirmationCode, setRemoveConfirmationCode] = useState('');
  const [displaySettings, setDisplaySettings] = useState({
    showProjectList: true,
    showDescription: true,
    showPath: true,
  });

  useEffect(() => {
    if (workspace) {
      setWorkspaceName(workspace.name);
      setWorkspaceDescription(workspace.description || '');
      setWorkspaceTags(workspace.tags || []);
      setEditingName(false);
      setEditingDescription(false);
      loadWorkspaceProjects();
      loadAllTags();
      loadDisplaySettings();
      loadAvailableProjects();
    }
  }, [workspace?.id]); // Only re-run when workspace ID changes

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showLinkProjectDropdown && !target.closest('.link-project-dropdown-wrapper')) {
        setShowLinkProjectDropdown(false);
      }
    };

    if (showLinkProjectDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLinkProjectDropdown]);

  const loadDisplaySettings = async () => {
    try {
      const settings = await window.electronAPI.getSettings();
      if (settings.display?.workspaceDetails) {
        setDisplaySettings(settings.display.workspaceDetails);
      }
    } catch (error) {
      console.error('Error loading display settings:', error);
    }
  };

  const loadAllTags = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/projects/tags');
      if (response.ok) {
        const tags = await response.json();
        setAllTags(Array.isArray(tags) ? tags : []);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const loadAvailableProjects = async () => {
    try {
      setLoadingProjects(true);
      const apiBaseUrl = await getApiBaseUrl();
      if (!apiBaseUrl) {
        setAvailableProjects([]);
        return;
      }
      const response = await fetch(`${apiBaseUrl}/projects`);
      if (response.ok) {
        const projects = await response.json();
        setAvailableProjects(Array.isArray(projects) ? projects : []);
      }
    } catch (error) {
      console.error('Error loading available projects:', error);
      setAvailableProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const loadWorkspaceProjects = async () => {
    if (!workspace) return;
    try {
      setLoading(true);
      // Try common API ports
      const ports = [38124, 38125, 38126, 38127, 38128, 3001];
      let apiBaseUrl = '';
      
      for (const port of ports) {
        try {
          const response = await fetch(`http://localhost:${port}/health`, { signal: AbortSignal.timeout(500) });
          if (response.ok) {
            apiBaseUrl = `http://localhost:${port}/api`;
            break;
          }
        } catch {
          continue;
        }
      }
      
      if (!apiBaseUrl) {
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${apiBaseUrl}/workspaces/${workspace.id}/projects`);
      if (response.ok) {
        const projects = await response.json();
        setWorkspaceProjects(projects);
        
        // Load full project data from PROJAX and match with workspace projects
        const allProjects = await window.electronAPI.getProjects();
        const enrichedProjects = projects.map((wp: any) => {
          const matchedProject = allProjects.find((p: Project) => p.path === wp.project_path);
          return {
            tracked: !!matchedProject,
            project: matchedProject,
            path: wp.project_path,
          };
        });
        
        setProjectsData(enrichedProjects);
      }
    } catch (error) {
      console.error('Error loading workspace projects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!workspace) {
    return (
      <div className="workspace-details-empty">
        <p>Select a workspace to view details</p>
      </div>
    );
  }

  const getApiBaseUrl = async (): Promise<string | null> => {
    const ports = [38124, 38125, 38126, 38127, 38128, 3001];
    for (const port of ports) {
      try {
        const response = await fetch(`http://localhost:${port}/health`, { signal: AbortSignal.timeout(500) });
        if (response.ok) {
          return `http://localhost:${port}/api`;
        }
      } catch {
        continue;
      }
    }
    return null;
  };

  const handleSaveName = async () => {
    try {
      const apiBaseUrl = await getApiBaseUrl();
      if (!apiBaseUrl) return;
      const response = await fetch(`${apiBaseUrl}/workspaces/${workspace.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: workspaceName }),
      });
      if (response.ok) {
        const updated = await response.json();
        if (onWorkspaceUpdate) onWorkspaceUpdate(updated);
        setEditingName(false);
      }
    } catch (error) {
      console.error('Error updating workspace name:', error);
    }
  };

  const handleSaveDescription = async () => {
    try {
      const apiBaseUrl = await getApiBaseUrl();
      if (!apiBaseUrl) return;
      const response = await fetch(`${apiBaseUrl}/workspaces/${workspace.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: workspaceDescription }),
      });
      if (response.ok) {
        const updated = await response.json();
        if (onWorkspaceUpdate) onWorkspaceUpdate(updated);
        setEditingDescription(false);
      }
    } catch (error) {
      console.error('Error updating workspace description:', error);
    }
  };

  const generateRandomString = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const [confirmationCode] = useState(generateRandomString());

  const handleDeleteWorkspace = () => {
    if (!workspace) return;
    if (deleteConfirmText === confirmationCode) {
      if (onRemoveWorkspace) {
        onRemoveWorkspace(workspace.id);
      }
      setShowDeleteModal(false);
      setDeleteConfirmText('');
    }
  };

  const handleOpenWorkspace = async () => {
    if (onOpenWorkspace) {
      onOpenWorkspace(workspace);
    }
    // Update last_opened timestamp
    if (workspace) {
      try {
        const apiBaseUrl = await getApiBaseUrl();
        if (apiBaseUrl) {
          const response = await fetch(`${apiBaseUrl}/workspaces/${workspace.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ last_opened: Math.floor(Date.now() / 1000) }),
          });
          if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            console.error('Error updating workspace last_opened:', error);
          }
        }
      } catch (error) {
        console.error('Error updating workspace last_opened:', error);
        // Don't show error to user, just log it
      }
    }
  };

  const handleAddProjectToProjax = async (projectPath: string) => {
    try {
      setAddingProject(projectPath);
      const addedProject = await window.electronAPI.addProject(projectPath);
      // Reload projects to update the list
      await loadWorkspaceProjects();
    } catch (error) {
      console.error('Error adding project to PROJAX:', error);
      alert(`Failed to add project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setAddingProject(null);
    }
  };

  const handleRemoveProjectFromWorkspace = async (projectPath: string) => {
    if (!workspace) return;
    
    // Show confirmation modal with random string
    const code = generateRandomString();
    setRemoveConfirmationCode(code);
    setProjectToRemove(projectPath);
    setShowRemoveProjectModal(true);
    setRemoveConfirmText('');
  };

  const confirmRemoveProject = async () => {
    if (!workspace || !projectToRemove || removeConfirmText !== removeConfirmationCode) {
      return;
    }

    let apiBaseUrl: string | null = null;
    try {
      setRemovingProject(projectToRemove);
      apiBaseUrl = await getApiBaseUrl();
      if (!apiBaseUrl) {
        alert('API server not available. Please ensure the PROJAX API server is running.');
        return;
      }

      // Use the exact path as stored (no normalization needed - use it as-is)
      // URL encode the project path and send as query parameter
      const encodedPath = encodeURIComponent(projectToRemove);
      
      const response = await fetch(`${apiBaseUrl}/workspaces/${workspace.id}/projects?project_path=${encodedPath}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        let errorMessage = 'Failed to remove project from workspace';
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = `${errorMessage}: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Reload projects and update workspace
      await loadWorkspaceProjects();
      if (onWorkspaceUpdate) {
        const updated = await fetch(`${apiBaseUrl}/workspaces/${workspace.id}`).then(r => r.json());
        onWorkspaceUpdate(updated);
      }
      
      // Close modal
      setShowRemoveProjectModal(false);
      setProjectToRemove(null);
      setRemoveConfirmText('');
      setRemoveConfirmationCode('');
    } catch (error) {
      console.error('Error removing project from workspace:', error);
      console.error('Project path:', projectToRemove);
      console.error('API Base URL:', apiBaseUrl);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('API server not found') || errorMessage.includes('endpoint not found') || errorMessage.includes('Failed to fetch')) {
        alert('API server not available. Please ensure the PROJAX API server is running.');
      } else {
        alert(`Failed to remove project: ${errorMessage}`);
      }
    } finally {
      setRemovingProject(null);
    }
  };

  return (
    <div className="workspace-details">
      <div className="workspace-details-header">
        <div>
          {editingName ? (
            <div className="workspace-name-edit">
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') {
                    setWorkspaceName(workspace.name);
                    setEditingName(false);
                  }
                }}
                autoFocus
                className="workspace-name-input"
                aria-label="Workspace name"
                placeholder="Workspace name"
              />
            </div>
          ) : (
            <h2 className="workspace-name-editable" onClick={() => setEditingName(true)} title="Click to rename">
              {workspace.name} <span className="workspace-id">- workspace (#{workspace.id})</span>
            </h2>
          )}
          {editingDescription ? (
            <div className="workspace-description-edit">
              <textarea
                value={workspaceDescription}
                onChange={(e) => setWorkspaceDescription(e.target.value)}
                onBlur={handleSaveDescription}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSaveDescription();
                  } else if (e.key === 'Escape') {
                    setWorkspaceDescription(workspace.description || '');
                    setEditingDescription(false);
                  }
                }}
                autoFocus
                className="workspace-description-input"
                placeholder="Add a description for this workspace... (⌘+Enter to save, Esc to cancel)"
                aria-label="Workspace description"
              />
            </div>
          ) : (
            <div>
              {displaySettings.showDescription && (
              <p 
                className="workspace-description" 
                onClick={() => setEditingDescription(true)}
                title="Click to edit description"
              >
                {workspace.description || 'Click to add a description...'}
              </p>
              )}
              {displaySettings.showPath && (
              <p 
                className="workspace-path clickable-path" 
                onClick={async () => {
                  try {
                    await window.electronAPI.openFilePath(workspace.workspace_file_path);
                  } catch (error) {
                    console.error('Error opening file path:', error);
                  }
                }}
                title="Click to reveal in file manager"
              >
                {workspace.workspace_file_path}
              </p>
              )}
            </div>
          )}
        </div>
        <div className="header-actions-group">
          <button
            type="button"
            onClick={() => onOpenWorkspace && onOpenWorkspace(workspace)}
            className="btn btn-secondary"
            title="Open workspace in editor"
          >
            Editor
          </button>
        </div>
      </div>

      {displaySettings.showProjectList && (
      <div className="workspace-section">
        <div className="workspace-section-header">
        <h3>Workspace Projects ({projectsData.length})</h3>
          <div className="link-project-dropdown-wrapper">
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={() => {
                setShowLinkProjectDropdown(!showLinkProjectDropdown);
                if (!showLinkProjectDropdown) {
                  loadAvailableProjects();
                  setProjectSearchQuery('');
                }
              }}
            >
              Link Project
            </button>
            {showLinkProjectDropdown && (
              <div className="link-project-dropdown">
                <div className="dropdown-header">Select a project to link</div>
                <div className="dropdown-search-wrapper">
                  <label htmlFor="project-search-input" className="sr-only">Search projects</label>
                  <input
                    id="project-search-input"
                    type="text"
                    className="dropdown-search-input"
                    placeholder="Search projects..."
                    value={projectSearchQuery}
                    onChange={(e) => setProjectSearchQuery(e.target.value)}
                    autoFocus
                    aria-label="Search projects"
                  />
                </div>
                <div className="dropdown-options">
                  {loadingProjects ? (
                    <div className="dropdown-loading">Loading projects...</div>
                  ) : (() => {
                    const filteredProjects = availableProjects
                      .filter(p => !projectsData.some(pd => pd.tracked && pd.project?.id === p.id))
                      .filter(p => {
                        if (!projectSearchQuery.trim()) return true;
                        const query = projectSearchQuery.toLowerCase();
                        return p.name.toLowerCase().includes(query) || 
                               p.path.toLowerCase().includes(query) ||
                               (p.description && p.description.toLowerCase().includes(query));
                      });
                    
                    if (availableProjects.length === 0) {
                      return <div className="dropdown-empty">No projects available</div>;
                    }
                    
                    if (filteredProjects.length === 0) {
                      return <div className="dropdown-empty">No projects match your search</div>;
                    }
                    
                    return filteredProjects.map((project) => (
                        <div
                          key={project.id}
                          className="dropdown-option"
                          onClick={async () => {
                            try {
                              const apiBaseUrl = await getApiBaseUrl();
                              if (!apiBaseUrl || !workspace) return;
                              
                              const response = await fetch(`${apiBaseUrl}/workspaces/${workspace.id}/projects`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ project_path: project.path }),
                              });
                              
                              if (response.ok) {
                                await loadWorkspaceProjects();
                                if (onWorkspaceUpdate) {
                                  const updated = await fetch(`${apiBaseUrl}/workspaces/${workspace.id}`).then(r => r.json());
                                  onWorkspaceUpdate(updated);
                                }
                                setShowLinkProjectDropdown(false);
                              } else {
                                const error = await response.json();
                                alert(error.error || 'Failed to link project to workspace');
                              }
                            } catch (error) {
                              console.error('Error linking project to workspace:', error);
                              alert(`Failed to link project: ${error instanceof Error ? error.message : 'Unknown error'}`);
                            }
                          }}
                        >
                          <div className="dropdown-option-name">{project.name}</div>
                          <div className="dropdown-option-path">{project.path}</div>
                        </div>
                      ));
                  })()}
                </div>
                <div className="dropdown-divider"></div>
                <div
                  className="dropdown-option dropdown-option-browse"
                  onClick={async () => {
                    try {
                      const selectedPath = await window.electronAPI.selectDirectory();
                      if (selectedPath && workspace) {
                        const apiBaseUrl = await getApiBaseUrl();
                        if (!apiBaseUrl) return;
                        
                        const response = await fetch(`${apiBaseUrl}/workspaces/${workspace.id}/projects`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ project_path: selectedPath }),
                        });
                        
                        if (response.ok) {
                          await loadWorkspaceProjects();
                          if (onWorkspaceUpdate) {
                            const updated = await fetch(`${apiBaseUrl}/workspaces/${workspace.id}`).then(r => r.json());
                            onWorkspaceUpdate(updated);
                          }
                          setShowLinkProjectDropdown(false);
                        } else {
                          const error = await response.json();
                          alert(error.error || 'Failed to add project to workspace');
                        }
                      }
                    } catch (error) {
                      console.error('Error adding project to workspace:', error);
                      alert(`Failed to add project: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                  }}
                >
                  <div className="dropdown-option-name">Browse for folder...</div>
                </div>
              </div>
            )}
          </div>
        </div>
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading projects...</p>
          </div>
        ) : projectsData.length === 0 ? (
          <div className="empty-state">
            <p>No projects in this workspace</p>
          </div>
        ) : (
          <div className="workspace-projects-list">
            {projectsData.map((item, index) => {
              const getDisplayPath = (fullPath: string): string => {
                const parts = fullPath.split('/').filter(Boolean);
                if (parts.length === 0) return fullPath;
                const lastDir = parts[parts.length - 1];
                if (lastDir === 'src' && parts.length > 1) {
                  return parts[parts.length - 2];
                }
                return lastDir;
              };

              const displayName = item.tracked && item.project 
                ? item.project.name 
                : item.path.split('/').filter(Boolean).pop() || item.path;

              return (
                <div 
                  key={item.tracked ? item.project!.id : index}
                  className={`workspace-project-tile ${!item.tracked ? 'untracked' : ''}`}
                  onClick={() => item.tracked && item.project && onSelectProject && onSelectProject(item.project)}
                >
                  <div className="project-tile-header">
                    <h3 className="project-tile-name">
                      {!item.tracked && <span className="untracked-badge">Not in PROJAX</span>}
                      {displayName}
                    </h3>
                  </div>
                  <p 
                    className="project-tile-path clickable-path"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const pathToOpen = item.tracked && item.project ? item.project.path : item.path;
                      if (pathToOpen) {
                        window.electronAPI.openInFiles(pathToOpen).catch((error) => {
                          console.error('Error opening path:', error);
                        });
                      }
                    }}
                    onMouseDown={(e) => {
                      // Prevent tile click from firing when clicking path
                      e.stopPropagation();
                    }}
                    title="Click to open in Finder/Explorer"
                  >
                    {item.tracked && item.project 
                      ? (item.project.description || getDisplayPath(item.project.path))
                      : item.path
                    }
                  </p>
                  {item.tracked && item.project && item.project.tags && item.project.tags.length > 0 && (
                    <div className="project-tile-tags">
                      {item.project.tags.map((tag: string) => (
                        <span key={tag} className="project-tile-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="project-tile-actions">
                  {!item.tracked && (
                      <button
                        type="button"
                        className="btn-add-project"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddProjectToProjax(item.path);
                        }}
                        disabled={addingProject === item.path || removingProject === item.path}
                      >
                        {addingProject === item.path ? 'Adding...' : 'Add to PROJAX'}
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-remove-project"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveProjectFromWorkspace(item.path);
                      }}
                      disabled={removingProject === item.path || addingProject === item.path}
                      title="Remove from workspace"
                    >
                      {removingProject === item.path ? 'Removing...' : 'Remove'}
                    </button>
                    </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}

      {onRemoveWorkspace && (
        <div className="danger-zone">
          <h3>Danger Zone</h3>
          <p className="danger-zone-text">Once you delete this workspace, there is no going back. Please be certain.</p>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-danger"
            title="Delete workspace"
          >
            Delete Workspace
          </button>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Workspace</h3>
            <p className="modal-warning">
              This will permanently delete the workspace <strong>"{workspace.name}"</strong> from PROJAX.
              <br /><br />
              The workspace file will <strong>not</strong> be deleted from your filesystem.
            </p>
            <p className="modal-instruction">
              Type <code className="confirmation-code">{confirmationCode}</code> to confirm:
            </p>
            <label htmlFor="delete-confirmation-input" className="sr-only">
              Confirmation code
            </label>
            <input
              id="delete-confirmation-input"
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Enter confirmation code"
              className="confirmation-input"
              autoFocus
              aria-label="Enter confirmation code to delete workspace"
            />
            <div className="modal-actions">
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteWorkspace}
                className="btn btn-danger"
                disabled={deleteConfirmText !== confirmationCode}
              >
                Delete Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {showRemoveProjectModal && (
        <div className="modal-overlay" onClick={() => { 
          setShowRemoveProjectModal(false); 
          setRemoveConfirmText(''); 
          setProjectToRemove(null);
          setRemoveConfirmationCode('');
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Remove Project from Workspace</h3>
            <p className="modal-warning">
              This will remove the project from the workspace <strong>"{workspace?.name}"</strong>.
              <br /><br />
              The project will be removed from the workspace file.
              {projectToRemove && (
                <>
                  <br /><br />
                  <strong>Project:</strong> {projectToRemove}
                </>
              )}
            </p>
            <p className="modal-instruction">
              Type <code className="confirmation-code">{removeConfirmationCode}</code> to confirm:
            </p>
            <label htmlFor="remove-confirmation-input" className="sr-only">
              Confirmation code
            </label>
            <input
              id="remove-confirmation-input"
              type="text"
              value={removeConfirmText}
              onChange={(e) => setRemoveConfirmText(e.target.value)}
              placeholder="Enter confirmation code"
              className="confirmation-input"
              autoFocus
              aria-label="Enter confirmation code to remove project"
            />
            <div className="modal-actions">
              <button
                type="button"
                onClick={() => { 
                  setShowRemoveProjectModal(false); 
                  setRemoveConfirmText(''); 
                  setProjectToRemove(null);
                  setRemoveConfirmationCode('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemoveProject}
                className="btn btn-danger"
                disabled={removeConfirmText !== removeConfirmationCode}
              >
                Remove Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceDetails;

