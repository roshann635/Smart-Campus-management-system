import { ApiResponse } from '../utils/apiResponse.js';
import { query } from '../config/db.js';

/**
 * Role-Based Access Control Middleware
 * Restricts endpoint access strictly to specified user roles.
 */
export function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, {
        statusCode: 401,
        code: 'UNAUTHENTICATED',
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.error(res, {
        statusCode: 403,
        code: 'FORBIDDEN',
        message: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}].`,
      });
    }

    return next();
  };
}

/**
 * Strict Student Ownership Isolation Middleware
 * Prevents students from querying or modifying other students' data.
 */
export function requireStudentOwnership(idParamName = 'id') {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, { statusCode: 401, code: 'UNAUTHENTICATED', message: 'Authentication required.' });
    }

    // Administrators always have full oversight
    if (req.user.role === 'administrator') {
      return next();
    }

    // Faculty access is subject to course-enrollment checks at the service/controller level
    if (req.user.role === 'faculty') {
      return next();
    }

    if (req.user.role === 'student') {
      const targetStudentId = req.params[idParamName] || req.query[idParamName] || req.body[idParamName];
      
      // If no ID specified or ID matches authenticated student's profile ID
      if (!targetStudentId || String(targetStudentId) === String(req.user.student_id)) {
        return next();
      }

      return ApiResponse.error(res, {
        statusCode: 403,
        code: 'FORBIDDEN_STUDENT_ISOLATION',
        message: 'Forbidden: You cannot access or modify records belonging to other students.',
      });
    }

    return ApiResponse.error(res, { statusCode: 403, code: 'FORBIDDEN', message: 'Unauthorized role.' });
  };
}

/**
 * Faculty Course Ownership Middleware
 * Ensures faculty can only view, enter marks, or mark attendance for courses assigned to them.
 */
export function requireCourseFacultyOwnership() {
  return async (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, { statusCode: 401, code: 'UNAUTHENTICATED', message: 'Authentication required.' });
    }

    // Administrators have full access
    if (req.user.role === 'administrator') {
      return next();
    }

    if (req.user.role !== 'faculty') {
      return ApiResponse.error(res, {
        statusCode: 403,
        code: 'FORBIDDEN',
        message: 'Only faculty members can manage course-level academic activities.',
      });
    }

    const courseId = req.params.courseId || req.body.course_id || req.query.course_id;
    if (!courseId) {
      return next(); // Controller will handle missing courseId validation
    }

    try {
      const [rows] = await query('SELECT faculty_id FROM courses WHERE course_id = ?', [courseId]);
      if (rows.length === 0) {
        return ApiResponse.error(res, {
          statusCode: 404,
          code: 'COURSE_NOT_FOUND',
          message: 'Referenced course does not exist.',
        });
      }

      const assignedFacultyId = rows[0].faculty_id;
      if (Number(assignedFacultyId) !== Number(req.user.faculty_id)) {
        return ApiResponse.error(res, {
          statusCode: 403,
          code: 'FORBIDDEN_COURSE_UNASSIGNED',
          message: 'Forbidden: You are not assigned as the instructor for this course.',
        });
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
}

