import { TimetableService } from '../services/timetableService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class TimetableController {
  static async getTimetable(req, res, next) {
    try {
      const { department_id, semester, academic_year, faculty_id, student_id } = req.query;
      let effectiveFacultyId = faculty_id ? Number(faculty_id) : undefined;
      let effectiveStudentId = student_id ? Number(student_id) : undefined;

      // Personalize automatically if role is faculty or student
      if (req.user.role === 'faculty') {
        effectiveFacultyId = req.user.faculty_id;
      } else if (req.user.role === 'student') {
        effectiveStudentId = req.user.student_id;
      }

      const slots = await TimetableService.getTimetable({
        departmentId: department_id ? Number(department_id) : undefined,
        semester: semester ? Number(semester) : undefined,
        academicYear: academic_year || undefined,
        facultyId: effectiveFacultyId,
        studentId: effectiveStudentId,
      });

      return ApiResponse.success(res, { data: slots });
    } catch (err) {
      next(err);
    }
  }

  static async createSlot(req, res, next) {
    try {
      const { course_id, day_of_week, start_time, end_time, room_number, semester, academic_year } = req.body;

      const slot = await TimetableService.createSlot({
        courseId: Number(course_id),
        dayOfWeek: day_of_week,
        startTime: start_time,
        endTime: end_time,
        roomNumber: room_number,
        semester: Number(semester),
        academicYear: academic_year,
        actorUserId: req.user.user_id,
        ipAddress: req.ip,
      });

      return ApiResponse.created(res, {
        message: 'Timetable slot scheduled successfully.',
        data: slot,
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteSlot(req, res, next) {
    try {
      const slotId = Number(req.params.id);
      await TimetableService.deleteSlot(slotId, req.user.user_id, req.ip);

      return ApiResponse.success(res, {
        message: 'Timetable slot deleted successfully.',
      });
    } catch (err) {
      next(err);
    }
  }
}

