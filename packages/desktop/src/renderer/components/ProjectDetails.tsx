import React, { useState, useEffect, useMemo } from 'react';
// Note: Renderer runs in browser context, types only
type Project = any;
type Test = any;
import { ElectronAPI } from '../../main/preload';
import ProjectUrls from './ProjectUrls';
import './ProjectDetails.css';

interface ProjectDetailsProps {
  project: Project;
  tests: Test[];
  onScan: () => void;
  scanning: boolean;
  onProjectUpdate?: (project: Project) => void;
  onRemoveProject?: (projectId: number) => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project,
  tests,
  onScan,
  scanning,
  onProjectUpdate,
  onRemoveProject,
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

  useEffect(() => {
    setProjectName(project.name);
    setProjectDescription(project.description || '');
    setProjectTags(project.tags || []);
    loadScripts();
    loadPorts();
    loadRunningProcesses();
    loadAllTags();
    loadEditorSettings();
    
    // Refresh running processes every 5 seconds
    const interval = setInterval(() => {
      loadRunningProcesses();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [project]);

  const loadAllTags = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/projects/tags');
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
      const projectScripts = await window.electronAPI.getProjectScripts(project.path);
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
      await window.electronAPI.runScript(project.path, scriptName, [], background);
      if (background) {
        // Refresh processes after a short delay
        setTimeout(() => {
          loadRunningProcesses();
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

  const lastScanned = project.last_scanned
    ? new Date(project.last_scanned * 1000).toLocaleString()
    : 'Never';

  const testsByFramework = tests.reduce((acc, test) => {
    const framework = test.framework || 'unknown';
    acc[framework] = (acc[framework] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="project-details">
      <div className="project-details-header">
        <div>
          {editingName ? (
            <div className="project-name-edit">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
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
                placeholder="Add a description..."
                autoFocus
                rows={2}
              />
            </div>
          ) : (
            <div>
              <p 
                className="project-description" 
                onClick={() => setEditingDescription(true)}
                title="Click to edit description"
              >
                {project.description || project.path}
              </p>
              {project.description && (
          <p className="project-path">{project.path}</p>
              )}
            </div>
          )}
        </div>
        <div className="header-actions-group">
          <button
            onClick={async () => {
              try {
                await window.electronAPI.openInEditor(project.path);
              } catch (error) {
                console.error('Error opening in editor:', error);
                alert(`Failed to open in editor: ${error instanceof Error ? error.message : String(error)}`);
              }
            }}
            className="btn btn-secondary"
            title="Open in editor"
          >
            Editor{editorSettings ? ` (${editorSettings.type})` : ''}
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

      <div className="project-stats">
        <div className="stat-card">
          <div className="stat-value">{tests.length}</div>
          <div className="stat-label">Test Files</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{Object.keys(testsByFramework).length}</div>
          <div className="stat-label">Frameworks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{ports.length}</div>
          <div className="stat-label">Ports</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{scripts?.scripts?.length || 0}</div>
          <div className="stat-label">Scripts</div>
        </div>
      </div>

      {/* Tags Section */}
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
                  placeholder="Add tag..."
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

      {allUrls.length > 0 && (
        <ProjectUrls urls={allUrls} onOpenUrl={handleOpenUrl} />
      )}

      

      {scripts && (
        <div className="scripts-section">
          <div className="section-header">
            <h3>Available Scripts ({scripts.scripts.length})</h3>
            <span className="project-type-badge">{scripts.type}</span>
          </div>
          {loadingScripts ? (
            <div className="loading-state">Loading scripts...</div>
          ) : scripts.scripts.length === 0 ? (
            <div className="no-scripts">No scripts found in this project.</div>
          ) : (
            <div className="scripts-list">
              {scripts.scripts.map((script: any) => {
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
                            return (
                              <div key={p.pid} className="process-badge">
                                <span className="process-indicator">●</span>
                                <span className="process-pid">PID: {p.pid}</span>
                                <span className="process-uptime">{uptimeStr}</span>
                                {uniquePorts.length > 0 && (
                                  <span className="process-port">:{uniquePorts.join(', ')}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="script-actions">
                      {isRunning ? (
                        scriptProcesses.map((p: any) => (
                          <button
                            key={p.pid}
                            onClick={() => handleStopScript(p.pid)}
                            className="btn btn-danger btn-small"
                            title="Stop process"
                          >
                            Stop
                          </button>
                        ))
                      ) : (
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

      <div className="tests-section">
        <div className="section-header">
          <h3>Test Files ({tests.length})</h3>
          <button
            onClick={onScan}
            disabled={scanning}
            className="btn btn-primary btn-small"
          >
            {scanning ? 'Scanning...' : 'Scan'}
          </button>
        </div>
        {tests.length === 0 ? (
          <div className="no-tests">
            <p>No test files found. Click "Scan" to search for test files.</p>
          </div>
        ) : (
          <div className="tests-list">
            {tests.map((test) => (
              <div key={test.id} className="test-item">
                <div className="test-file">
                  <span className="test-path">{test.file_path}</span>
                  {test.framework && (
                    <span className="test-framework">{test.framework}</span>
                  )}
                </div>
                {test.status && (
                  <div className="test-status">{test.status}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="jenkins-placeholder">
        <h3>Jenkins Integration</h3>
        <p className="placeholder-text">
          Jenkins integration will be available in a future update. This section will display
          Jenkins job statuses and build information for your projects.
        </p>
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

