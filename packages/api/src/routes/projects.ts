import { Router, Request, Response } from 'express';
import { getDatabase } from '../database';
import { scanProject, scanAllProjects } from '../services/scanner';
import * as path from 'path';
import * as fs from 'fs';

const router = Router();
const db = getDatabase();

// GET /api/projects - List all projects
router.get('/', (req: Request, res: Response) => {
  try {
    const projects = db.getAllProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// POST /api/projects - Add a new project
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, path: projectPath } = req.body;
    
    if (!name || !projectPath) {
      return res.status(400).json({ error: 'Name and path are required' });
    }
    
    const resolvedPath = path.resolve(projectPath);
    
    if (!fs.existsSync(resolvedPath)) {
      return res.status(400).json({ error: 'Path does not exist' });
    }
    
    if (!fs.statSync(resolvedPath).isDirectory()) {
      return res.status(400).json({ error: 'Path must be a directory' });
    }
    
    const existing = db.getProjectByPath(resolvedPath);
    if (existing) {
      return res.status(409).json({ error: 'Project with this path already exists', project: existing });
    }
    
    const project = db.addProject(name, resolvedPath);
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to add project' });
  }
});

// GET /api/projects/:id - Get project details
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    
    const project = db.getProject(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    
    const { name } = req.body;
    if (name !== undefined) {
      const updated = db.updateProjectName(id, name);
      res.json(updated);
    } else {
      res.status(400).json({ error: 'Name is required' });
    }
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to update project' });
  }
});

// DELETE /api/projects/:id - Remove project
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    
    const project = db.getProject(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    db.removeProject(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove project' });
  }
});

// GET /api/projects/:id/tests - Get tests for project
router.get('/:id/tests', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    
    const project = db.getProject(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const tests = db.getTestsByProject(id);
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
});

// GET /api/projects/:id/ports - Get project ports
router.get('/:id/ports', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    
    const project = db.getProject(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const ports = db.getProjectPorts(id);
    res.json(ports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ports' });
  }
});

// POST /api/projects/:id/scan - Scan project for tests
router.post('/:id/scan', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    
    const result = scanProject(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to scan project' });
  }
});

// POST /api/projects/scan/all - Scan all projects
router.post('/scan/all', (req: Request, res: Response) => {
  try {
    const results = scanAllProjects();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to scan projects' });
  }
});

export default router;

