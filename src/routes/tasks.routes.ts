import { Router } from 'express';
import { TasksController } from '../controllers/tasks.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', TasksController.getTasks);
router.post('/', TasksController.createTask);
router.put('/:id', TasksController.updateTask);
router.delete('/:id', TasksController.deleteTask);

export default router;
