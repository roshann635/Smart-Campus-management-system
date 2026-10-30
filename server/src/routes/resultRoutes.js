import { Router } from 'express';
import { ExamController } from '../controllers/examController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles, requireStudentOwnership } from '../middleware/rbac.js';
import { validateRequest } from '../middleware/validate.js';
import { bulkResultSchema } from '../validators/examValidator.js';
import { query } from '../config/db.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

router.use(requireAuth);

router.get(
  '/exam/:examId',
  requireRoles('administrator', 'faculty'),
  async (req, res, next) => {
    // If faculty, verify course instructor
    if (req.user.role === 'faculty') {
      const [rows] = await query(
        `SELECT c.faculty_id FROM exams ex JOIN courses c ON ex.course_id = c.course_id WHERE ex.exam_id = ?`,
        [req.params.examId]
      );
      if (rows.length === 0 || Number(rows[0].faculty_id) !== Number(req.user.faculty_id)) {
        return ApiResponse.error(res, {
          statusCode: 403,
          code: 'FORBIDDEN_COURSE_UNASSIGNED',
          message: 'Forbidden: You are not assigned as the instructor for this exam\'s course.',
        });
      }
    }
    next();
  },
  ExamController.getResultsByExam
);

router.get(
  '/student/:studentId',
  requireStudentOwnership('studentId'),
  ExamController.getResultsByStudent
);

router.post(
  '/bulk',
  requireRoles('administrator', 'faculty'),
  validateRequest({ body: bulkResultSchema }),
  async (req, res, next) => {
    if (req.user.role === 'faculty') {
      const [rows] = await query(
        `SELECT c.faculty_id FROM exams ex JOIN courses c ON ex.course_id = c.course_id WHERE ex.exam_id = ?`,
        [req.body.exam_id]
      );
      if (rows.length === 0 || Number(rows[0].faculty_id) !== Number(req.user.faculty_id)) {
        return ApiResponse.error(res, {
          statusCode: 403,
          code: 'FORBIDDEN_COURSE_UNASSIGNED',
          message: 'Forbidden: You are not assigned to instruct this course.',
        });
      }
    }
    next();
  },
  ExamController.submitBulkResults
);

export default router;

