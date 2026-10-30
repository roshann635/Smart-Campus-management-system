/**
 * Standardized API Response Utilities
 * Enforces uniform success and error envelopes across the entire backend.
 */

export class ApiResponse {
  static success(res, { statusCode = 200, message = 'Operation successful', data = null, meta = null }) {
    const payload = {
      success: true,
      message,
      data,
    };
    if (meta) {
      payload.meta = meta;
    }
    return res.status(statusCode).json(payload);
  }

  static error(res, { statusCode = 500, code = 'INTERNAL_SERVER_ERROR', message = 'An unexpected error occurred', details = [] }) {
    return res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        details: Array.isArray(details) ? details : [details],
      },
    });
  }
}

