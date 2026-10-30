import { FacultyService } from '../services/facultyService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class FacultyController {
  static async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '', department_id, status } = req.query;
      const result = await FacultyService.getFaculty({
        page: Number(page),
        limit: Number(limit),
        search,
        department_id: department_id ? Number(department_id) : null,
        status,
      });

      return ApiResponse.success(res, {
        message: 'Faculty list retrieved.',
        data: result.faculty,
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
      const faculty = await FacultyService.getFacultyById(id);
      return ApiResponse.success(res, { data: faculty });
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const faculty = await FacultyService.createFaculty(
        req.body,
        req.user ? req.user.user_id : null,
        req.ip
      );
      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'Faculty account and profile created successfully.',
        data: faculty,
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await FacultyService.updateFaculty(
        id,
        req.body,
        req.user ? req.user.user_id : null,
        req.ip
      );
      return ApiResponse.success(res, {
        message: 'Faculty profile updated.',
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
      const result = await FacultyService.updateStatus(
        id,
        status,
        req.user ? req.user.user_id : null,
        req.ip
      );
      return ApiResponse.success(res, {
        message: `Faculty account marked as ${status}.`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

