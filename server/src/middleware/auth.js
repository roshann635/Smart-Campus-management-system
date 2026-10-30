import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Authentication Middleware
 * Enforces valid active session on protected endpoints.
 */
export function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return ApiResponse.error(res, {
      statusCode: 401,
      code: 'UNAUTHENTICATED',
      message: 'Authentication required. Please log in.',
    });
  }

  if (req.session.user.status !== 'active') {
    req.session.destroy(() => {});
    return ApiResponse.error(res, {
      statusCode: 403,
      code: 'ACCOUNT_DEACTIVATED',
      message: 'Your account has been deactivated. Contact an administrator.',
    });
  }

  req.user = req.session.user;
  return next();
}

