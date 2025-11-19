import React from 'react';
import './ProjectUrls.css';

interface ProjectUrlsProps {
  urls: string[];
  onOpenUrl: (url: string) => void;
}

const ProjectUrls: React.FC<ProjectUrlsProps> = ({ urls, onOpenUrl }) => {
  if (urls.length === 0) {
    return null;
  }

  return (
    <div className="project-urls-section">
      <div className="section-header">
        <h3>Detected URLs ({urls.length})</h3>
      </div>
      <div className="urls-list">
        {urls.map((url, index) => (
          <div key={index} className="url-item">
            <span className="url-text">{url}</span>
            <button
              onClick={() => onOpenUrl(url)}
              className="btn btn-secondary btn-small"
              title="Open in browser"
            >
              Open
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectUrls;

