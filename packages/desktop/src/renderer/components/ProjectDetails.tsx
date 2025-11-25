import React, { useState, useEffect, useMemo } from 'react';
// Note: Renderer runs in browser context, types only
type Project = any;
import { ElectronAPI } from '../../main/preload';
import ProjectUrls from './ProjectUrls';
import './ProjectDetails.css';

interface ProjectDetailsProps {
  project: Project;
  workspace?: any;
  onProjectUpdate?: (project: Project) => void;
  onRemoveProject?: (projectId: number) => void;
  onOpenTerminal?: (pid: number, scriptName: string, projectName: string) => void;
  onNavigateBack?: () => void;
  onSelectWorkspace?: (workspace: any) => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project,
  workspace,
  onProjectUpdate,
  onRemoveProject,
  onOpenTerminal,
  onNavigateBack,
  onSelectWorkspace,
}) => {
  const [editingName, setEditingName] = useState(false);
  const [projectName, setProjectName] = useState(project.name);
  const [editingDescription, setEditingDescription] = useState(false);
  const [projectDescription, setProjectDescription] = useState(project.description || '');
  const [scripts, setScripts] = useState<any>(null);
  const [loadingScripts, setLoadingScripts] = useState(false);
  const [ports, setPorts] = useState<any[]>([]);
  const [loadingPorts, setLoadingPorts] = useState(false);
  const [runningScripts, setRunningScripts] = useState<Set<string>>(new Set());
  const [runningProcesses, setRunningProcesses] = useState<any[]>([]);
  const [loadingProcesses, setLoadingProcesses] = useState(false);
  const [editingTags, setEditingTags] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [allTags, setAllTags] = useState<string[]>([]);
  const [projectTags, setProjectTags] = useState<string[]>(project.tags || []);
  const [editorSettings, setEditorSettings] = useState<any>(null);
  const [latestTestResult, setLatestTestResult] = useState<any>(null);
  const [loadingTestResult, setLoadingTestResult] = useState(false);
  const [scriptSortOrder, setScriptSortOrder] = useState<'default' | 'alphabetical' | 'last-used'>('default');
  const [scriptLastUsed, setScriptLastUsed] = useState<Map<string, number>>(new Map());
  const [projectSettings, setProjectSettings] = useState<{
    scripts_path: string | null;
    editor: { type: string | null; customPath: string | null } | null;
  }>({
    scripts_path: null,
    editor: null,
  });
  const [editingScriptsPath, setEditingScriptsPath] = useState(false);
  const [scriptsPathInput, setScriptsPathInput] = useState('');
  const [editingProjectEditor, setEditingProjectEditor] = useState(false);
  const [displaySettings, setDisplaySettings] = useState({
    showStats: true,
    showTestResults: true,
    showTags: true,
    showUrls: true,
    showScripts: true,
    showJenkins: false,
  });
  const [projectWorkspaces, setProjectWorkspaces] = useState<any[]>([]);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);

  useEffect(() => {
    setProjectName(project.name);
    setProjectDescription(project.description || '');
    setProjectTags(project.tags || []);
    loadScripts();
    loadPorts();
    loadRunningProcesses();
    loadAllTags();
    loadEditorSettings();
    loadLatestTestResult();
    loadProjectSettings();
    loadDisplaySettings();
    loadProjectWorkspaces();
    loadProjectSettingsFull();
    
    // Refresh running processes and test results every 5 seconds
    const interval = setInterval(() => {
      loadRunningProcesses();
      loadLatestTestResult();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [project]);

  const loadDisplaySettings = async () => {
    try {
      const settings = await window.electronAPI.getSettings();
      if (settings.display?.projectDetails) {
        setDisplaySettings(settings.display.projectDetails);
      }
    } catch (error) {
      console.error('Error loading display settings:', error);
    }
  };

  const loadProjectWorkspaces = async () => {
    try {
      console.log('[ProjectDetails] loadProjectWorkspaces called for project:', project.name);
      setLoadingWorkspaces(true);
      const apiBaseUrl = await getApiBaseUrl();
      if (!apiBaseUrl) {
        console.warn('[ProjectDetails] No API base URL found, cannot sync workspaces');
        setProjectWorkspaces([]);
        return;
      }
      
      console.log('[ProjectDetails] Starting automatic workspace sync...');
      
      // First, sync all workspaces from their files to ensure database is up to date
      // This ensures the database matches the workspace files before we check for matches
      try {
        const workspacesResponse = await fetch(`${apiBaseUrl}/workspaces`);
        if (!workspacesResponse.ok) {
          console.warn(`[ProjectDetails] Failed to fetch workspaces for sync: ${workspacesResponse.status}`);
          throw new Error(`Failed to fetch workspaces: ${workspacesResponse.status}`);
        }
        
        const allWorkspaces = await workspacesResponse.json();
        console.log(`[ProjectDetails] Syncing ${allWorkspaces.length} workspace(s) from files...`);
        
        // Sync each workspace from its file sequentially to avoid race conditions
        // We do this sequentially instead of in parallel to ensure database writes complete
        let syncedCount = 0;
        let errorCount = 0;
        for (const ws of allWorkspaces) {
          try {
            console.log(`[ProjectDetails] Syncing workspace "${ws.name}" (ID: ${ws.id})...`);
            const syncResponse = await fetch(`${apiBaseUrl}/workspaces/${ws.id}/sync-from-file`, {
              method: 'POST',
            });
            if (syncResponse.ok) {
              const syncResult = await syncResponse.json();
              console.log(`[ProjectDetails] ✓ Synced workspace "${ws.name}": added ${syncResult.added}, removed ${syncResult.removed}`);
              syncedCount++;
            } else {
              const errorText = await syncResponse.text();
              console.warn(`[ProjectDetails] ✗ Failed to sync workspace "${ws.name}" (ID: ${ws.id}): ${syncResponse.status} - ${errorText}`);
              errorCount++;
            }
            // Small delay between syncs to ensure database writes complete
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            errorCount++;
            console.error(`[ProjectDetails] ✗ Error syncing workspace "${ws.name}" (ID: ${ws.id}):`, error);
          }
        }
        console.log(`[ProjectDetails] Completed syncing: ${syncedCount} succeeded, ${errorCount} failed out of ${allWorkspaces.length} workspace(s)`);
        
        // Additional delay to ensure all database writes are fully flushed to disk
        // Increased delay to ensure API server has processed all syncs
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        // If sync fails, log it but continue anyway - we'll just use what's in the database
        console.error('[ProjectDetails] Error during workspace sync:', error);
      }
      
      // Get all workspaces (after sync completes and database is updated)
      // Add a delay to ensure the API server has the latest data after all syncs
      await new Promise(resolve => setTimeout(resolve, 200));
      const workspacesResponse = await fetch(`${apiBaseUrl}/workspaces`);
      if (!workspacesResponse.ok) {
        console.warn(`[ProjectDetails] Failed to fetch workspaces: ${workspacesResponse.status}`);
        setProjectWorkspaces([]);
        return;
      }
      const allWorkspaces = await workspacesResponse.json();
      console.log(`[ProjectDetails] Loaded ${allWorkspaces.length} workspace(s) after sync`);
      console.log('[ProjectDetails] Workspace data:', allWorkspaces.map((ws: any) => ({ id: ws.id, name: ws.name, path: ws.workspace_file_path })));
      
      // Helper function to normalize paths for comparison (matches database normalization)
      // Database uses: path.normalize(path.resolve(p)).replace(/[/\\]+$/, '')
      // This means paths are absolute, normalized, and have no trailing slashes
      const normalizePath = (p: string): string => {
        if (!p) return '';
        // Normalize separators (convert backslashes to forward slashes)
        let normalized = p.replace(/\\/g, '/');
        // Collapse multiple slashes (except at start for absolute paths on Windows)
        if (normalized.length > 1 && normalized[1] === ':') {
          // Windows absolute path (C:/...)
          normalized = normalized[0] + ':' + normalized.substring(2).replace(/\/+/g, '/');
        } else {
          normalized = normalized.replace(/\/+/g, '/');
        }
        // Remove trailing slashes
        normalized = normalized.replace(/\/+$/, '');
        return normalized;
      };
      
      // Get absolute path for project (should already be absolute from database)
      const projectPath = project.path || '';
      const normalizedProjectPath = normalizePath(projectPath);
      
      console.log('Checking project workspaces:', {
        projectName: project.name,
        projectPath: projectPath,
        normalizedProjectPath: normalizedProjectPath,
      });
      
      // For each workspace, check if it contains this project
      const matchingWorkspaces = [];
      for (const ws of allWorkspaces) {
        try {
          const projectsResponse = await fetch(`${apiBaseUrl}/workspaces/${ws.id}/projects`, {
            signal: AbortSignal.timeout(2000),
          });
          if (projectsResponse.ok) {
            const workspaceProjects = await projectsResponse.json();
            console.log(`Workspace "${ws.name}" (${ws.id}) has ${workspaceProjects.length} projects`);
            
            const hasProject = workspaceProjects.some((wp: any) => {
              if (!wp.project_path) return false;
              const normalizedWorkspacePath = normalizePath(wp.project_path);
              const matches = normalizedWorkspacePath === normalizedProjectPath;
              
              if (!matches) {
                // Log mismatches for debugging
                console.debug(`Path mismatch in workspace "${ws.name}":`, {
                  workspacePath: wp.project_path,
                  normalizedWorkspace: normalizedWorkspacePath,
                  projectPath: projectPath,
                  normalizedProject: normalizedProjectPath,
                  lengths: {
                    workspace: normalizedWorkspacePath.length,
                    project: normalizedProjectPath.length,
                  },
                });
              } else {
                console.log(`✓ Found match in workspace "${ws.name}":`, {
                  workspacePath: wp.project_path,
                  normalized: normalizedWorkspacePath,
                });
              }
              
              return matches;
            });
            
            if (hasProject) {
              matchingWorkspaces.push(ws);
            }
          }
        } catch (error) {
          // Skip this workspace if we can't load its projects
          console.debug(`Error loading projects for workspace ${ws.id}:`, error);
          continue;
        }
      }
      
      console.log(`Found ${matchingWorkspaces.length} workspace(s) for project "${project.name}"`);
      console.log('[ProjectDetails] Matching workspaces:', matchingWorkspaces.map((ws: any) => ({ 
        id: ws.id, 
        name: ws.name, 
        path: ws.workspace_file_path,
        description: ws.description 
      })));
      
      setProjectWorkspaces(matchingWorkspaces);
    } catch (error) {
      console.error('Error loading project workspaces:', error);
      setProjectWorkspaces([]);
    } finally {
      setLoadingWorkspaces(false);
    }
  };

  const loadProjectSettings = async () => {
    try {
      const apiBaseUrl = await getApiBaseUrl();
      if (!apiBaseUrl) {
        // API not available, use defaults silently
        return;
      }
      const response = await fetch(`${apiBaseUrl}/projects/${project.id}/settings`);
      if (response.ok) {
        const settings = await response.json();
        setScriptSortOrder(settings.script_sort_order || 'default');
      }
    } catch (error) {
      // Silently fail - API might not be available
      console.debug('Could not load project settings:', error);
    }
  };

  const loadProjectSettingsFull = async () => {
    try {
      const apiBaseUrl = await getApiBaseUrl();
      if (!apiBaseUrl) {
        // API not available, use defaults silently
        return;
      }
      const response = await fetch(`${apiBaseUrl}/projects/${project.id}/settings`);
      if (response.ok) {
        const settings = await response.json();
        setProjectSettings({
          scripts_path: settings.scripts_path || null,
          editor: settings.editor || null,
        });
        setScriptsPathInput(settings.scripts_path || '');
      }
    } catch (error) {
      // Silently fail - API might not be available
      console.debug('Could not load project settings:', error);
    }
  };

  const saveProjectSettings = async (sortOrder: 'default' | 'alphabetical' | 'last-used') => {
    try {
      const apiBaseUrl = await getApiBaseUrl();
      if (!apiBaseUrl) {
        // API not available, can't save
        console.warn('API server not available, cannot save project settings');
        return;
      }
      const response = await fetch(`${apiBaseUrl}/projects/${project.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script_sort_order: sortOrder }),
      });
      if (response.ok) {
        setScriptSortOrder(sortOrder);
      } else {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.warn('Failed to save project settings:', error.error);
      }
    } catch (error) {
      console.warn('Error saving project settings:', error);
    }
  };

  const saveProjectSettingsFull = async (updates: {
    scripts_path?: string | null;
    editor?: { type: string | null; customPath: string | null } | null;
  }) => {
    try {
      // Validate scripts_path exists if provided
      if (updates.scripts_path !== undefined && updates.scripts_path) {
        const fullPath = updates.scripts_path.startsWith('/') 
          ? updates.scripts_path 
          : `${project.path}/${updates.scripts_path}`.replace(/\/+/g, '/');
        // Note: We can't check if path exists from renderer, so we'll let the API handle validation
        // The API will validate that it's a relative path
      }
      
      const apiBaseUrl = await getApiBaseUrl();
      if (!apiBaseUrl) {
        alert('API server not available. Please ensure the PROJAX API server is running.');
        return;
      }
      const response = await fetch(`${apiBaseUrl}/projects/${project.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        await loadProjectSettingsFull();
        // Reload scripts if scripts_path changed
        if (updates.scripts_path !== undefined) {
          // Wait for the database file to be written and flushed to disk
          // The API writes synchronously, but we need to ensure the main process reads the updated file
          await new Promise(resolve => setTimeout(resolve, 300));
          // Force reload scripts with the new path
          setLoadingScripts(true);
          try {
            await loadScripts();
          } catch (error) {
            console.error('Error reloading scripts after path change:', error);
            // Retry once after a longer delay
            await new Promise(resolve => setTimeout(resolve, 500));
          await loadScripts();
          }
        }
      } else {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        alert(error.error || 'Failed to save project settings');
      }
    } catch (error) {
      console.error('Error saving project settings:', error);
      alert(`Failed to save project settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

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

  const loadAllTags = async () => {
    try {
      const apiBaseUrl = await getApiBaseUrl();
      if (!apiBaseUrl) {
        setAllTags([]);
        return;
      }
      const response = await fetch(`${apiBaseUrl}/projects/tags`);
      if (!response.ok) {
        console.error('Failed to load tags:', response.status);
        setAllTags([]);
        return;
      }
      const tags = await response.json();
      // Ensure we always set an array
      setAllTags(Array.isArray(tags) ? tags : []);
    } catch (error) {
      console.error('Error loading tags:', error);
      setAllTags([]);
    }
  };

    const loadEditorSettings = async () => {
    try {
      const settings = await window.electronAPI.getSettings();
      setEditorSettings(settings.editor);
    } catch (error) {
      console.error('Error loading editor settings:', error);
    }
  };

const loadScripts = async () => {
    try {
      setLoadingScripts(true);
      const projectScripts = await window.electronAPI.getProjectScripts(project.path, project.id);
      setScripts(projectScripts);
    } catch (error) {
      console.error('Error loading scripts:', error);
      setScripts(null);
    } finally {
      setLoadingScripts(false);
    }
  };

  const loadPorts = async () => {
    try {
      setLoadingPorts(true);
      const projectPorts = await window.electronAPI.getProjectPorts(project.id);
      setPorts(projectPorts);
    } catch (error) {
      console.error('Error loading ports:', error);
      setPorts([]);
    } finally {
      setLoadingPorts(false);
    }
  };

  const loadLatestTestResult = async () => {
    try {
      setLoadingTestResult(true);
      const result = await window.electronAPI.getLatestTestResult(project.id);
      setLatestTestResult(result);
    } catch (error) {
      // Silently fail - test results are optional
      setLatestTestResult(null);
    } finally {
      setLoadingTestResult(false);
    }
  };

  const handleRename = async () => {
    if (!projectName.trim() || projectName === project.name) {
      setEditingName(false);
      setProjectName(project.name);
      return;
    }

    try {
      const updated = await window.electronAPI.renameProject(project.id, projectName.trim());
      setEditingName(false);
      if (onProjectUpdate) {
        onProjectUpdate(updated);
      }
    } catch (error) {
      console.error('Error renaming project:', error);
      alert('Failed to rename project');
      setProjectName(project.name);
    }
  };

  const handleUpdateDescription = async () => {
    const newDescription = projectDescription.trim() || null;
    if (newDescription === (project.description || '')) {
      setEditingDescription(false);
      setProjectDescription(project.description || '');
      return;
    }

    try {
      const updated = await window.electronAPI.updateProject(project.id, { description: newDescription });
      setEditingDescription(false);
      if (onProjectUpdate) {
        onProjectUpdate(updated);
      }
    } catch (error) {
      console.error('Error updating description:', error);
      alert('Failed to update description');
      setProjectDescription(project.description || '');
    }
  };

  const handleAddTag = async () => {
    const newTag = tagInput.trim();
    if (!newTag || projectTags.includes(newTag)) {
      setTagInput('');
      return;
    }

    const updatedTags = [...projectTags, newTag];
    try {
      const updated = await window.electronAPI.updateProject(project.id, { tags: updatedTags });
      setProjectTags(updatedTags);
      setTagInput('');
      if (onProjectUpdate) {
        onProjectUpdate(updated);
      }
      await loadAllTags();
    loadEditorSettings();
    } catch (error) {
      console.error('Error adding tag:', error);
      alert('Failed to add tag');
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const updatedTags = projectTags.filter(tag => tag !== tagToRemove);
    try {
      const updated = await window.electronAPI.updateProject(project.id, { tags: updatedTags });
      setProjectTags(updatedTags);
      if (onProjectUpdate) {
        onProjectUpdate(updated);
      }
      await loadAllTags();
    loadEditorSettings();
    } catch (error) {
      console.error('Error removing tag:', error);
      alert('Failed to remove tag');
    }
  };

  const suggestedTags = allTags.filter(tag => 
    !projectTags.includes(tag) && 
    tag.toLowerCase().includes(tagInput.toLowerCase())
  );


  const loadRunningProcesses = async () => {
    try {
      setLoadingProcesses(true);
      const processes = await window.electronAPI.getRunningProcesses();
      const projectProcesses = processes.filter((p: any) => p.projectPath === project.path);
      setRunningProcesses(projectProcesses);
      
      // Update running scripts set
      const runningScriptNames = new Set(projectProcesses.map((p: any) => p.scriptName));
      setRunningScripts(runningScriptNames);
    } catch (error) {
      console.error('Error loading running processes:', error);
    } finally {
      setLoadingProcesses(false);
    }
  };

  const handleRunScript = async (scriptName: string, background: boolean = true) => {
    try {
      setRunningScripts(prev => new Set(prev).add(scriptName));
      // Track last-used timestamp
      setScriptLastUsed(prev => new Map(prev).set(scriptName, Date.now()));
      await window.electronAPI.runScript(project.path, scriptName, [], background);
      if (background) {
        // Refresh processes after a short delay to get the PID
        setTimeout(async () => {
          await loadRunningProcesses();
          // Automatically open terminal sidebar when running script from project details
          if (onOpenTerminal) {
            try {
              // Find the process that was just started
              const processes = await window.electronAPI.getRunningProcesses();
              const newProcess = processes.find((p: any) => 
                p.projectPath === project.path && 
                p.scriptName === scriptName &&
                // Find the most recently started process for this script
                Date.now() - p.startedAt < 2000 // Started within last 2 seconds
              );
              if (newProcess) {
                onOpenTerminal(newProcess.pid, scriptName, project.name);
              }
            } catch (error) {
              console.debug('Error opening terminal after script run:', error);
            }
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error running script:', error);
      alert(`Failed to run script: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setRunningScripts(prev => {
        const next = new Set(prev);
        next.delete(scriptName);
        return next;
      });
    }
  };

  const handleStopScript = async (pid: number) => {
    try {
      const success = await window.electronAPI.stopScript(pid);
      if (success) {
        await loadRunningProcesses();
      } else {
        alert('Failed to stop script');
      }
    } catch (error) {
      console.error('Error stopping script:', error);
      alert(`Failed to stop script: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleStopAll = async () => {
    if (!confirm('Stop all running scripts for this project?')) {
      return;
    }
    try {
      const stopped = await window.electronAPI.stopProject(project.path);
      alert(`Stopped ${stopped} process(es)`);
      await loadRunningProcesses();
    } catch (error) {
      console.error('Error stopping all scripts:', error);
      alert(`Failed to stop scripts: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleOpenUrl = async (url: string) => {
    try {
      await window.electronAPI.openUrl(url);
    } catch (error) {
      console.error('Error opening URL:', error);
      alert(`Failed to open URL: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Collect all URLs from running processes and ports
  const allUrls = useMemo(() => {
    const urls = new Set<string>();
    
    // Add URLs from running processes
    for (const process of runningProcesses) {
      if (process.detectedUrls && Array.isArray(process.detectedUrls)) {
        for (const url of process.detectedUrls) {
          urls.add(url);
        }
      }
    }
    
    // Add URLs from detected ports
    for (const portInfo of ports) {
      const url = `http://localhost:${portInfo.port}`;
      urls.add(url);
    }
    
    return Array.from(urls).sort();
  }, [runningProcesses, ports]);

  // Sort scripts based on sort order
  const sortedScripts = useMemo(() => {
    if (!scripts?.scripts) return [];
    const sorted = [...scripts.scripts];
    if (scriptSortOrder === 'alphabetical') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (scriptSortOrder === 'last-used') {
      sorted.sort((a, b) => {
        const aTime = scriptLastUsed.get(a.name) || 0;
        const bTime = scriptLastUsed.get(b.name) || 0;
        return bTime - aTime; // Most recent first
      });
    }
    return sorted;
  }, [scripts?.scripts, scriptSortOrder, scriptLastUsed]);

  const lastScanned = project.last_scanned
    ? new Date(project.last_scanned * 1000).toLocaleString()
    : 'Never';

  return (
    <div className="project-details">
      {workspace && onNavigateBack && (
        <div className="breadcrumb">
          <button className="breadcrumb-link" onClick={onNavigateBack}>
            {workspace.name}
          </button>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{project.name}</span>
        </div>
      )}
      <div className="project-details-header">
        <div>
          {editingName ? (
            <div className="project-name-edit">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                aria-label="Project name"
                onBlur={handleRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRename();
                  } else if (e.key === 'Escape') {
                    setEditingName(false);
                    setProjectName(project.name);
                  }
                }}
                className="project-name-input"
                autoFocus
              />
            </div>
          ) : (
            <h2 onClick={() => setEditingName(true)} className="project-name-editable" title="Click to rename">
              {project.name}
            </h2>
          )}
          {editingDescription ? (
            <div className="project-description-edit">
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                onBlur={handleUpdateDescription}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleUpdateDescription();
                  } else if (e.key === 'Escape') {
                    setEditingDescription(false);
                    setProjectDescription(project.description || '');
                  }
                }}
                className="project-description-input"
                placeholder="Add a description for this project... (⌘+Enter to save, Esc to cancel)"
                autoFocus
              />
            </div>
          ) : (
            <div>
              <p 
                className="project-description" 
                onClick={() => setEditingDescription(true)}
                title="Click to edit description"
              >
                {project.description || 'Click to add a description...'}
              </p>
              <p className="project-path">{project.path}</p>
            </div>
          )}
        </div>
        <div className="header-actions-group">
          <button
            onClick={async () => {
              try {
                await window.electronAPI.openInEditor(project.path, project.id);
              } catch (error) {
                console.error('Error opening in editor:', error);
                alert(`Failed to open in editor: ${error instanceof Error ? error.message : String(error)}`);
              }
            }}
            className="btn btn-secondary"
            title="Open in editor"
          >
            Editor
          </button>
          <button
            onClick={async () => {
              try {
                await window.electronAPI.openInFiles(project.path);
              } catch (error) {
                console.error('Error opening directory:', error);
                alert(`Failed to open directory: ${error instanceof Error ? error.message : String(error)}`);
              }
            }}
            className="btn btn-secondary"
            title="Open in file manager"
          >
            Files
          </button>
        </div>
      </div>

      {displaySettings.showStats && (
      <div className="project-stats">
        <div className="stat-card">
          <div className="stat-value">{ports.length}</div>
          <div className="stat-label">Ports</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{scripts?.scripts?.length || 0}</div>
          <div className="stat-label">Scripts</div>
        </div>
      </div>
      )}

      {/* Test Results Section */}
      {displaySettings.showTestResults && latestTestResult && (
        <div className="test-results-section">
          <div className="section-header">
            <h3>Latest Test Results</h3>
            <span className="test-timestamp">
              {new Date(latestTestResult.timestamp * 1000).toLocaleString()}
            </span>
          </div>
          <div className="test-results-content">
            <div className="test-stats-grid">
              <div className="test-stat passed">
                <div className="test-stat-icon">✓</div>
                <div className="test-stat-info">
                  <div className="test-stat-value">{latestTestResult.passed}</div>
                  <div className="test-stat-label">Passed</div>
                </div>
              </div>
              <div className="test-stat failed">
                <div className="test-stat-icon">✗</div>
                <div className="test-stat-info">
                  <div className="test-stat-value">{latestTestResult.failed}</div>
                  <div className="test-stat-label">Failed</div>
                </div>
              </div>
              {latestTestResult.skipped > 0 && (
                <div className="test-stat skipped">
                  <div className="test-stat-icon">⊘</div>
                  <div className="test-stat-info">
                    <div className="test-stat-value">{latestTestResult.skipped}</div>
                    <div className="test-stat-label">Skipped</div>
                  </div>
                </div>
              )}
              <div className="test-stat total">
                <div className="test-stat-icon">∑</div>
                <div className="test-stat-info">
                  <div className="test-stat-value">{latestTestResult.total}</div>
                  <div className="test-stat-label">Total</div>
                </div>
              </div>
            </div>
            <div className="test-meta">
              {latestTestResult.framework && (
                <span className="test-framework-badge">{latestTestResult.framework}</span>
              )}
              {latestTestResult.duration && (
                <span className="test-duration">⏱ {(latestTestResult.duration / 1000).toFixed(2)}s</span>
              )}
              {latestTestResult.coverage && (
                <span className="test-coverage">📊 {latestTestResult.coverage.toFixed(1)}% coverage</span>
              )}
              <span className="test-script-name">Script: {latestTestResult.script_name}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tags Section */}
      {displaySettings.showTags && (
      <div className="tags-section">
        <div className="section-header">
          <h3>Tags</h3>
        </div>
        <div className="tags-content">
          <div className="tags-list">
            {projectTags.map((tag) => (
              <span key={tag} className="tag-item">
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="tag-remove"
                  title="Remove tag"
                >
                  ×
                </button>
              </span>
            ))}
            {editingTags ? (
              <div className="tag-input-wrapper">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  aria-label="Add tag"
                  placeholder="Add tag"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTag();
                    } else if (e.key === 'Escape') {
                      setEditingTags(false);
                      setTagInput('');
                    }
                  }}
                  onBlur={() => {
                    handleAddTag();
                    setEditingTags(false);
                  }}
                  className="tag-input"
                  autoFocus
                />
                {suggestedTags.length > 0 && tagInput && (
                  <div className="tag-suggestions">
                    {suggestedTags.slice(0, 5).map((tag) => (
                      <div
                        key={tag}
                        className="tag-suggestion"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setTagInput(tag);
                        }}
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setEditingTags(true)}
                className="tag-add-btn"
                title="Add tag"
              >
                + Add Tag
              </button>
            )}
          </div>
        </div>
      </div>
      )}

      {displaySettings.showUrls && allUrls.length > 0 && (
        <ProjectUrls urls={allUrls} onOpenUrl={handleOpenUrl} />
      )}

      

      {displaySettings.showScripts && scripts && (
        <div className="scripts-section">
          <div className="section-header">
            <h3>Available Scripts ({scripts.scripts.length})</h3>
            <div className="section-header-right">
              <span className="project-type-badge">{scripts.type}</span>
              <select
                value={scriptSortOrder}
                onChange={(e) => saveProjectSettings(e.target.value as 'default' | 'alphabetical' | 'last-used')}
                className="script-sort-select"
                aria-label="Script sort order"
              >
                <option value="default">Default</option>
                <option value="alphabetical">Alphabetically</option>
                <option value="last-used">Last Used</option>
              </select>
            </div>
          </div>
          {loadingScripts ? (
            <div className="loading-state">Loading scripts...</div>
          ) : scripts.scripts.length === 0 ? (
            <div className="no-scripts">No scripts found in this project.</div>
          ) : (
            <div className="scripts-list">
              {sortedScripts.map((script: any) => {
                const scriptProcesses = runningProcesses.filter((p: any) => p.scriptName === script.name);
                const isRunning = scriptProcesses.length > 0;
                // Match ports from the ports array with this script name
                const scriptPorts = ports
                  .filter((port: any) => port.script_name === script.name)
                  .map((port: any) => port.port);
                const uniquePorts = Array.from(new Set(scriptPorts)).sort((a, b) => a - b);
                
                return (
                  <div key={script.name} className={`script-item ${isRunning ? 'running' : ''}`}>
                    <div className="script-info">
                      <div className="script-header">
                        <span className="script-name">{script.name}</span>
                        <span className="script-command">{script.command}</span>
                        <span className="script-runner">{script.runner}</span>
                      </div>
                      {isRunning && (
                        <div className="script-process-info">
                          {scriptProcesses.map((p: any) => {
                            const uptime = Math.floor((Date.now() - p.startedAt) / 1000);
                            const minutes = Math.floor(uptime / 60);
                            const seconds = uptime % 60;
                            const uptimeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
                            // Use detected ports from running process if available, otherwise fall back to static ports
                            const displayPorts = p.detectedPorts && p.detectedPorts.length > 0 
                              ? p.detectedPorts 
                              : uniquePorts;
                            return (
                              <div key={p.pid} className="process-badge">
                                <span className="process-indicator">●</span>
                                <span className="process-pid">PID: {p.pid}</span>
                                <span className="process-uptime">{uptimeStr}</span>
                                {displayPorts.length > 0 && (
                                  <span className="process-port">:{displayPorts.join(', ')}</span>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onOpenTerminal) {
                                      onOpenTerminal(p.pid, script.name, project.name);
                                    }
                                  }}
                                  className="btn btn-secondary btn-tiny"
                                  title="View terminal output"
                                >
                                  <span className="terminal-icon">⌘</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStopScript(p.pid);
                                  }}
                                  className="btn btn-danger btn-tiny"
                                  title="Stop process"
                                >
                                  Stop
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="script-actions">
                      {!isRunning && (
                        <button
                          onClick={() => handleRunScript(script.name, true)}
                          className="btn btn-secondary btn-small"
                          title="Run in background"
                        >
                          Run
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {displaySettings.showJenkins && (
      <div className="jenkins-placeholder">
        <h3>Jenkins Integration</h3>
        <p className="placeholder-text">
          Jenkins integration will be available in a future update. This section will display
          Jenkins job statuses and build information for your projects.
        </p>
      </div>
      )}

      <div className="project-section">
        <h3>Project Settings</h3>
        <div className="project-settings-content">
          <div className="setting-group">
            <label htmlFor="scripts-path">Custom Script Scan Path</label>
            <p className="setting-hint">Optional: Relative path from project root where scripts are located. Can be a directory (e.g., "frontend", "packages/app") or a specific file (e.g., "src/package.json"). Leave empty to use project root.</p>
            {editingScriptsPath ? (
              <div className="setting-input-group">
                <input
                  id="scripts-path"
                  type="text"
                  value={scriptsPathInput}
                  onChange={(e) => setScriptsPathInput(e.target.value)}
                  onBlur={async () => {
                    await saveProjectSettingsFull({ scripts_path: scriptsPathInput.trim() || null });
                    setEditingScriptsPath(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      saveProjectSettingsFull({ scripts_path: scriptsPathInput.trim() || null });
                      setEditingScriptsPath(false);
                    } else if (e.key === 'Escape') {
                      setScriptsPathInput(projectSettings.scripts_path || '');
                      setEditingScriptsPath(false);
                    }
                  }}
                  placeholder="e.g., frontend, packages/app, src/package.json"
                  className="setting-input"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={async () => {
                    await saveProjectSettingsFull({ scripts_path: scriptsPathInput.trim() || null });
                    setEditingScriptsPath(false);
                  }}
                  className="btn btn-secondary btn-small"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScriptsPathInput(projectSettings.scripts_path || '');
                    setEditingScriptsPath(false);
                  }}
                  className="btn btn-secondary btn-small"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="setting-display" onClick={() => setEditingScriptsPath(true)}>
                <span className="setting-value">
                  {projectSettings.scripts_path || '(project root)'}
                </span>
                <span className="setting-edit-hint">Click to edit</span>
              </div>
            )}
          </div>

          <div className="setting-group">
            <label htmlFor="project-editor">Editor Override</label>
            <p className="setting-hint">Override the global editor setting for this project only. Leave as "Use Global" to use your default editor.</p>
            {editingProjectEditor ? (
              <div className="setting-input-group">
                <select
                  id="project-editor-type"
                  value={projectSettings.editor?.type || 'global'}
                  onChange={(e) => {
                    const newType = e.target.value === 'global' ? null : e.target.value;
                    setProjectSettings({
                      ...projectSettings,
                      editor: newType ? { type: newType, customPath: newType === 'custom' ? projectSettings.editor?.customPath || '' : null } : null,
                    });
                  }}
                  className="setting-select"
                >
                  <option value="global">Use Global</option>
                  <option value="vscode">VS Code</option>
                  <option value="cursor">Cursor</option>
                  <option value="windsurf">Windsurf</option>
                  <option value="zed">Zed</option>
                  <option value="custom">Custom</option>
                </select>
                {projectSettings.editor?.type === 'custom' && (
                  <input
                    type="text"
                    value={projectSettings.editor.customPath || ''}
                    onChange={(e) => {
                      setProjectSettings({
                        ...projectSettings,
                        editor: {
                          type: 'custom',
                          customPath: e.target.value,
                        },
                      });
                    }}
                    placeholder="Custom editor path"
                    className="setting-input"
                  />
                )}
                <button
                  type="button"
                  onClick={async () => {
                    await saveProjectSettingsFull({ editor: projectSettings.editor });
                    setEditingProjectEditor(false);
                  }}
                  className="btn btn-secondary btn-small"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await loadProjectSettingsFull();
                    setEditingProjectEditor(false);
                  }}
                  className="btn btn-secondary btn-small"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="setting-display" onClick={() => setEditingProjectEditor(true)}>
                <span className="setting-value">
                  {projectSettings.editor?.type 
                    ? (projectSettings.editor.type === 'custom' 
                        ? `Custom: ${projectSettings.editor.customPath || '(not set)'}`
                        : projectSettings.editor.type.charAt(0).toUpperCase() + projectSettings.editor.type.slice(1))
                    : 'Use Global'}
                </span>
                <span className="setting-edit-hint">Click to edit</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="project-section">
        <h3>Workspaces ({projectWorkspaces.length})</h3>
        {loadingWorkspaces ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Syncing workspaces and loading...</p>
          </div>
        ) : projectWorkspaces.length === 0 ? (
          <div className="empty-state">
            <p>This project is not referenced in any workspaces</p>
          </div>
        ) : (
          <div className="workspaces-list">
            {projectWorkspaces.map((ws) => (
              <div
                key={ws.id}
                className="workspace-item"
                onClick={() => {
                  if (onSelectWorkspace) {
                    onSelectWorkspace(ws);
                  }
                }}
              >
                <div className="workspace-item-header">
                  <h4 className="workspace-item-name">{ws.name}</h4>
                </div>
                {ws.description && (
                  <p className="workspace-item-description">{ws.description}</p>
                )}
                <p className="workspace-item-path">{ws.workspace_file_path}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {onRemoveProject && (
        <div className="danger-zone">
          <h3>Danger Zone</h3>
          <p className="danger-zone-text">Once you delete a project, there is no going back. Please be certain.</p>
          <button
            onClick={async () => {
              const confirmed = confirm(
                `Are you sure you want to remove "${project.name}"?\n\nThis will delete the project from PROJAX (not from your filesystem).\n\nThis action cannot be undone.`
              );
              if (confirmed) {
                await onRemoveProject(project.id);
              }
            }}
            className="btn btn-danger"
            title="Remove project"
          >
            Delete Project
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;

