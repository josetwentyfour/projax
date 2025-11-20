import { Router, Request, Response } from 'express';
import { getDatabase } from '../database';

const router = Router();

// GET /api/settings - Get all settings
router.get('/', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const settings = db.getAllSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/settings/:key - Update a setting
router.put('/:key', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { key } = req.params;
    const { value } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }
    
    db.setSetting(key, String(value));
    res.json({ key, value });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

export default router;

