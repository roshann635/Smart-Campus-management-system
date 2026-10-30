import { Router } from 'express';
import { DepartmentController } from '../controllers/departmentController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { validateRequest } from '../middleware/validate.js';
import { createDepartmentSchema, updateDepartmentSchema } from '../validators/departmentValidator.js';
import { idParamSchema } from '../validators/authValidator.js';

const router = Router();

router.use(requireAuth);

router.get('/', DepartmentController.getAll);
router.get('/:id', validateRequest({ params: idParamSchema }), DepartmentController.getById);

// Admin-only mutations
router.post(
  '/',
  requireRoles('administrator'),
  validateRequest({ body: createDepartmentSchema }),
  DepartmentController.create
);

router.put(
  '/:id',
  requireRoles('administrator'),
  validateRequest({ params: idParamSchema, body: updateDepartmentSchema }),
  DepartmentController.update
);

router.delete(
  '/:id',
  requireRoles('administrator'),
  validateRequest({ params: idParamSchema }),
  DepartmentController.delete
);

export default router;

