import React from 'react';
// Note: Renderer runs in browser context, types only
type Project = any;
import './ProjectList.css';

interface ProjectListProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  onRemoveProject: (projectId: number) => void;
  onScanProject: (projectId: number) => void;
  loading: boolean;
  scanning: boolean;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  selectedProject,
  onSelectProject,
  onRemoveProject,
  onScanProject,
  loading,
  scanning,
}) => {
  if (loading) {
    return (
      <div className="project-list-loading">
        <p>Loading projects...</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="project-list-empty">
        <p>No projects yet</p>
        <p className="hint">Add a project to get started</p>
      </div>
    );
  }

  return (
    <div className="project-list">
      {projects.map((project) => {
        const isSelected = selectedProject?.id === project.id;
        const lastScanned = project.last_scanned
          ? new Date(project.last_scanned * 1000).toLocaleString()
          : 'Never';

        return (
          <div
            key={project.id}
            className={`project-item ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelectProject(project)}
          >
            <div className="project-item-header">
              <h3 className="project-name">{project.name}</h3>
              <button
                className="project-remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveProject(project.id);
                }}
                title="Remove project"
              >
                ×
              </button>
            </div>
            <p className="project-path">{project.path}</p>
            <div className="project-meta">
              <span className="project-scanned">Scanned: {lastScanned}</span>
              <button
                className="project-scan-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onScanProject(project.id);
                }}
                disabled={scanning}
                title="Scan for tests"
              >
                {scanning ? '...' : 'SCAN'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProjectList;

