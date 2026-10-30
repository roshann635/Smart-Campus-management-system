import { Router } from 'express';
import { SystemController } from '../controllers/systemController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();

// Public / Evaluator diagnostics endpoint
router.get('/diagnostics', SystemController.getDiagnostics);

// Academic alerts (available to authenticated admins and faculty)
router.get(
  '/academic-alerts',
  requireAuth,
  requireRoles('administrator', 'faculty'),
  SystemController.getAcademicAlerts
);

export default router;

