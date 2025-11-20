import React, { useState, useEffect, useMemo } from 'react';
// Note: Renderer runs in browser context, types only
// The actual data comes from IPC
type Project = any;
import { ElectronAPI } from '../main/preload';
import { Rnd } from 'react-rnd';
import ProjectList from './components/ProjectList';
import ProjectDetails from './components/ProjectDetails';
import AddProjectModal from './components/AddProjectModal';
import ProjectSearch, { FilterType, SortType } from './components/ProjectSearch';
import Settings from './components/Settings';
import Titlebar from './components/Titlebar';
import StatusBar from './components/StatusBar';
import Terminal from './components/Terminal';
import './App.css';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('name-asc');
  const [showSettings, setShowSettings] = useState(false);
  const [runningProcesses, setRunningProcesses] = useState<any[]>([]);
  const [keyboardFocusedIndex, setKeyboardFocusedIndex] = useState<number>(-1);
  const [focusedPanel, setFocusedPanel] = useState<'sidebar' | 'details' | 'terminal'>('sidebar');
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [sidebarWidth, setSidebarWidth] = useState<number>(280);
  const [terminalWidth, setTerminalWidth] = useState<number>(550);
  const [terminalProcess, setTerminalProcess] = useState<{
    pid: number;
    scriptName: string;
    projectName: string;
  } | null>(null);

  useEffect(() => {
    loadProjects();
    loadRunningProcesses();
    
    // Refresh running processes every 5 seconds
    const interval = setInterval(() => {
      loadRunningProcesses();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);


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
  }, [keyboardFocusedIndex, filteredProjects, focusedPanel, selectedProject, terminalProcess]);

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

  return (
    <div className="app">
      <Titlebar>
        <div className="header-actions">
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="btn-link"
            title="Settings"
          >
            Settings
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="btn-link btn-link-primary"
          >
            + Add Project
          </button>
        </div>
      </Titlebar>

      <div className="app-content">
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
            <ProjectSearch 
              onSearchChange={handleSearchChange} 
              onSortChange={setSortType}
              searchInputRef={searchInputRef}
            />
            <ProjectList
              projects={filteredProjects}
              selectedProject={selectedProject}
              onSelectProject={(project) => {
                setSelectedProject(project);
                setKeyboardFocusedIndex(-1); // Clear keyboard focus when clicking
              }}
              loading={loading}
              runningProcesses={runningProcesses}
              keyboardFocusedIndex={keyboardFocusedIndex}
              onKeyboardFocusChange={setKeyboardFocusedIndex}
            />
          </aside>
        </Rnd>

        <main className="main-content">
          {selectedProject ? (
            <ProjectDetails
              project={selectedProject}
              onProjectUpdate={(updated) => {
                setSelectedProject(updated);
                loadProjects();
              }}
              onRemoveProject={handleRemoveProject}
              onOpenTerminal={handleOpenTerminal}
            />
          ) : (
            <div className="empty-state">
              <h2>Select a project to view details</h2>
              <p>Choose a project from the sidebar to see its test files and information.</p>
            </div>
          )}
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

      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}

      <StatusBar />
    </div>
  );
}

export default App;

