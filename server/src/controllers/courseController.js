import { CourseService } from '../services/courseService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class CourseController {
  static async getAll(req, res, next) {
    try {
      const { department_id, semester, faculty_id, search } = req.query;

      // If user is faculty and requesting their own courses, filter appropriately if required
      let effectiveFacultyId = faculty_id ? Number(faculty_id) : null;
      if (req.user && req.user.role === 'faculty' && !faculty_id && req.query.mine === 'true') {
        effectiveFacultyId = req.user.faculty_id;
      }

      const courses = await CourseService.getCourses({
        department_id: department_id ? Number(department_id) : null,
        semester: semester ? Number(semester) : null,
        faculty_id: effectiveFacultyId,
        search,
      });

      return ApiResponse.success(res, { data: courses });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const course = await CourseService.getCourseById(id);
      return ApiResponse.success(res, { data: course });
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const course = await CourseService.createCourse(
        req.body,
        req.user ? req.user.user_id : null,
        req.ip
      );
      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'Course created successfully.',
        data: course,
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await CourseService.updateCourse(
        id,
        req.body,
        req.user ? req.user.user_id : null,
        req.ip
      );
      return ApiResponse.success(res, {
        message: 'Course updated successfully.',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const result = await CourseService.deleteCourse(
        id,
        req.user ? req.user.user_id : null,
        req.ip
      );
      return ApiResponse.success(res, {
        message: 'Course deleted successfully.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

