import React, { useState, useEffect, useMemo } from 'react';
// Note: Renderer runs in browser context, types only
// The actual data comes from IPC
type Project = any;
type Test = any;
import { ElectronAPI } from '../main/preload';
import ProjectList from './components/ProjectList';
import ProjectDetails from './components/ProjectDetails';
import AddProjectModal from './components/AddProjectModal';
import ProjectSearch, { FilterType } from './components/ProjectSearch';
import Settings from './components/Settings';
import Titlebar from './components/Titlebar';
import StatusBar from './components/StatusBar';
import './App.css';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadTests(selectedProject.id);
    } else {
      setTests([]);
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

  const loadTests = async (projectId: number) => {
    try {
      const testList = await window.electronAPI.getTests(projectId);
      setTests(testList);
    } catch (error) {
      console.error('Error loading tests:', error);
    }
  };

  const handleAddProject = async (path: string) => {
    try {
      const project = await window.electronAPI.addProject(path);
      await loadProjects();
      setShowAddModal(false);
      
      // Auto-scan the new project
      setScanning(true);
      await window.electronAPI.scanProject(project.id);
      await loadProjects();
      setScanning(false);
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

  const handleScanProject = async (projectId: number) => {
    try {
      setScanning(true);
      await window.electronAPI.scanProject(projectId);
      await loadProjects();
      if (selectedProject?.id === projectId) {
        await loadTests(projectId);
      }
    } catch (error) {
      console.error('Error scanning project:', error);
      alert('Failed to scan project');
    } finally {
      setScanning(false);
    }
  };

  const handleScanAll = async () => {
    try {
      setScanning(true);
      await window.electronAPI.scanAllProjects();
      await loadProjects();
      if (selectedProject) {
        await loadTests(selectedProject.id);
      }
    } catch (error) {
      console.error('Error scanning all projects:', error);
      alert('Failed to scan projects');
    } finally {
      setScanning(false);
    }
  };

  const handleSearchChange = (query: string, type: FilterType) => {
    setSearchQuery(query);
    setFilterType(type);
  };

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) {
      return projects;
    }

    const query = searchQuery.toLowerCase().trim();

    return projects.filter((project: Project) => {
      switch (filterType) {
        case 'name':
          return project.name.toLowerCase().includes(query);
        case 'path':
          return project.path.toLowerCase().includes(query);
        case 'ports':
          // This will be enhanced when we load ports data
          return false; // Placeholder - will be enhanced
        case 'testCount':
          // This will be enhanced when we have test counts
          const testCount = tests.filter((t: Test) => t.project_id === project.id).length;
          return testCount.toString().includes(query);
        case 'running':
          // This will be enhanced when we have running status
          return query === 'running' || query === 'not running';
        case 'all':
        default:
          return (
            project.name.toLowerCase().includes(query) ||
            project.path.toLowerCase().includes(query)
          );
      }
    });
  }, [projects, searchQuery, filterType, tests]);

  return (
    <div className="app">
      <Titlebar>
        <h1>projax</h1>
        <div className="header-actions">
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="btn btn-secondary"
            title="Settings"
          >
            ⚙️ Settings
          </button>
          <button
            type="button"
            onClick={handleScanAll}
            disabled={scanning || projects.length === 0}
            className="btn btn-secondary"
          >
            {scanning ? 'Scanning...' : 'Scan All'}
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            + Add Project
          </button>
        </div>
      </Titlebar>

      <div className="app-content">
        <aside className="sidebar">
          <ProjectSearch onSearchChange={handleSearchChange} />
          <ProjectList
            projects={filteredProjects}
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
            onRemoveProject={handleRemoveProject}
            onScanProject={handleScanProject}
            loading={loading}
            scanning={scanning}
          />
        </aside>

        <main className="main-content">
          {selectedProject ? (
            <ProjectDetails
              project={selectedProject}
              tests={tests}
              onScan={() => handleScanProject(selectedProject.id)}
              scanning={scanning}
              onProjectUpdate={(updated) => {
                setSelectedProject(updated);
                loadProjects();
              }}
            />
          ) : (
            <div className="empty-state">
              <h2>Select a project to view details</h2>
              <p>Choose a project from the sidebar to see its test files and information.</p>
            </div>
          )}
        </main>
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

