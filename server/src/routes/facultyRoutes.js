import { Router } from 'express';
import { FacultyController } from '../controllers/facultyController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { validateRequest } from '../middleware/validate.js';
import { createFacultySchema, updateFacultySchema } from '../validators/facultyValidator.js';
import { updateStatusSchema } from '../validators/studentValidator.js';
import { idParamSchema } from '../validators/authValidator.js';

const router = Router();

router.use(requireAuth);

router.get('/', requireRoles('administrator', 'faculty'), FacultyController.getAll);
router.get('/:id', validateRequest({ params: idParamSchema }), FacultyController.getById);

// Admin-only management
router.post(
  '/',
  requireRoles('administrator'),
  validateRequest({ body: createFacultySchema }),
  FacultyController.create
);

router.put(
  '/:id',
  requireRoles('administrator'),
  validateRequest({ params: idParamSchema, body: updateFacultySchema }),
  FacultyController.update
);

router.patch(
  '/:id/status',
  requireRoles('administrator'),
  validateRequest({ params: idParamSchema, body: updateStatusSchema }),
  FacultyController.updateStatus
);

export default router;

