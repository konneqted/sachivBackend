import { Router } from 'express';
import authRoutes from './auth.routes.js';
import tasksRoutes from './tasks.routes.js';
import journalRoutes from './journal.routes.js';
import habitsRoutes from './habits.routes.js';
import healthRoutes from './health.routes.js';
import goalsRoutes from './goals.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tasks', tasksRoutes);
router.use('/journal', journalRoutes);
router.use('/habits', habitsRoutes);
router.use('/health', healthRoutes);
router.use('/goals', goalsRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
