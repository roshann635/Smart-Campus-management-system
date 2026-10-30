import { Router } from 'express';
import { EnrollmentController } from '../controllers/enrollmentController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { validateRequest } from '../middleware/validate.js';
import { createEnrollmentSchema } from '../validators/enrollmentValidator.js';
import { idParamSchema } from '../validators/authValidator.js';

const router = Router();

router.use(requireAuth);

router.get('/', EnrollmentController.getAll);

// Admin-only enrollment management
router.post(
  '/',
  requireRoles('administrator'),
  validateRequest({ body: createEnrollmentSchema }),
  EnrollmentController.create
);

router.delete(
  '/:id',
  requireRoles('administrator'),
  validateRequest({ params: idParamSchema }),
  EnrollmentController.delete
);

export default router;

