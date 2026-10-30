import { AuditService } from '../services/auditService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AuditLogController {
  static async getAll(req, res, next) {
    try {
      const { page = 1, limit = 20, action, entity_type } = req.query;
      const result = await AuditService.getLogs({
        page: Number(page),
        limit: Number(limit),
        action,
        entityType: entity_type,
      });

      return ApiResponse.success(res, {
        message: 'Audit log records retrieved.',
        data: result.logs,
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
}

