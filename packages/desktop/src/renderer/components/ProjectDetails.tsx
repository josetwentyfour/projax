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
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  project,
  tests,
  onScan,
  scanning,
  onProjectUpdate,
}) => {
  const [editingName, setEditingName] = useState(false);
  const [projectName, setProjectName] = useState(project.name);
  const [scripts, setScripts] = useState<any>(null);
  const [loadingScripts, setLoadingScripts] = useState(false);
  const [ports, setPorts] = useState<any[]>([]);
  const [loadingPorts, setLoadingPorts] = useState(false);
  const [scanningPorts, setScanningPorts] = useState(false);
  const [runningScripts, setRunningScripts] = useState<Set<string>>(new Set());
  const [runningProcesses, setRunningProcesses] = useState<any[]>([]);
  const [loadingProcesses, setLoadingProcesses] = useState(false);

  useEffect(() => {
    setProjectName(project.name);
    loadScripts();
    loadPorts();
    loadRunningProcesses();
    
    // Refresh running processes every 5 seconds
    const interval = setInterval(() => {
      loadRunningProcesses();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [project]);

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

  const handleScanPorts = async () => {
    try {
      setScanningPorts(true);
      const projectPorts = await window.electronAPI.scanProjectPorts(project.id);
      setPorts(projectPorts);
    } catch (error) {
      console.error('Error scanning ports:', error);
      alert('Failed to scan ports');
    } finally {
      setScanningPorts(false);
    }
  };

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
          <p className="project-path">{project.path}</p>
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
            Open in Editor
          </button>
          <button
            onClick={handleScanPorts}
            disabled={scanningPorts}
            className="btn btn-secondary"
            title="Scan for ports"
          >
            {scanningPorts ? 'Scanning...' : 'Scan Ports'}
          </button>
        <button
          onClick={onScan}
          disabled={scanning}
          className="btn btn-primary"
        >
          {scanning ? 'Scanning...' : 'Scan for Tests'}
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

      {ports.length > 0 && (
        <div className="ports-section">
          <div className="section-header">
            <h3>Detected Ports ({ports.length})</h3>
            <button
              onClick={handleScanPorts}
              disabled={scanningPorts}
              className="btn btn-secondary btn-small"
            >
              {scanningPorts ? 'Scanning...' : 'Rescan'}
            </button>
          </div>
          <div className="ports-list">
            {ports.map((port) => (
              <div key={port.id} className="port-item">
                <div className="port-info">
                  <span className="port-number">{port.port}</span>
                  {port.script_name && (
                    <span className="port-script">({port.script_name})</span>
                  )}
                  <span className="port-source">{port.config_source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {allUrls.length > 0 && (
        <ProjectUrls urls={allUrls} onOpenUrl={handleOpenUrl} />
      )}

      {runningProcesses.length > 0 && (
        <div className="running-processes-section">
          <div className="section-header">
            <h3>Running Processes ({runningProcesses.length})</h3>
            <button
              onClick={handleStopAll}
              className="btn btn-danger btn-small"
              title="Stop all processes"
            >
              Stop All
            </button>
          </div>
          <div className="processes-list">
            {runningProcesses.map((process: any) => {
              const uptime = Math.floor((Date.now() - process.startedAt) / 1000);
              const minutes = Math.floor(uptime / 60);
              const seconds = uptime % 60;
              const uptimeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
              
              return (
                <div key={process.pid} className="process-item">
                  <div className="process-info">
                    <span className="process-name">{process.scriptName}</span>
                    <span className="process-pid">PID: {process.pid}</span>
                    <span className="process-uptime">Uptime: {uptimeStr}</span>
                  </div>
                  <button
                    onClick={() => handleStopScript(process.pid)}
                    className="btn btn-danger btn-small"
                    title="Stop process"
                  >
                    Stop
                  </button>
                </div>
              );
            })}
          </div>
        </div>
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
              {scripts.scripts.map((script: any) => (
                <div key={script.name} className="script-item">
                  <div className="script-info">
                    <span className="script-name">{script.name}</span>
                    <span className="script-command">{script.command}</span>
                    <span className="script-runner">{script.runner}</span>
                  </div>
                  <div className="script-actions">
                    {runningScripts.has(script.name) ? (
                      <>
                        <span className="running-indicator" title="Running">●</span>
                        {runningProcesses
                          .filter((p: any) => p.scriptName === script.name)
                          .map((p: any) => (
                            <button
                              key={p.pid}
                              onClick={() => handleStopScript(p.pid)}
                              className="btn btn-danger btn-small"
                              title="Stop script"
                            >
                              Stop
                            </button>
                          ))}
                      </>
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
              ))}
            </div>
          )}
        </div>
      )}

      {Object.keys(testsByFramework).length > 0 && (
        <div className="framework-breakdown">
          <h3>Framework Breakdown</h3>
          <div className="framework-list">
            {Object.entries(testsByFramework).map(([framework, count]) => (
              <div key={framework} className="framework-item">
                <span className="framework-name">{framework}</span>
                <span className="framework-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="tests-section">
        <h3>Test Files ({tests.length})</h3>
        {tests.length === 0 ? (
          <div className="no-tests">
            <p>No test files found. Click "Scan for Tests" to search for test files.</p>
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
    </div>
  );
};

export default ProjectDetails;

