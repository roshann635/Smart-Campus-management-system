import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Zod Schema Validation Middleware
 * Validates request body, params, or query against given Zod schemas.
 */
export function validateRequest({ body, params, query }) {
  return async (req, res, next) => {
    try {
      if (params) {
        req.params = await params.parseAsync(req.params);
      }
      if (query) {
        req.query = await query.parseAsync(req.query);
      }
      if (body) {
        req.body = await body.parseAsync(req.body);
      }
      return next();
    } catch (error) {
      if (error.errors) {
        const details = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          rule: err.code,
        }));
        return ApiResponse.error(res, {
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          message: 'Request payload validation failed.',
          details,
        });
      }
      return next(error);
    }
  };
}

