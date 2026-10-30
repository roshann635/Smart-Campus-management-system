import { AttendanceService } from '../services/attendanceService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AttendanceController {
  static async getByCourse(req, res, next) {
    try {
      const { courseId } = req.params;
      const { date } = req.query;
      const attendance = await AttendanceService.getAttendanceByCourse(courseId, date);
      return ApiResponse.success(res, { data: attendance });
    } catch (err) {
      next(err);
    }
  }

  static async getByStudent(req, res, next) {
    try {
      const { studentId } = req.params;
      const { courseId } = req.query;

      // Ownership enforcement: if student, can only view own records
      if (req.user.role === 'student' && String(req.user.student_id) !== String(studentId)) {
        return ApiResponse.error(res, {
          statusCode: 403,
          code: 'FORBIDDEN',
          message: 'Forbidden: You can only view your own attendance records.',
        });
      }

      const attendance = await AttendanceService.getAttendanceByStudent(studentId, courseId);
      return ApiResponse.success(res, { data: attendance });
    } catch (err) {
      next(err);
    }
  }

  static async submitBulk(req, res, next) {
    try {
      const { course_id, attendance_date, records } = req.body;
      const result = await AttendanceService.markBulkAttendance(
        { course_id, attendance_date, records },
        req.user.user_id,
        req.ip
      );
      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'Daily attendance successfully recorded.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

