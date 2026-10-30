import { Router } from 'express';
import { ExamController } from '../controllers/examController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles, requireStudentOwnership, requireCourseFacultyOwnership } from '../middleware/rbac.js';
import { validateRequest } from '../middleware/validate.js';
import { createExamSchema, bulkResultSchema } from '../validators/examValidator.js';
import { idParamSchema } from '../validators/authValidator.js';

const router = Router();

router.use(requireAuth);

// Exams
router.get('/', ExamController.getAll);
router.get('/:id', validateRequest({ params: idParamSchema }), ExamController.getById);

router.post(
  '/',
  requireRoles('administrator', 'faculty'),
  validateRequest({ body: createExamSchema }),
  requireCourseFacultyOwnership(),
  ExamController.create
);

export default router;

