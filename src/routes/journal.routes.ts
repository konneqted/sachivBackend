import { Router } from 'express';
import { JournalController } from '../controllers/journal.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', JournalController.getEntries);
router.post('/', JournalController.createEntry);
router.put('/:id', JournalController.updateEntry);
router.delete('/:id', JournalController.deleteEntry);

export default router;
