import { Router } from 'express';
import projectsRouter from './projects';
import settingsRouter from './settings';
import workspacesRouter from './workspaces';
import backupRouter from './backup';
import mcpRouter from './mcp';

const router = Router();

router.use('/projects', projectsRouter);
router.use('/settings', settingsRouter);
router.use('/workspaces', workspacesRouter);
router.use('/backup', backupRouter);
router.use('/mcp', mcpRouter);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;

