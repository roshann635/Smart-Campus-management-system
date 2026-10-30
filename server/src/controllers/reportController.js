import { ReportService } from '../services/reportService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { streamCSVResponse } from '../utils/csvExporter.js';

export class ReportController {
  static async getAttendance(req, res, next) {
    try {
      const { course_id, department_id, min_percentage, max_percentage } = req.query;
      const data = await ReportService.getAttendanceReport({
        course_id: course_id ? Number(course_id) : null,
        department_id: department_id ? Number(department_id) : null,
        min_percentage: min_percentage ? parseFloat(min_percentage) : null,
        max_percentage: max_percentage ? parseFloat(max_percentage) : null,
      });
      return ApiResponse.success(res, { data });
    } catch (err) {
      next(err);
    }
  }

  static async getPerformance(req, res, next) {
    try {
      const { course_id } = req.query;
      const data = await ReportService.getPerformanceReport({
        course_id: course_id ? Number(course_id) : null,
      });
      return ApiResponse.success(res, { data });
    } catch (err) {
      next(err);
    }
  }

  static async getDepartments(req, res, next) {
    try {
      const data = await ReportService.getDepartmentMetrics();
      return ApiResponse.success(res, { data });
    } catch (err) {
      next(err);
    }
  }

  static async getAtRisk(req, res, next) {
    try {
      const { department_id, risk_category } = req.query;
      const facultyId = req.user.role === 'faculty' ? req.user.faculty_id : null;

      const data = await ReportService.getAtRiskStudentsReport({
        facultyId,
        departmentId: department_id ? Number(department_id) : null,
        riskCategory: risk_category || null,
      });

      return ApiResponse.success(res, { data });
    } catch (err) {
      next(err);
    }
  }

  static async notifyAtRisk(req, res, next) {
    try {
      const { student_ids } = req.body || {};
      const facultyId = req.user.role === 'faculty' ? req.user.faculty_id : null;

      const result = await ReportService.notifyAtRiskStudents({
        studentIds: student_ids,
        facultyId,
        actorUserId: req.user.user_id,
        ipAddress: req.ip,
      });

      return ApiResponse.success(res, {
        message: `Intervention notifications dispatched to ${result.notifiedCount} student(s).`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async exportCSV(req, res, next) {
    try {
      const { reportType } = req.params;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      if (reportType === 'at-risk') {
        const facultyId = req.user.role === 'faculty' ? req.user.faculty_id : null;
        const data = await ReportService.getAtRiskStudentsReport({ facultyId, ...req.query });
        const filename = `at_risk_students_${timestamp}.csv`;
        return streamCSVResponse(res, filename, data, [
          'student_id',
          'roll_number',
          'student_name',
          'email',
          'department_name',
          'course_code',
          'course_name',
          'attendance_percentage',
          'average_exam_percentage',
          'risk_category',
        ]);
      }

      if (reportType === 'attendance') {
        const data = await ReportService.getAttendanceReport(req.query);
        const filename = `attendance_report_${timestamp}.csv`;
        return streamCSVResponse(res, filename, data, [
          'student_id',
          'roll_number',
          'student_name',
          'course_code',
          'course_name',
          'semester',
          'academic_year',
          'total_classes',
          'classes_attended',
          'attendance_percentage',
        ]);
      }

      if (reportType === 'performance') {
        const data = await ReportService.getPerformanceReport(req.query);
        const filename = `course_performance_report_${timestamp}.csv`;
        return streamCSVResponse(res, filename, data, [
          'course_code',
          'course_name',
          'exam_name',
          'exam_type',
          'exam_date',
          'max_marks',
          'total_students_graded',
          'average_marks',
          'highest_marks',
          'lowest_marks',
          'pass_count',
          'pass_percentage',
        ]);
      }

      if (reportType === 'departments') {
        const data = await ReportService.getDepartmentMetrics();
        const filename = `department_metrics_${timestamp}.csv`;
        return streamCSVResponse(res, filename, data, [
          'department_id',
          'department_code',
          'department_name',
          'total_active_students',
          'total_active_faculty',
          'total_courses',
        ]);
      }

      return ApiResponse.error(res, {
        statusCode: 400,
        code: 'INVALID_REPORT_TYPE',
        message: `Unknown report type '${reportType}'. Valid types: attendance, performance, departments.`,
      });
    } catch (err) {
      next(err);
    }
  }
}

