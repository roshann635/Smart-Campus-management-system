import { AuthService } from '../services/authService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AuthController {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

      const user = await AuthService.login({ email, password, ipAddress });

      // Save user payload into session
      req.session.user = user;

      // Ensure session is saved before sending response
      req.session.save((err) => {
        if (err) return next(err);
        return ApiResponse.success(res, {
          message: 'Login successful.',
          data: user,
        });
      });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req, res, next) {
    try {
      req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie('campus_session_id');
        return ApiResponse.success(res, {
          message: 'Logout successful. Session terminated.',
        });
      });
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req, res, next) {
    try {
      if (!req.session || !req.session.user) {
        return ApiResponse.error(res, {
          statusCode: 401,
          code: 'UNAUTHENTICATED',
          message: 'No active session found.',
        });
      }
      return ApiResponse.success(res, {
        message: 'Active session retrieved.',
        data: req.session.user,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getCsrfToken(req, res) {
    return ApiResponse.success(res, {
      message: 'CSRF token issued.',
      data: {
        csrfToken: req.sessionID || 'session-bearer-csrf-token',
      },
    });
  }
}

