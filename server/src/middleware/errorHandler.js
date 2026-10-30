import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Global Error Handler Middleware
 * Normalizes uncaught errors, database constraint violations, and syntax failures.
 */
export function errorHandler(err, req, res, next) {
  // If response headers already sent, delegate to default express handler
  if (res.headersSent) {
    return next(err);
  }

  // MySQL Duplicate Key Error
  if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
    return ApiResponse.error(res, {
      statusCode: 409,
      code: 'DUPLICATE_ENTITY',
      message: 'A record with conflicting unique values already exists.',
      details: [err.sqlMessage || err.message],
    });
  }

  // MySQL Foreign Key Constraint Error (Child row cannot be deleted/updated)
  if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
    return ApiResponse.error(res, {
      statusCode: 409,
      code: 'REFERENTIAL_INTEGRITY_VIOLATION',
      message: 'Cannot delete or modify record because it is referenced by existing dependent records.',
      details: [err.sqlMessage || err.message],
    });
  }

  // MySQL Foreign Key Constraint Error (Parent row does not exist)
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.errno === 1452) {
    return ApiResponse.error(res, {
      statusCode: 400,
      code: 'INVALID_FOREIGN_KEY_REFERENCE',
      message: 'Referenced foreign key entity does not exist.',
      details: [err.sqlMessage || err.message],
    });
  }

  // Database Connection Refused or Offline
  if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
    return ApiResponse.error(res, {
      statusCode: 503,
      code: 'DATABASE_OFFLINE',
      message: 'Database service is currently unreachable. Please verify MySQL service status.',
      details: [err.message],
    });
  }

  // Custom Application Errors
  if (err.statusCode) {
    return ApiResponse.error(res, {
      statusCode: err.statusCode,
      code: err.code || 'APPLICATION_ERROR',
      message: err.message,
      details: err.details || [],
    });
  }

  // Generic Uncaught Exception (Mask internal details in production)
  const isProd = process.env.NODE_ENV === 'production';
  return ApiResponse.error(res, {
    statusCode: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: isProd ? 'An unexpected server error occurred.' : err.message,
    details: isProd ? [] : [err.stack],
  });
}

/**
 * 404 Route Not Found Handler
 */
export function notFoundHandler(req, res) {
  return ApiResponse.error(res, {
    statusCode: 404,
    code: 'ROUTE_NOT_FOUND',
    message: `Resource not found at endpoint [${req.method} ${req.originalUrl}].`,
  });
}

