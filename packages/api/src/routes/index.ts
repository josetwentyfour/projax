import { Router } from 'express';
import projectsRouter from './projects';
import settingsRouter from './settings';

const router = Router();

router.use('/projects', projectsRouter);
router.use('/settings', settingsRouter);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;

