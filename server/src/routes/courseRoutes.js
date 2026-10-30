import { Router } from 'express';
import { CourseController } from '../controllers/courseController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { validateRequest } from '../middleware/validate.js';
import { createCourseSchema, updateCourseSchema } from '../validators/courseValidator.js';
import { idParamSchema } from '../validators/authValidator.js';

const router = Router();

router.use(requireAuth);

router.get('/', CourseController.getAll);
router.get('/:id', validateRequest({ params: idParamSchema }), CourseController.getById);

// Admin-only management
router.post(
  '/',
  requireRoles('administrator'),
  validateRequest({ body: createCourseSchema }),
  CourseController.create
);

router.put(
  '/:id',
  requireRoles('administrator'),
  validateRequest({ params: idParamSchema, body: updateCourseSchema }),
  CourseController.update
);

router.delete(
  '/:id',
  requireRoles('administrator'),
  validateRequest({ params: idParamSchema }),
  CourseController.delete
);

export default router;

