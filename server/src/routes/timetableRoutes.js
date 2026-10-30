import { Router } from 'express';
import { TimetableController } from '../controllers/timetableController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();

router.use(requireAuth);

router.get('/', TimetableController.getTimetable);
router.post('/', requireRoles('administrator'), TimetableController.createSlot);
router.delete('/:id', requireRoles('administrator'), TimetableController.deleteSlot);

export default router;

