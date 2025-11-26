import { Router } from 'express';
import { HealthController } from '../controllers/health.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', HealthController.getHealthData);
router.post('/', HealthController.createHealthData);
router.put('/:id', HealthController.updateHealthData);
router.delete('/:id', HealthController.deleteHealthData);

export default router;
