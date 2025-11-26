import { Router } from 'express';
import { GoalsController } from '../controllers/goals.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', GoalsController.getGoals);
router.post('/', GoalsController.createGoal);
router.put('/:id', GoalsController.updateGoal);
router.delete('/:id', GoalsController.deleteGoal);

router.get('/milestones', GoalsController.getMilestones);
router.post('/milestones', GoalsController.createMilestone);
router.put('/milestones/:id', GoalsController.updateMilestone);
router.delete('/milestones/:id', GoalsController.deleteMilestone);

export default router;
