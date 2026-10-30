import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { AuditService } from './auditService.js';

export class AuthService {
  /**
   * Authenticates user with email and password.
   * Loads role-specific profile (student_id or faculty_id) onto session.
   */
  static async login({ email, password, ipAddress }) {
    const userSql = `
      SELECT user_id, email, password_hash, role, status
      FROM users
      WHERE email = ?
    `;
    const [users] = await query(userSql, [email]);

    if (users.length === 0) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const user = users[0];

    if (user.status !== 'active') {
      const error = new Error('Your account is currently inactive. Please contact administration.');
      error.statusCode = 403;
      error.code = 'ACCOUNT_INACTIVE';
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    let profile = null;

    if (user.role === 'student') {
      const [students] = await query(
        `SELECT s.student_id, s.roll_number, s.first_name, s.last_name, s.department_id, d.name AS department_name
         FROM students s
         JOIN departments d ON s.department_id = d.department_id
         WHERE s.user_id = ?`,
        [user.user_id]
      );
      if (students.length > 0) profile = students[0];
    } else if (user.role === 'faculty') {
      const [faculty] = await query(
        `SELECT f.faculty_id, f.employee_code, f.first_name, f.last_name, f.designation, f.department_id, d.name AS department_name
         FROM faculty f
         JOIN departments d ON f.department_id = d.department_id
         WHERE f.user_id = ?`,
        [user.user_id]
      );
      if (faculty.length > 0) profile = faculty[0];
    }

    const authPayload = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      status: user.status,
      first_name: profile ? profile.first_name : (user.role === 'administrator' ? 'Campus' : ''),
      last_name: profile ? profile.last_name : (user.role === 'administrator' ? 'Admin' : ''),
      student_id: profile && profile.student_id ? profile.student_id : null,
      faculty_id: profile && profile.faculty_id ? profile.faculty_id : null,
      roll_number: profile && profile.roll_number ? profile.roll_number : null,
      employee_code: profile && profile.employee_code ? profile.employee_code : null,
      department_id: profile && profile.department_id ? profile.department_id : null,
      department_name: profile && profile.department_name ? profile.department_name : null,
    };

    await AuditService.log({
      actorUserId: user.user_id,
      action: 'USER_LOGIN',
      entityType: 'users',
      entityId: user.user_id,
      metadata: { role: user.role, email: user.email },
      ipAddress,
    });

    return authPayload;
  }
}

