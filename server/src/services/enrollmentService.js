import { query, getConnection } from '../config/db.js';
import { AuditService } from './auditService.js';

export class EnrollmentService {
  static async getEnrollments({ student_id = null, course_id = null, semester = null, academic_year = null } = {}) {
    const conditions = [];
    const params = [];

    if (student_id) {
      conditions.push('e.student_id = ?');
      params.push(student_id);
    }
    if (course_id) {
      conditions.push('e.course_id = ?');
      params.push(course_id);
    }
    if (semester) {
      conditions.push('e.semester = ?');
      params.push(semester);
    }
    if (academic_year) {
      conditions.push('e.academic_year = ?');
      params.push(academic_year);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        e.enrollment_id,
        e.student_id,
        s.roll_number,
        CONCAT(s.first_name, ' ', s.last_name) AS student_name,
        u.email AS student_email,
        e.course_id,
        c.course_code,
        c.course_name,
        c.credits,
        e.semester,
        e.academic_year,
        e.status,
        e.created_at
      FROM enrollments e
      JOIN students s ON e.student_id = s.student_id
      JOIN users u ON s.user_id = u.user_id
      JOIN courses c ON e.course_id = c.course_id
      ${whereClause}
      ORDER BY e.academic_year DESC, e.semester DESC, s.roll_number ASC
    `;

    const [rows] = await query(sql, params);
    return rows;
  }

  static async createEnrollment(data, actorUserId = null, ipAddress = null) {
    const connection = await getConnection();
    try {
      await connection.beginTransaction();

      // 1. Verify student exists and is active
      const [studentRows] = await connection.query(
        `SELECT s.student_id, u.status 
         FROM students s
         JOIN users u ON s.user_id = u.user_id
         WHERE s.student_id = ?`,
        [data.student_id]
      );
      if (studentRows.length === 0) {
        const err = new Error('Referenced student does not exist.');
        err.statusCode = 404;
        err.code = 'STUDENT_NOT_FOUND';
        throw err;
      }
      if (studentRows[0].status !== 'active') {
        const err = new Error('Cannot enroll an inactive student.');
        err.statusCode = 400;
        err.code = 'STUDENT_INACTIVE';
        throw err;
      }

      // 2. Verify course exists & retrieve credits
      const [courseRows] = await connection.query('SELECT course_id, course_code, course_name, credits, semester FROM courses WHERE course_id = ?', [data.course_id]);
      if (courseRows.length === 0) {
        const err = new Error('Referenced course does not exist.');
        err.statusCode = 404;
        err.code = 'COURSE_NOT_FOUND';
        throw err;
      }
      const targetCourse = courseRows[0];

      // 3. Check for duplicate enrolment
      const [dupRows] = await connection.query(
        `SELECT enrollment_id FROM enrollments
         WHERE student_id = ? AND course_id = ? AND semester = ? AND academic_year = ?`,
        [data.student_id, data.course_id, data.semester, data.academic_year]
      );
      if (dupRows.length > 0) {
        const err = new Error('Student is already enrolled in this course for the selected term.');
        err.statusCode = 409;
        err.code = 'DUPLICATE_ENROLLMENT';
        throw err;
      }

      // 4. Prerequisite Check (Academic Progression Guard)
      const [prereqRows] = await connection.query(
        `SELECT cp.prerequisite_course_id, c.course_code, c.course_name
         FROM course_prerequisites cp
         JOIN courses c ON cp.prerequisite_course_id = c.course_id
         WHERE cp.course_id = ?`,
        [data.course_id]
      );
      if (prereqRows && prereqRows.length > 0) {
        for (const prereq of prereqRows) {
          const [checkRows] = await connection.query(
            `SELECT e.enrollment_id, e.status, r.grade
             FROM enrollments e
             LEFT JOIN results r ON e.enrollment_id = r.enrollment_id
             WHERE e.student_id = ? AND e.course_id = ?`,
            [data.student_id, prereq.prerequisite_course_id]
          );
          const hasPassed = checkRows.some(
            row => row.status === 'completed' || (row.grade && row.grade !== 'F')
          );
          if (!hasPassed) {
            const err = new Error(`Prerequisite course requirement not satisfied: Must complete ${prereq.course_code} (${prereq.course_name}) prior to enrolling in this course.`);
            err.statusCode = 400;
            err.code = 'PREREQUISITE_NOT_MET';
            throw err;
          }
        }
      }

      // 5. Semester Credit Cap Check (Max 24 Credits)
      const [creditRows] = await connection.query(
        `SELECT COALESCE(SUM(c.credits), 0) AS current_credits
         FROM enrollments e
         JOIN courses c ON e.course_id = c.course_id
         WHERE e.student_id = ? AND e.semester = ? AND e.academic_year = ? AND e.status = 'enrolled'`,
        [data.student_id, data.semester, data.academic_year]
      );
      const currentCredits = Number(creditRows && creditRows[0] ? creditRows[0].current_credits : 0);
      const courseCredits = Number(targetCourse.credits || 0);
      if (currentCredits + courseCredits > 24) {
        const err = new Error(`Semester credit limit of 24 exceeded (Current: ${currentCredits}, Course: ${courseCredits}, Total: ${currentCredits + courseCredits}).`);
        err.statusCode = 400;
        err.code = 'CREDIT_LIMIT_EXCEEDED';
        throw err;
      }

      // 6. Insert enrollment
      const sql = `
        INSERT INTO enrollments (student_id, course_id, semester, academic_year, status)
        VALUES (?, ?, ?, ?, ?)
      `;
      const [result] = await connection.query(sql, [
        data.student_id,
        data.course_id,
        data.semester,
        data.academic_year,
        data.status || 'enrolled',
      ]);
      const newEnrollmentId = result.insertId;

      await AuditService.log({
        actorUserId,
        action: 'COURSE_ENROLLED',
        entityType: 'enrollments',
        entityId: newEnrollmentId,
        metadata: data,
        ipAddress,
        connection,
      });

      await connection.commit();

      const [enrDetails] = await query(
        `SELECT e.*, c.course_code, c.course_name, s.roll_number, CONCAT(s.first_name, ' ', s.last_name) AS student_name
         FROM enrollments e
         JOIN courses c ON e.course_id = c.course_id
         JOIN students s ON e.student_id = s.student_id
         WHERE e.enrollment_id = ?`,
        [newEnrollmentId]
      );
      return enrDetails[0];
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async deleteEnrollment(id, actorUserId = null, ipAddress = null) {
    const [rows] = await query('SELECT * FROM enrollments WHERE enrollment_id = ?', [id]);
    if (rows.length === 0) {
      const err = new Error('Enrollment not found.');
      err.statusCode = 404;
      err.code = 'ENROLLMENT_NOT_FOUND';
      throw err;
    }

    // Check results
    const [resRows] = await query('SELECT COUNT(*) AS total FROM results WHERE enrollment_id = ?', [id]);
    if (resRows[0].total > 0) {
      const err = new Error('Cannot delete enrollment with associated exam results.');
      err.statusCode = 409;
      err.code = 'ENROLLMENT_HAS_RESULTS';
      throw err;
    }

    await query('DELETE FROM enrollments WHERE enrollment_id = ?', [id]);

    await AuditService.log({
      actorUserId,
      action: 'ENROLLMENT_DELETED',
      entityType: 'enrollments',
      entityId: id,
      metadata: rows[0],
      ipAddress,
    });

    return { enrollment_id: id, deleted: true };
  }
}

