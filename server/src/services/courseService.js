import { query } from '../config/db.js';
import { AuditService } from './auditService.js';

export class CourseService {
  static async getCourses({ department_id = null, semester = null, faculty_id = null, search = '' } = {}) {
    const conditions = [];
    const params = [];

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      conditions.push('(c.course_code LIKE ? OR c.course_name LIKE ?)');
      params.push(term, term);
    }
    if (department_id) {
      conditions.push('c.department_id = ?');
      params.push(department_id);
    }
    if (semester) {
      conditions.push('c.semester = ?');
      params.push(semester);
    }
    if (faculty_id) {
      conditions.push('c.faculty_id = ?');
      params.push(faculty_id);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        c.course_id,
        c.course_code,
        c.course_name,
        c.credits,
        c.semester,
        c.department_id,
        d.name AS department_name,
        d.code AS department_code,
        c.faculty_id,
        f.employee_code AS faculty_code,
        CONCAT(f.first_name, ' ', f.last_name) AS faculty_name,
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.course_id AND e.status = 'enrolled') AS enrolled_students_count,
        c.created_at,
        c.updated_at
      FROM courses c
      JOIN departments d ON c.department_id = d.department_id
      LEFT JOIN faculty f ON c.faculty_id = f.faculty_id
      ${whereClause}
      ORDER BY c.semester ASC, c.course_code ASC
    `;

    const [rows] = await query(sql, params);
    return rows;
  }

  static async getCourseById(id) {
    const sql = `
      SELECT 
        c.course_id,
        c.course_code,
        c.course_name,
        c.credits,
        c.semester,
        c.department_id,
        d.name AS department_name,
        d.code AS department_code,
        c.faculty_id,
        f.employee_code AS faculty_code,
        CONCAT(f.first_name, ' ', f.last_name) AS faculty_name,
        c.created_at,
        c.updated_at
      FROM courses c
      JOIN departments d ON c.department_id = d.department_id
      LEFT JOIN faculty f ON c.faculty_id = f.faculty_id
      WHERE c.course_id = ?
    `;
    const [rows] = await query(sql, [id]);
    if (rows.length === 0) {
      const err = new Error('Course not found.');
      err.statusCode = 404;
      err.code = 'COURSE_NOT_FOUND';
      throw err;
    }
    return rows[0];
  }

  static async createCourse(data, actorUserId = null, ipAddress = null) {
    const [deptRows] = await query('SELECT department_id FROM departments WHERE department_id = ?', [data.department_id]);
    if (deptRows.length === 0) {
      const err = new Error('Specified department does not exist.');
      err.statusCode = 400;
      err.code = 'INVALID_DEPARTMENT';
      throw err;
    }

    if (data.faculty_id) {
      const [facRows] = await query('SELECT faculty_id FROM faculty WHERE faculty_id = ?', [data.faculty_id]);
      if (facRows.length === 0) {
        const err = new Error('Specified faculty member does not exist.');
        err.statusCode = 400;
        err.code = 'INVALID_FACULTY';
        throw err;
      }
    }

    const sql = `
      INSERT INTO courses (course_code, course_name, credits, semester, department_id, faculty_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [res] = await query(sql, [
      data.course_code,
      data.course_name,
      data.credits,
      data.semester,
      data.department_id,
      data.faculty_id || null,
    ]);
    const newCourseId = res.insertId;

    await AuditService.log({
      actorUserId,
      action: 'COURSE_CREATED',
      entityType: 'courses',
      entityId: newCourseId,
      metadata: data,
      ipAddress,
    });

    return this.getCourseById(newCourseId);
  }

  static async updateCourse(id, data, actorUserId = null, ipAddress = null) {
    await this.getCourseById(id);

    const fields = [];
    const params = [];

    if (data.course_name !== undefined) { fields.push('course_name = ?'); params.push(data.course_name); }
    if (data.credits !== undefined) { fields.push('credits = ?'); params.push(data.credits); }
    if (data.semester !== undefined) { fields.push('semester = ?'); params.push(data.semester); }
    if (data.department_id !== undefined) {
      const [deptRows] = await query('SELECT department_id FROM departments WHERE department_id = ?', [data.department_id]);
      if (deptRows.length === 0) {
        const err = new Error('Specified department does not exist.');
        err.statusCode = 400;
        err.code = 'INVALID_DEPARTMENT';
        throw err;
      }
      fields.push('department_id = ?');
      params.push(data.department_id);
    }
    if (data.faculty_id !== undefined) {
      if (data.faculty_id !== null) {
        const [facRows] = await query('SELECT faculty_id FROM faculty WHERE faculty_id = ?', [data.faculty_id]);
        if (facRows.length === 0) {
          const err = new Error('Specified faculty member does not exist.');
          err.statusCode = 400;
          err.code = 'INVALID_FACULTY';
          throw err;
        }
      }
      fields.push('faculty_id = ?');
      params.push(data.faculty_id);
    }

    if (fields.length > 0) {
      params.push(id);
      await query(`UPDATE courses SET ${fields.join(', ')} WHERE course_id = ?`, params);
    }

    await AuditService.log({
      actorUserId,
      action: 'COURSE_UPDATED',
      entityType: 'courses',
      entityId: id,
      metadata: data,
      ipAddress,
    });

    return this.getCourseById(id);
  }

  static async deleteCourse(id, actorUserId = null, ipAddress = null) {
    const course = await this.getCourseById(id);

    // Check references
    const [enrRows] = await query('SELECT COUNT(*) AS total FROM enrollments WHERE course_id = ?', [id]);
    if (enrRows[0].total > 0) {
      const err = new Error('Cannot delete course with active enrollments.');
      err.statusCode = 409;
      err.code = 'COURSE_HAS_ENROLLMENTS';
      throw err;
    }

    const [examRows] = await query('SELECT COUNT(*) AS total FROM exams WHERE course_id = ?', [id]);
    if (examRows[0].total > 0) {
      const err = new Error('Cannot delete course with associated exams.');
      err.statusCode = 409;
      err.code = 'COURSE_HAS_EXAMS';
      throw err;
    }

    await query('DELETE FROM courses WHERE course_id = ?', [id]);

    await AuditService.log({
      actorUserId,
      action: 'COURSE_DELETED',
      entityType: 'courses',
      entityId: id,
      metadata: { course_code: course.course_code, course_name: course.course_name },
      ipAddress,
    });

    return { course_id: id, deleted: true };
  }
}

