import { Router } from 'express';
import { AuditLogController } from '../controllers/auditLogController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();

router.use(requireAuth);
router.use(requireRoles('administrator'));

router.get('/', AuditLogController.getAll);

export default router;

