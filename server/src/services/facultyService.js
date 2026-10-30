import bcrypt from 'bcryptjs';
import { query, getConnection } from '../config/db.js';
import { AuditService } from './auditService.js';

export class FacultyService {
  static async getFaculty({ page = 1, limit = 10, search = '', department_id = null, status = null }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      conditions.push('(f.employee_code LIKE ? OR f.first_name LIKE ? OR f.last_name LIKE ? OR u.email LIKE ?)');
      params.push(term, term, term, term);
    }

    if (department_id) {
      conditions.push('f.department_id = ?');
      params.push(department_id);
    }

    if (status) {
      conditions.push('u.status = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*) AS total
      FROM faculty f
      JOIN users u ON f.user_id = u.user_id
      ${whereClause}
    `;
    const [countRows] = await query(countSql, params);
    const total = countRows[0].total;

    const dataSql = `
      SELECT 
        f.faculty_id,
        f.user_id,
        f.employee_code,
        f.first_name,
        f.last_name,
        f.designation,
        f.phone,
        f.department_id,
        d.name AS department_name,
        d.code AS department_code,
        u.email,
        u.status,
        f.created_at,
        f.updated_at
      FROM faculty f
      JOIN users u ON f.user_id = u.user_id
      JOIN departments d ON f.department_id = d.department_id
      ${whereClause}
      ORDER BY f.employee_code ASC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await query(dataSql, [...params, Number(limit), Number(offset)]);
    return {
      faculty: rows,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async getFacultyById(id) {
    const sql = `
      SELECT 
        f.faculty_id,
        f.user_id,
        f.employee_code,
        f.first_name,
        f.last_name,
        f.designation,
        f.phone,
        f.department_id,
        d.name AS department_name,
        d.code AS department_code,
        u.email,
        u.status,
        f.created_at,
        f.updated_at
      FROM faculty f
      JOIN users u ON f.user_id = u.user_id
      JOIN departments d ON f.department_id = d.department_id
      WHERE f.faculty_id = ?
    `;
    const [rows] = await query(sql, [id]);
    if (rows.length === 0) {
      const err = new Error('Faculty member not found.');
      err.statusCode = 404;
      err.code = 'FACULTY_NOT_FOUND';
      throw err;
    }
    return rows[0];
  }

  /**
   * ACID Transaction: Create User + Faculty Profile + Audit Log
   */
  static async createFaculty(data, actorUserId = null, ipAddress = null) {
    const connection = await getConnection();
    try {
      await connection.beginTransaction();

      // Verify department exists
      const [deptRows] = await connection.query('SELECT department_id FROM departments WHERE department_id = ?', [data.department_id]);
      if (deptRows.length === 0) {
        const err = new Error('Specified department does not exist.');
        err.statusCode = 400;
        err.code = 'INVALID_DEPARTMENT';
        throw err;
      }

      const passwordHash = await bcrypt.hash(data.password || 'Campus@123', 10);

      // Insert into users
      const userSql = `INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, 'faculty', 'active')`;
      const [userResult] = await connection.query(userSql, [data.email, passwordHash]);
      const newUserId = userResult.insertId;

      // Insert into faculty
      const facultySql = `
        INSERT INTO faculty (user_id, employee_code, first_name, last_name, designation, phone, department_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [facultyResult] = await connection.query(facultySql, [
        newUserId,
        data.employee_code,
        data.first_name,
        data.last_name,
        data.designation,
        data.phone || null,
        data.department_id,
      ]);
      const newFacultyId = facultyResult.insertId;

      await AuditService.log({
        actorUserId,
        action: 'FACULTY_CREATED',
        entityType: 'faculty',
        entityId: newFacultyId,
        metadata: {
          employee_code: data.employee_code,
          email: data.email,
          department_id: data.department_id,
        },
        ipAddress,
        connection,
      });

      await connection.commit();

      return {
        faculty_id: newFacultyId,
        user_id: newUserId,
        employee_code: data.employee_code,
        first_name: data.first_name,
        last_name: data.last_name,
        designation: data.designation,
        email: data.email,
        department_id: data.department_id,
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async updateFaculty(id, data, actorUserId = null, ipAddress = null) {
    await this.getFacultyById(id);

    const fields = [];
    const params = [];

    if (data.first_name !== undefined) { fields.push('first_name = ?'); params.push(data.first_name); }
    if (data.last_name !== undefined) { fields.push('last_name = ?'); params.push(data.last_name); }
    if (data.designation !== undefined) { fields.push('designation = ?'); params.push(data.designation); }
    if (data.phone !== undefined) { fields.push('phone = ?'); params.push(data.phone); }
    if (data.department_id !== undefined) {
      const [depts] = await query('SELECT department_id FROM departments WHERE department_id = ?', [data.department_id]);
      if (depts.length === 0) {
        const err = new Error('Specified department does not exist.');
        err.statusCode = 400;
        err.code = 'INVALID_DEPARTMENT';
        throw err;
      }
      fields.push('department_id = ?');
      params.push(data.department_id);
    }

    if (fields.length > 0) {
      params.push(id);
      await query(`UPDATE faculty SET ${fields.join(', ')} WHERE faculty_id = ?`, params);
    }

    await AuditService.log({
      actorUserId,
      action: 'FACULTY_UPDATED',
      entityType: 'faculty',
      entityId: id,
      metadata: data,
      ipAddress,
    });

    return this.getFacultyById(id);
  }

  static async updateStatus(id, status, actorUserId = null, ipAddress = null) {
    const faculty = await this.getFacultyById(id);
    await query('UPDATE users SET status = ? WHERE user_id = ?', [status, faculty.user_id]);

    await AuditService.log({
      actorUserId,
      action: 'FACULTY_STATUS_UPDATED',
      entityType: 'users',
      entityId: faculty.user_id,
      metadata: { faculty_id: id, status },
      ipAddress,
    });

    return { faculty_id: id, user_id: faculty.user_id, status };
  }
}

