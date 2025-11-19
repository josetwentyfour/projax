import React, { useState } from 'react';
import './AddProjectModal.css';

interface AddProjectModalProps {
  onAdd: (path: string) => Promise<void>;
  onClose: () => void;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ onAdd, onClose }) => {
  const [path, setPath] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSelectDirectory = async () => {
    try {
      const selectedPath = await window.electronAPI.selectDirectory();
      if (selectedPath) {
        setPath(selectedPath);
      }
    } catch (error) {
      console.error('Error selecting directory:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!path.trim()) {
      alert('Please select a project directory');
      return;
    }

    try {
      setLoading(true);
      await onAdd(path);
    } catch (error) {
      // Error is handled in parent component
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Project</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="project-path">Project Directory</label>
            <div className="path-input-group">
              <input
                id="project-path"
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="Select or enter project directory path"
                disabled={loading}
              />
              <button
                type="button"
                onClick={handleSelectDirectory}
                disabled={loading}
                className="btn btn-secondary"
              >
                Browse
              </button>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !path.trim()}
              className="btn btn-primary"
            >
              {loading ? 'Adding...' : 'Add Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectModal;

