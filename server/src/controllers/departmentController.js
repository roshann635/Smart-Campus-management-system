import { query } from '../config/db.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AuditService } from '../services/auditService.js';

export class DepartmentController {
  static async getAll(req, res, next) {
    try {
      const sql = `
        SELECT 
          d.department_id,
          d.code,
          d.name,
          d.description,
          (SELECT COUNT(*) FROM students s WHERE s.department_id = d.department_id) AS student_count,
          (SELECT COUNT(*) FROM faculty f WHERE f.department_id = d.department_id) AS faculty_count,
          (SELECT COUNT(*) FROM courses c WHERE c.department_id = d.department_id) AS course_count,
          d.created_at,
          d.updated_at
        FROM departments d
        ORDER BY d.code ASC
      `;
      const [rows] = await query(sql);
      return ApiResponse.success(res, { data: rows });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const [rows] = await query('SELECT * FROM departments WHERE department_id = ?', [id]);
      if (rows.length === 0) {
        return ApiResponse.error(res, { statusCode: 404, code: 'NOT_FOUND', message: 'Department not found.' });
      }
      return ApiResponse.success(res, { data: rows[0] });
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const { code, name, description } = req.body;
      const sql = 'INSERT INTO departments (code, name, description) VALUES (?, ?, ?)';
      const [result] = await query(sql, [code, name, description || null]);
      const newId = result.insertId;

      await AuditService.log({
        actorUserId: req.user ? req.user.user_id : null,
        action: 'DEPARTMENT_CREATED',
        entityType: 'departments',
        entityId: newId,
        metadata: { code, name },
        ipAddress: req.ip,
      });

      const [newDept] = await query('SELECT * FROM departments WHERE department_id = ?', [newId]);
      return ApiResponse.success(res, { statusCode: 201, message: 'Department created successfully.', data: newDept[0] });
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { code, name, description } = req.body;

      const [rows] = await query('SELECT * FROM departments WHERE department_id = ?', [id]);
      if (rows.length === 0) {
        return ApiResponse.error(res, { statusCode: 404, code: 'NOT_FOUND', message: 'Department not found.' });
      }

      const fields = [];
      const params = [];
      if (code) { fields.push('code = ?'); params.push(code); }
      if (name) { fields.push('name = ?'); params.push(name); }
      if (description !== undefined) { fields.push('description = ?'); params.push(description); }

      if (fields.length > 0) {
        params.push(id);
        await query(`UPDATE departments SET ${fields.join(', ')} WHERE department_id = ?`, params);
      }

      await AuditService.log({
        actorUserId: req.user ? req.user.user_id : null,
        action: 'DEPARTMENT_UPDATED',
        entityType: 'departments',
        entityId: id,
        metadata: req.body,
        ipAddress: req.ip,
      });

      const [updated] = await query('SELECT * FROM departments WHERE department_id = ?', [id]);
      return ApiResponse.success(res, { message: 'Department updated successfully.', data: updated[0] });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const [rows] = await query('SELECT * FROM departments WHERE department_id = ?', [id]);
      if (rows.length === 0) {
        return ApiResponse.error(res, { statusCode: 404, code: 'NOT_FOUND', message: 'Department not found.' });
      }

      // Check referential dependencies before deleting
      const [studentCount] = await query('SELECT COUNT(*) AS total FROM students WHERE department_id = ?', [id]);
      if (studentCount[0].total > 0) {
        return ApiResponse.error(res, {
          statusCode: 409,
          code: 'DEPARTMENT_HAS_STUDENTS',
          message: 'Cannot delete department with associated students.',
        });
      }

      const [facultyCount] = await query('SELECT COUNT(*) AS total FROM faculty WHERE department_id = ?', [id]);
      if (facultyCount[0].total > 0) {
        return ApiResponse.error(res, {
          statusCode: 409,
          code: 'DEPARTMENT_HAS_FACULTY',
          message: 'Cannot delete department with associated faculty members.',
        });
      }

      const [courseCount] = await query('SELECT COUNT(*) AS total FROM courses WHERE department_id = ?', [id]);
      if (courseCount[0].total > 0) {
        return ApiResponse.error(res, {
          statusCode: 409,
          code: 'DEPARTMENT_HAS_COURSES',
          message: 'Cannot delete department with associated courses.',
        });
      }

      await query('DELETE FROM departments WHERE department_id = ?', [id]);

      await AuditService.log({
        actorUserId: req.user ? req.user.user_id : null,
        action: 'DEPARTMENT_DELETED',
        entityType: 'departments',
        entityId: id,
        metadata: { code: rows[0].code, name: rows[0].name },
        ipAddress: req.ip,
      });

      return ApiResponse.success(res, { message: 'Department deleted successfully.', data: { department_id: id } });
    } catch (err) {
      next(err);
    }
  }
}

