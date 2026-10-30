import { Router } from 'express';
import { LeaveController } from '../controllers/leaveController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRoles('student'), LeaveController.submitLeave);
router.get('/', LeaveController.getLeaves);
router.patch('/:id/review', requireRoles('administrator', 'faculty'), LeaveController.reviewLeave);

export default router;

