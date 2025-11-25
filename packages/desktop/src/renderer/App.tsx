import React, { useState, useEffect, useMemo, useRef } from 'react';
// Note: Renderer runs in browser context, types only
// The actual data comes from IPC
type Project = any;
import { ElectronAPI } from '../main/preload';
import { Rnd } from 'react-rnd';
import ProjectList from './components/ProjectList';
import ProjectDetails from './components/ProjectDetails';
import AddProjectModal from './components/AddProjectModal';
import ProjectSearch, { FilterType, SortType } from './components/ProjectSearch';
import SettingsPanel from './components/SettingsPanel';
import Titlebar from './components/Titlebar';
import StatusBar from './components/StatusBar';
import Terminal from './components/Terminal';
import TabBar from './components/TabBar';
import WorkspaceList from './components/WorkspaceList';
import WorkspaceDetails from './components/WorkspaceDetails';
import AddWorkspaceModal from './components/AddWorkspaceModal';
import WorkspaceSearch, { WorkspaceSortType } from './components/WorkspaceSearch';
import './App.css';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const mainContentRef = useRef<HTMLElement>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('name-asc');
  const [showSettings, setShowSettings] = useState(false);
  const [runningProcesses, setRunningProcesses] = useState<any[]>([]);
  const [keyboardFocusedIndex, setKeyboardFocusedIndex] = useState<number>(-1);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [sidebarWidth, setSidebarWidth] = useState<number>(280);
  const [terminalWidth, setTerminalWidth] = useState<number>(550);
  const [terminalProcess, setTerminalProcess] = useState<{
    pid: number;
    scriptName: string;
    projectName: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'workspaces'>('projects');
  
  // Load default view setting on mount
  useEffect(() => {
    const loadDefaultView = async () => {
      try {
        const settings = await window.electronAPI.getSettings();
        if (settings.appearance?.defaultView) {
          setActiveTab(settings.appearance.defaultView);
        }
      } catch (error) {
        console.error('Error loading default view setting:', error);
      }
    };
    loadDefaultView();
  }, []);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<any | null>(null);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [showAddWorkspaceModal, setShowAddWorkspaceModal] = useState(false);
  const [gitBranches, setGitBranches] = useState<Map<number, string | null>>(new Map());
  const [workspaceProjectCounts, setWorkspaceProjectCounts] = useState<Map<number, number>>(new Map());
  const [workspaceSearchQuery, setWorkspaceSearchQuery] = useState('');
  const [workspaceSortType, setWorkspaceSortType] = useState<WorkspaceSortType>('name-asc');
  const [apiReady, setApiReady] = useState(false);
  const [apiReadyMessage, setApiReadyMessage] = useState('Starting API server...');

  // Check if API server is ready
  const checkApiReady = async (): Promise<boolean> => {
    const ports = [38124, 38125, 38126, 38127, 38128, 3001];
    for (const port of ports) {
      try {
        const response = await fetch(`http://localhost:${port}/health`, { signal: AbortSignal.timeout(500) });
        if (response.ok) {
          return true;
        }
      } catch {
        continue;
      }
    }
    return false;
  };

  // Wait for API server to be ready
  useEffect(() => {
    const waitForApi = async () => {
      setApiReadyMessage('Starting API server...');
      let attempts = 0;
      const maxAttempts = 30; // 15 seconds max (30 * 500ms)
      
      while (attempts < maxAttempts) {
        const ready = await checkApiReady();
        if (ready) {
          setApiReadyMessage('API server ready!');
          setApiReady(true);
          // Small delay to show the "ready" message
          await new Promise(resolve => setTimeout(resolve, 300));
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setApiReadyMessage(`Waiting for API server... (${attempts}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // If we get here, API didn't start in time
      setApiReadyMessage('API server not responding. Some features may not work.');
      setApiReady(true); // Still set to true so app can continue
    };
    
    waitForApi();
  }, []);

  // Clear project selection when switching tabs
  useEffect(() => {
    setSelectedProject(null);
  }, [activeTab]);

  useEffect(() => {
    // Only load data once API is ready
    if (!apiReady) return;
    
    loadProjects();
    loadWorkspaces();
    loadRunningProcesses();
    
    // Refresh running processes and git branches every 5 seconds
    const interval = setInterval(() => {
      loadRunningProcesses();
      updateGitBranches();
    }, 5000);
    
    // Handle menu actions
    const handleMenuAction = (event: any, action: string, ...args: any[]) => {
      switch (action) {
        case 'new-project':
          setShowAddModal(true);
          break;
        case 'new-workspace':
          setShowAddWorkspaceModal(true);
          break;
        case 'open-workspace':
          // This would need a dialog to select workspace
          // For now, just show the workspaces tab
          setActiveTab('workspaces');
          break;
        case 'open-directory-as-project':
          if (args[0]) {
            handleAddProject(args[0]);
          }
          break;
      }
    };

    window.electronAPI.onMenuAction(handleMenuAction);
    
    return () => {
      clearInterval(interval);
      window.electronAPI.removeMenuActionListener(handleMenuAction);
    };
  }, [apiReady]);

  useEffect(() => {
    // Update git branches when projects change
    if (projects.length > 0) {
      // Small delay to ensure API is ready
      const timeoutId = setTimeout(() => {
        updateGitBranches();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  // Scroll to top when project is selected
  useEffect(() => {
    if (selectedProject && mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedProject]);


  const loadProjects = async () => {
    try {
      setLoading(true);
      const projs = await window.electronAPI.getProjects();
      setProjects(projs);
      if (projs.length === 0) {
        console.log('No projects found. Use "Add Project" to add one.');
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      // Show error to user
      alert(`Error loading projects: ${error instanceof Error ? error.message : String(error)}\n\nCheck the console for more details.`);
    } finally {
      setLoading(false);
    }
  };

  const loadRunningProcesses = async () => {
    try {
      const processes = await window.electronAPI.getRunningProcesses();
      setRunningProcesses(processes);
    } catch (error) {
      console.error('Error loading running processes:', error);
    }
  };

  const loadWorkspaces = async () => {
    try {
      setLoadingWorkspaces(true);
      
      // First, sync all workspaces from their files to ensure database is up to date
      try {
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
        
        if (apiBaseUrl) {
          const workspacesResponse = await fetch(`${apiBaseUrl}/workspaces`);
          if (workspacesResponse.ok) {
            const allWorkspaces = await workspacesResponse.json();
            // Sync each workspace from its file (silently, don't show errors to user)
            for (const ws of allWorkspaces) {
              try {
                await fetch(`${apiBaseUrl}/workspaces/${ws.id}/sync-from-file`, {
                  method: 'POST',
                });
              } catch (error) {
                // Silently ignore sync errors for individual workspaces
                console.debug(`Error syncing workspace ${ws.id}:`, error);
              }
            }
          }
        }
      } catch (error) {
        // If sync fails, continue anyway - we'll just use what's in the database
        console.debug('Error syncing workspaces on load:', error);
      }
      
      // Use IPC handler to get workspaces (ensures we use the correct API port)
      const ws = await window.electronAPI.getWorkspaces();
      setWorkspaces(ws);
      
      // Load project counts for each workspace
      // Try common API ports to find the correct one
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
      
      if (apiBaseUrl) {
        const counts = new Map<number, number>();
        // Load counts for all workspaces, ensuring we set a value for each one
        const countPromises = ws.map(async (workspace: any) => {
            try {
            const projectsResponse = await fetch(`${apiBaseUrl}/workspaces/${workspace.id}/projects`, {
              signal: AbortSignal.timeout(2000),
            });
              if (projectsResponse.ok) {
                const projects = await projectsResponse.json();
              return { workspaceId: workspace.id, count: Array.isArray(projects) ? projects.length : 0 };
            } else if (projectsResponse.status === 404) {
              // Workspace might not exist or have no projects - set count to 0
              return { workspaceId: workspace.id, count: 0 };
            } else {
              // Other error status - set count to 0
              return { workspaceId: workspace.id, count: 0 };
              }
            } catch (error) {
            // Silently handle errors - workspace might not exist or API might not be ready
            // Only log if it's not a network/abort error
            if (error instanceof Error && !error.name.includes('AbortError') && !error.message.includes('fetch')) {
              console.debug(`Error loading projects for workspace ${workspace.id}:`, error);
            }
            return { workspaceId: workspace.id, count: 0 };
            }
        });
        
        const results = await Promise.all(countPromises);
        const updatedCounts = new Map<number, number>();
        // First, set all workspaces to 0
        ws.forEach((workspace: any) => {
          updatedCounts.set(workspace.id, 0);
        });
        // Then update with actual counts from results
        results.forEach(({ workspaceId, count }) => {
          updatedCounts.set(workspaceId, count);
        });
        setWorkspaceProjectCounts(updatedCounts);
      } else {
        // If no API URL found, set all counts to 0
        const zeroCounts = new Map<number, number>();
        ws.forEach((workspace: any) => {
          zeroCounts.set(workspace.id, 0);
        });
        setWorkspaceProjectCounts(zeroCounts);
      }
    } catch (error) {
      console.error('Error loading workspaces:', error);
    } finally {
      setLoadingWorkspaces(false);
    }
  };

  const updateGitBranches = async () => {
    if (projects.length === 0) {
      return; // No projects to update
    }
    
    try {
      const branches = new Map<number, string | null>();
      // Try common API ports
      const ports = [38124, 38125, 38126, 38127, 38128, 3001];
      let apiBaseUrl = '';
      
      // Find working API port
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
        console.warn('No API server found for git branches');
        // If no API found, set all to null
        for (const project of projects) {
          branches.set(project.id, null);
        }
        setGitBranches(branches);
        return;
      }
      
      // Update branches for all projects in parallel
      const branchPromises = projects.map(async (project) => {
        try {
          const response = await fetch(`${apiBaseUrl}/projects/${project.id}/git-branch`, {
            signal: AbortSignal.timeout(2000),
          });
          if (response.ok) {
            const data = await response.json();
            return { projectId: project.id, branch: data.branch };
          } else {
            return { projectId: project.id, branch: null };
          }
        } catch (error) {
          console.warn(`Failed to get git branch for project ${project.id}:`, error);
          return { projectId: project.id, branch: null };
        }
      });
      
      const results = await Promise.all(branchPromises);
      results.forEach(({ projectId, branch }) => {
        branches.set(projectId, branch);
      });
      
      setGitBranches(branches);
    } catch (error) {
      console.error('Error updating git branches:', error);
    }
  };

  const handleAddProject = async (path: string) => {
    try {
      const project = await window.electronAPI.addProject(path);
      await loadProjects();
      setShowAddModal(false);
      
      // Auto-scan the new project
      await window.electronAPI.scanProject(project.id);
      await loadProjects();
    } catch (error) {
      console.error('Error adding project:', error);
      alert(error instanceof Error ? error.message : 'Failed to add project');
    }
  };

  const handleRemoveProject = async (projectId: number) => {
    if (!confirm('Are you sure you want to remove this project?')) {
      return;
    }
    
    try {
      await window.electronAPI.removeProject(projectId);
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
      await loadProjects();
    } catch (error) {
      console.error('Error removing project:', error);
      alert('Failed to remove project');
    }
  };

  const handleSearchChange = (query: string, type: FilterType) => {
    setSearchQuery(query);
    setFilterType(type);
  };

  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Apply search filter
    if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
      filtered = projects.filter((project: Project) => {
      switch (filterType) {
        case 'name':
          return project.name.toLowerCase().includes(query);
        case 'path':
          return project.path.toLowerCase().includes(query);
        case 'ports':
          // This will be enhanced when we load ports data
          return false; // Placeholder - will be enhanced
        case 'running':
          // This will be enhanced when we have running status
          return query === 'running' || query === 'not running';
        case 'all':
        default:
          return (
            project.name.toLowerCase().includes(query) ||
              project.path.toLowerCase().includes(query) ||
              (project.tags && project.tags.some((tag: string) => tag.toLowerCase().includes(query)))
          );
      }
    });
    }

    // Apply sorting
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
        sorted.sort((a, b) => a.created_at - b.created_at);
        break;
      case 'running':
        sorted.sort((a, b) => {
          const aRunning = runningProcesses.filter((p: any) => p.projectPath === a.path).length;
          const bRunning = runningProcesses.filter((p: any) => p.projectPath === b.path).length;
          return bRunning - aRunning;
        });
        break;
    }

    return sorted;
  }, [projects, searchQuery, filterType, sortType, runningProcesses]);

  const filteredWorkspaces = useMemo(() => {
    let filtered = workspaces;

    // Apply search filter
    if (workspaceSearchQuery.trim()) {
      const query = workspaceSearchQuery.toLowerCase().trim();
      filtered = workspaces.filter((workspace: any) => {
        return (
          workspace.name.toLowerCase().includes(query) ||
          (workspace.description && workspace.description.toLowerCase().includes(query)) ||
          workspace.workspace_file_path.toLowerCase().includes(query)
        );
      });
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (workspaceSortType) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'recent':
          return (b.id || 0) - (a.id || 0); // Assuming higher ID = more recent
        case 'recently-opened':
          const aOpened = a.last_opened || 0;
          const bOpened = b.last_opened || 0;
          return bOpened - aOpened; // Most recently opened first
        case 'projects':
          const aCount = workspaceProjectCounts.get(a.id) || 0;
          const bCount = workspaceProjectCounts.get(b.id) || 0;
          return bCount - aCount; // Most projects first
        default:
          return 0;
      }
    });

    return filtered;
  }, [workspaces, workspaceSearchQuery, workspaceSortType, workspaceProjectCounts]);

  // Keyboard shortcuts and navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + , to open settings
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        setShowSettings(true);
        return;
      }

      // Cmd/Ctrl + / to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      // Don't handle arrow keys if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Only handle arrow keys if focus is in the project list
      const projectList = document.querySelector('.project-list');
      const isInProjectList = projectList && (
        projectList === target || 
        projectList.contains(target) ||
        target.closest('.project-item') !== null
      );

      if (!isInProjectList && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        return; // Don't handle arrow keys outside project list
      }

      const filtered = filteredProjects;
      
      // Arrow keys for project navigation (only when in project list)
      if (e.key === 'ArrowDown' && isInProjectList) {
        e.preventDefault();
        const nextIndex = keyboardFocusedIndex < filtered.length - 1 
          ? keyboardFocusedIndex + 1 
          : filtered.length > 0 ? 0 : -1;
        if (nextIndex >= 0) {
          setKeyboardFocusedIndex(nextIndex);
          setSelectedProject(filtered[nextIndex]);
        }
      } else if (e.key === 'ArrowUp' && isInProjectList) {
        e.preventDefault();
        const prevIndex = keyboardFocusedIndex > 0 
          ? keyboardFocusedIndex - 1 
          : filtered.length > 0 ? filtered.length - 1 : -1;
        if (prevIndex >= 0) {
          setKeyboardFocusedIndex(prevIndex);
          setSelectedProject(filtered[prevIndex]);
        }
      } else if (e.key === 'Enter' && keyboardFocusedIndex >= 0 && keyboardFocusedIndex < filtered.length && isInProjectList) {
        e.preventDefault();
        setSelectedProject(filtered[keyboardFocusedIndex]);
      } else if (e.key === 'Escape' && isInProjectList) {
        setKeyboardFocusedIndex(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyboardFocusedIndex, filteredProjects]);

  // Reset keyboard focus when projects change
  useEffect(() => {
    setKeyboardFocusedIndex(-1);
  }, [filteredProjects.length, searchQuery]);

  const handleOpenTerminal = (pid: number, scriptName: string, projectName: string) => {
    setTerminalProcess({ pid, scriptName, projectName });
  };

  const handleCloseTerminal = () => {
    setTerminalProcess(null);
  };

  const handleTerminalProjectClick = () => {
    if (terminalProcess) {
      // Find the project by name
      const project = projects.find(p => p.name === terminalProcess.projectName);
      if (project) {
        setSelectedProject(project);
        setActiveTab('projects'); // Switch to projects tab if not already there
      }
    }
  };

  // Show loading screen while API server is starting or workspaces are loading
  if (!apiReady || (activeTab === 'workspaces' && loadingWorkspaces)) {
    return (
      <div className="app">
        <div className="api-loading-screen">
          <div className="api-loading-content">
            <div className="spinner-large"></div>
            <h2>PROJAX</h2>
            <p>{!apiReady ? apiReadyMessage : 'Loading workspaces...'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Titlebar
        tabBar={<TabBar activeTab={activeTab} onTabChange={setActiveTab} showSettings={showSettings} onCloseSettings={() => setShowSettings(false)} />}
      >
        <div className="header-actions">
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className={`btn-link settings-button ${showSettings ? 'active' : ''}`}
            title="Settings"
          >
            Settings
          </button>
          {activeTab === 'workspaces' && (
            <button
              type="button"
              onClick={() => setShowAddWorkspaceModal(true)}
              className="btn-link btn-link-primary"
            >
              Add Workspace
            </button>
          )}
        </div>
      </Titlebar>

      <div className="app-content">
        {!showSettings && (
        <Rnd
          size={{ width: sidebarWidth, height: '100%' }}
          minWidth={200}
          maxWidth={600}
          disableDragging={true}
          enableResizing={{ right: true }}
          onResizeStop={(e, direction, ref, d) => {
            const newWidth = sidebarWidth + d.width;
            setSidebarWidth(Math.max(200, Math.min(600, newWidth)));
          }}
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
          resizeHandleStyles={{
            right: {
              width: '4px',
              right: '-2px',
              cursor: 'col-resize',
              backgroundColor: 'transparent',
            },
          }}
        >
          <aside className="sidebar" style={{ width: '100%', height: '100%' }}>
            {activeTab === 'projects' ? (
              <>
                <ProjectSearch 
                  onSearchChange={handleSearchChange} 
                  onSortChange={setSortType}
                  searchInputRef={searchInputRef}
                />
                <ProjectList
                  projects={filteredProjects}
                  selectedProject={selectedProject}
                  onSelectProject={setSelectedProject}
                  loading={loading}
                  runningProcesses={runningProcesses}
                  keyboardFocusedIndex={keyboardFocusedIndex}
                  onKeyboardFocusChange={setKeyboardFocusedIndex}
                  gitBranches={gitBranches}
                />
              </>
            ) : (
              <>
                <WorkspaceSearch 
                  onSearchChange={setWorkspaceSearchQuery}
                  onSortChange={setWorkspaceSortType}
                />
                <WorkspaceList
                  workspaces={filteredWorkspaces}
                  selectedWorkspace={selectedWorkspace}
                  onSelectWorkspace={(workspace) => {
                    // Always clear project first to ensure clean state
                    setSelectedProject(null);
                    // Use a small delay to ensure project is cleared before setting workspace
                    setTimeout(() => {
                      setSelectedWorkspace(workspace);
                    }, 0);
                  }}
                  loading={loadingWorkspaces}
                  keyboardFocusedIndex={keyboardFocusedIndex}
                  onKeyboardFocusChange={setKeyboardFocusedIndex}
                  workspaceProjects={workspaceProjectCounts}
                />
              </>
            )}
          </aside>
        </Rnd>
        )}

        <main className="main-content" ref={mainContentRef}>
          {showSettings ? (
            <SettingsPanel onClose={() => setShowSettings(false)} />
          ) : selectedProject ? (
            <ProjectDetails
              project={selectedProject}
              workspace={activeTab === 'workspaces' ? selectedWorkspace : undefined}
              onProjectUpdate={(updated) => {
                setSelectedProject(updated);
                loadProjects();
              }}
              onRemoveProject={handleRemoveProject}
              onOpenTerminal={handleOpenTerminal}
              onNavigateBack={activeTab === 'workspaces' && selectedWorkspace ? () => {
                setSelectedProject(null);
              } : undefined}
              onSelectWorkspace={(ws) => {
                setActiveTab('workspaces');
                setSelectedWorkspace(ws);
                setSelectedProject(null);
              }}
            />
          ) : activeTab === 'workspaces' && selectedWorkspace ? (
            <WorkspaceDetails
              workspace={selectedWorkspace}
              onWorkspaceUpdate={(updated) => {
                setSelectedWorkspace(updated);
                loadWorkspaces();
              }}
              onRemoveWorkspace={async (id) => {
                  try {
                    // Try to find API port
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
                    if (apiBaseUrl) {
                      await fetch(`${apiBaseUrl}/workspaces/${id}`, { method: 'DELETE' });
                    }
                    if (selectedWorkspace?.id === id) {
                      setSelectedWorkspace(null);
                    }
                    await loadWorkspaces();
                  } catch (error) {
                    console.error('Error removing workspace:', error);
                    alert('Failed to remove workspace');
                  }
                }}
                onOpenWorkspace={async (workspace) => {
                  try {
                    await window.electronAPI.openWorkspace(workspace.id);
                  } catch (error) {
                    console.error('Error opening workspace:', error);
                    alert(`Failed to open workspace: ${error instanceof Error ? error.message : 'Unknown error'}`);
                  }
                }}
                onSelectProject={(project) => {
                  setSelectedProject(project);
                }}
              />
            ) : (
              <div className="empty-state">
                <h2>Select {activeTab === 'projects' ? 'a project' : 'a workspace'} to view details</h2>
                <p>Choose {activeTab === 'projects' ? 'a project' : 'a workspace'} from the sidebar to see its information.</p>
              </div>
            )
          }
        </main>

        {terminalProcess && (
          <div 
            style={{ 
              width: `${terminalWidth}px`, 
              minWidth: '350px',
              maxWidth: '800px',
              height: '100%',
              position: 'relative',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '-2px',
                top: 0,
                bottom: 0,
                width: '4px',
                cursor: 'col-resize',
                zIndex: 10,
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                const startX = e.clientX;
                const startWidth = terminalWidth;

                const handleMouseMove = (e: MouseEvent) => {
                  const delta = startX - e.clientX;
                  const newWidth = Math.max(350, Math.min(800, startWidth + delta));
                  setTerminalWidth(newWidth);
                };

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
            <Terminal
              pid={terminalProcess.pid}
              scriptName={terminalProcess.scriptName}
              projectName={terminalProcess.projectName}
              onClose={handleCloseTerminal}
              onProjectClick={handleTerminalProjectClick}
            />
          </div>
        )}
      </div>

      {showAddModal && (
        <AddProjectModal
          onAdd={handleAddProject}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showAddWorkspaceModal && (
        <AddWorkspaceModal
          onAdd={async (workspace) => {
            await loadWorkspaces();
            setShowAddWorkspaceModal(false);
            setSelectedWorkspace(workspace);
          }}
          onClose={() => setShowAddWorkspaceModal(false)}
          existingProjects={projects}
        />
      )}

      <StatusBar />
    </div>
  );
}

export default App;

