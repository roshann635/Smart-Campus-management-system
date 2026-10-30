import { EnrollmentService } from '../services/enrollmentService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class EnrollmentController {
  static async getAll(req, res, next) {
    try {
      const { student_id, course_id, semester, academic_year } = req.query;

      // Student ownership enforcement
      let effectiveStudentId = student_id ? Number(student_id) : null;
      if (req.user && req.user.role === 'student') {
        effectiveStudentId = req.user.student_id;
      }

      const enrollments = await EnrollmentService.getEnrollments({
        student_id: effectiveStudentId,
        course_id: course_id ? Number(course_id) : null,
        semester: semester ? Number(semester) : null,
        academic_year,
      });

      return ApiResponse.success(res, { data: enrollments });
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const enrollment = await EnrollmentService.createEnrollment(
        req.body,
        req.user ? req.user.user_id : null,
        req.ip
      );
      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'Student enrolled in course successfully.',
        data: enrollment,
      });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const result = await EnrollmentService.deleteEnrollment(
        id,
        req.user ? req.user.user_id : null,
        req.ip
      );
      return ApiResponse.success(res, {
        message: 'Enrollment deleted.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

