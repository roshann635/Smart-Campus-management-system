import { Router } from 'express';
import { StudentController } from '../controllers/studentController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles, requireStudentOwnership } from '../middleware/rbac.js';
import { validateRequest } from '../middleware/validate.js';
import { createStudentSchema, updateStudentSchema, updateStatusSchema } from '../validators/studentValidator.js';
import { idParamSchema } from '../validators/authValidator.js';

const router = Router();

router.use(requireAuth);

// Admin & Faculty can browse student roster
router.get('/', requireRoles('administrator', 'faculty'), StudentController.getAll);

// Individual profile view with strict ownership isolation
router.get(
  '/:id',
  validateRequest({ params: idParamSchema }),
  requireStudentOwnership('id'),
  StudentController.getById
);

router.get(
  '/:id/dossier',
  validateRequest({ params: idParamSchema }),
  requireStudentOwnership('id'),
  StudentController.getDossier
);

router.get(
  '/:id/transcript',
  validateRequest({ params: idParamSchema }),
  requireStudentOwnership('id'),
  StudentController.getTranscript
);

// Admin-only management
router.post(
  '/',
  requireRoles('administrator'),
  validateRequest({ body: createStudentSchema }),
  StudentController.create
);

router.put(
  '/:id',
  requireRoles('administrator'),
  validateRequest({ params: idParamSchema, body: updateStudentSchema }),
  StudentController.update
);

router.patch(
  '/:id/status',
  requireRoles('administrator'),
  validateRequest({ params: idParamSchema, body: updateStatusSchema }),
  StudentController.updateStatus
);

export default router;

