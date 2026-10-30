import { Router } from 'express';
import { AttendanceController } from '../controllers/attendanceController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles, requireStudentOwnership, requireCourseFacultyOwnership } from '../middleware/rbac.js';
import { validateRequest } from '../middleware/validate.js';
import { bulkAttendanceSchema } from '../validators/attendanceValidator.js';
import { idParamSchema } from '../validators/authValidator.js';

const router = Router();

router.use(requireAuth);

router.get(
  '/course/:courseId',
  requireRoles('administrator', 'faculty'),
  requireCourseFacultyOwnership(),
  AttendanceController.getByCourse
);

router.get(
  '/student/:studentId',
  requireStudentOwnership('studentId'),
  AttendanceController.getByStudent
);

router.post(
  '/bulk',
  requireRoles('administrator', 'faculty'),
  validateRequest({ body: bulkAttendanceSchema }),
  requireCourseFacultyOwnership(),
  AttendanceController.submitBulk
);

export default router;

