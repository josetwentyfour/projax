import React, { useState, useEffect, useMemo } from 'react';
import { Project, Test, ProjectPort } from '../../types';
import './ProjectDetailsView.css';

interface ProjectDetailsViewProps {
  vscode: any;
}

interface Script {
  name: string;
  command: string;
  runner: string;
}

interface RunningProcess {
  pid: number;
  projectPath: string;
  scriptName: string;
  command: string;
  startedAt: number;
  detectedPorts?: number[];
  detectedUrls?: string[];
}

const ProjectDetailsView: React.FC<ProjectDetailsViewProps> = ({ vscode }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [ports, setPorts] = useState<ProjectPort[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [scripts, setScripts] = useState<{ type: string; scripts: Script[] } | null>(null);
  const [runningProcesses, setRunningProcesses] = useState<RunningProcess[]>([]);
  const [editingName, setEditingName] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [editingDescription, setEditingDescription] = useState(false);
  const [projectDescription, setProjectDescription] = useState('');
  const [editingTags, setEditingTags] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      console.log('[ProjectDetailsView] Received message:', message.command, message);
      switch (message.command) {
        case 'updateProject':
          if (message.project) {
            console.log('[ProjectDetailsView] Setting project:', message.project.name);
            setProject(message.project);
            setProjectName(message.project.name);
            setProjectDescription(message.project.description || '');
            setPorts(message.ports || []);
            setTags(message.tags || []);
            setScripts(message.scripts || null);
            setRunningProcesses(message.runningProcesses || []);
          } else {
            console.log('[ProjectDetailsView] No project in message');
            setProject(null);
          }
          break;
        case 'updateScripts':
          setScripts(message.scripts);
          break;
        case 'updateRunningProcesses':
          setRunningProcesses(message.processes || []);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    console.log('[ProjectDetailsView] Component mounted, waiting for messages...');
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleRename = () => {
    if (!project || !projectName.trim() || projectName === project.name) {
      setEditingName(false);
      setProjectName(project?.name || '');
      return;
    }
    vscode.postMessage({
      command: 'editName',
      projectId: project.id,
      name: projectName.trim(),
    });
    setEditingName(false);
  };

  const handleUpdateDescription = () => {
    if (!project) return;
    const newDescription = projectDescription.trim() || null;
    if (newDescription === (project.description || '')) {
      setEditingDescription(false);
      setProjectDescription(project.description || '');
      return;
    }
    vscode.postMessage({
      command: 'editDescription',
      projectId: project.id,
      description: newDescription,
    });
    setEditingDescription(false);
  };

  const handleAddTag = () => {
    if (!project) return;
    const newTag = tagInput.trim();
    if (!newTag || project.tags?.includes(newTag)) {
      setTagInput('');
      return;
    }
    const updatedTags = [...(project.tags || []), newTag];
    vscode.postMessage({
      command: 'editTags',
      projectId: project.id,
      tags: updatedTags,
    });
    setTagInput('');
    setEditingTags(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!project) return;
    const updatedTags = (project.tags || []).filter(tag => tag !== tagToRemove);
    vscode.postMessage({
      command: 'editTags',
      projectId: project.id,
      tags: updatedTags,
    });
  };

  const handleRunScript = (scriptName: string) => {
    if (!project) return;
    vscode.postMessage({
      command: 'runScript',
      projectPath: project.path,
      scriptName,
    });
  };

  const handleStopScript = (pid: number) => {
    vscode.postMessage({
      command: 'stopScript',
      pid,
    });
  };

  const handleOpenUrl = (url: string) => {
    vscode.postMessage({
      command: 'openUrl',
      url,
    });
  };

  const handleDelete = () => {
    if (!project) return;
    vscode.postMessage({
      command: 'deleteProject',
      projectId: project.id,
    });
  };

  const allUrls = useMemo(() => {
    const urls = new Set<string>();
    for (const process of runningProcesses) {
      if (process.detectedUrls) {
        for (const url of process.detectedUrls) {
          urls.add(url);
        }
      }
    }
    for (const portInfo of ports) {
      urls.add(`http://localhost:${portInfo.port}`);
    }
    return Array.from(urls).sort();
  }, [runningProcesses, ports]);

  const suggestedTags = tags.filter(tag => 
    !project?.tags?.includes(tag) && 
    tag.toLowerCase().includes(tagInput.toLowerCase())
  );

  if (!project) {
    return (
      <div className="project-details-empty">
        <p>No project selected</p>
        <p className="hint">Select a project from the PROJAX Projects panel</p>
      </div>
    );
  }

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

      <div className="tags-section">
        <div className="section-header">
          <h3>Tags</h3>
        </div>
        <div className="tags-content">
          <div className="tags-list">
            {(project.tags || []).map((tag) => (
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
        <div className="urls-section">
          <div className="section-header">
            <h3>Detected URLs</h3>
          </div>
          <div className="urls-list">
            {allUrls.map((url) => (
              <button
                key={url}
                className="url-item"
                onClick={() => handleOpenUrl(url)}
              >
                {url}
              </button>
            ))}
          </div>
        </div>
      )}

      {scripts && (
        <div className="scripts-section">
          <div className="section-header">
            <h3>Available Scripts ({scripts.scripts.length})</h3>
            <span className="project-type-badge">{scripts.type}</span>
          </div>
          {scripts.scripts.length === 0 ? (
            <div className="no-scripts">No scripts found in this project.</div>
          ) : (
            <div className="scripts-list">
              {scripts.scripts.map((script) => {
                const scriptProcesses = runningProcesses.filter((p) => p.scriptName === script.name);
                const isRunning = scriptProcesses.length > 0;
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
                          {scriptProcesses.map((p) => {
                            const uptime = Math.floor((Date.now() - p.startedAt) / 1000);
                            const minutes = Math.floor(uptime / 60);
                            const seconds = uptime % 60;
                            const uptimeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
                            return (
                              <div key={p.pid} className="process-badge">
                                <span className="process-indicator">●</span>
                                <span className="process-pid">PID: {p.pid}</span>
                                <span className="process-uptime">{uptimeStr}</span>
                                {p.detectedPorts && p.detectedPorts.length > 0 && (
                                  <span className="process-port">:{p.detectedPorts.join(', ')}</span>
                                )}
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
                          onClick={() => handleRunScript(script.name)}
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

      <div className="danger-zone">
        <h3>Danger Zone</h3>
        <p className="danger-zone-text">Once you delete a project, there is no going back. Please be certain.</p>
        <button
          onClick={handleDelete}
          className="btn btn-danger"
          title="Remove project"
        >
          Delete Project
        </button>
      </div>
    </div>
  );
};

export default ProjectDetailsView;

