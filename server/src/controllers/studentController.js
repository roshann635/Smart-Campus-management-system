import { StudentService } from '../services/studentService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class StudentController {
  static async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '', department_id, status } = req.query;
      const result = await StudentService.getStudents({
        page: Number(page),
        limit: Number(limit),
        search,
        department_id: department_id ? Number(department_id) : null,
        status,
      });

      return ApiResponse.success(res, {
        message: 'Students list retrieved.',
        data: result.students,
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const student = await StudentService.getStudentById(id);
      return ApiResponse.success(res, { data: student });
    } catch (err) {
      next(err);
    }
  }

  static async getDossier(req, res, next) {
    try {
      const { id } = req.params;
      const dossier = await StudentService.getAcademicDossier(id);
      return ApiResponse.success(res, { data: dossier });
    } catch (err) {
      next(err);
    }
  }

  static async getTranscript(req, res, next) {
    try {
      const { id } = req.params;
      const transcript = await StudentService.getOfficialTranscript(Number(id));
      return ApiResponse.success(res, { data: transcript });
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const student = await StudentService.createStudent(
        req.body,
        req.user ? req.user.user_id : null,
        req.ip
      );
      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'Student account and academic profile created successfully.',
        data: student,
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await StudentService.updateStudent(
        id,
        req.body,
        req.user ? req.user.user_id : null,
        req.ip
      );
      return ApiResponse.success(res, {
        message: 'Student profile updated.',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await StudentService.updateStatus(
        id,
        status,
        req.user ? req.user.user_id : null,
        req.ip
      );
      return ApiResponse.success(res, {
        message: `Student account marked as ${status}.`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

