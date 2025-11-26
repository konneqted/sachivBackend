import { Router } from 'express';
import { HabitsController } from '../controllers/habits.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', HabitsController.getHabits);
router.post('/', HabitsController.createHabit);
router.put('/:id', HabitsController.updateHabit);
router.delete('/:id', HabitsController.deleteHabit);

router.get('/logs', HabitsController.getLogs);
router.post('/logs', HabitsController.createLog);
router.put('/logs/:id', HabitsController.updateLog);
router.delete('/logs/:id', HabitsController.deleteLog);

export default router;
