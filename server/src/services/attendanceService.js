import { query, getConnection } from '../config/db.js';
import { AuditService } from './auditService.js';

export class AttendanceService {
  static async getAttendanceByCourse(courseId, date = null) {
    const conditions = ['e.course_id = ?'];
    const params = [courseId];

    if (date) {
      conditions.push('a.attendance_date = ?');
      params.push(date);
    }

    const sql = `
      SELECT 
        e.enrollment_id,
        s.student_id,
        s.roll_number,
        CONCAT(s.first_name, ' ', s.last_name) AS student_name,
        a.attendance_id,
        a.attendance_date,
        COALESCE(a.status, 'Not Marked') AS status,
        a.remarks,
        a.marked_by,
        u.email AS marked_by_email,
        a.updated_at
      FROM enrollments e
      JOIN students s ON e.student_id = s.student_id
      LEFT JOIN attendance a ON e.enrollment_id = a.enrollment_id ${date ? 'AND a.attendance_date = ?' : ''}
      LEFT JOIN users u ON a.marked_by = u.user_id
      WHERE e.course_id = ? AND e.status = 'enrolled'
      ORDER BY s.roll_number ASC
    `;

    const queryParams = date ? [date, courseId] : [courseId];
    const [rows] = await query(sql, queryParams);
    return rows;
  }

  static async getAttendanceByStudent(studentId, courseId = null) {
    const conditions = ['e.student_id = ?'];
    const params = [studentId];

    if (courseId) {
      conditions.push('e.course_id = ?');
      params.push(courseId);
    }

    const sql = `
      SELECT 
        a.attendance_id,
        a.attendance_date,
        a.status,
        a.remarks,
        c.course_id,
        c.course_code,
        c.course_name,
        e.semester,
        e.academic_year
      FROM attendance a
      JOIN enrollments e ON a.enrollment_id = e.enrollment_id
      JOIN courses c ON e.course_id = c.course_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY a.attendance_date DESC
    `;

    const [rows] = await query(sql, params);
    return rows;
  }

  /**
   * ACID Transaction: Bulk Attendance Marking with validation & upsert
   */
  static async markBulkAttendance({ course_id, attendance_date, records }, markedByUserId, ipAddress = null) {
    const connection = await getConnection();
    try {
      await connection.beginTransaction();

      // 1. Validate course exists
      const [courses] = await connection.query('SELECT course_id FROM courses WHERE course_id = ?', [course_id]);
      if (courses.length === 0) {
        const err = new Error('Specified course does not exist.');
        err.statusCode = 404;
        err.code = 'COURSE_NOT_FOUND';
        throw err;
      }

      // 2. Validate that EVERY submitted enrollment_id belongs to the target course_id
      const enrollmentIds = records.map((r) => r.enrollment_id);
      const [enrRows] = await connection.query(
        `SELECT enrollment_id, course_id FROM enrollments WHERE enrollment_id IN (?)`,
        [enrollmentIds]
      );

      const validEnrollmentMap = new Map();
      enrRows.forEach((row) => validEnrollmentMap.set(row.enrollment_id, row.course_id));

      for (const rec of records) {
        const actualCourseId = validEnrollmentMap.get(rec.enrollment_id);
        if (!actualCourseId) {
          const err = new Error(`Enrollment ID ${rec.enrollment_id} does not exist.`);
          err.statusCode = 400;
          err.code = 'INVALID_ENROLLMENT_ID';
          throw err;
        }
        if (Number(actualCourseId) !== Number(course_id)) {
          const err = new Error(`Enrollment ID ${rec.enrollment_id} does not belong to course ID ${course_id}.`);
          err.statusCode = 400;
          err.code = 'ENROLLMENT_COURSE_MISMATCH';
          throw err;
        }
      }

      // 3. Upsert attendance records
      const upsertSql = `
        INSERT INTO attendance (enrollment_id, attendance_date, status, marked_by, remarks)
        VALUES ?
        ON DUPLICATE KEY UPDATE
          status = VALUES(status),
          marked_by = VALUES(marked_by),
          remarks = VALUES(remarks),
          updated_at = CURRENT_TIMESTAMP
      `;

      const values = records.map((r) => [
        r.enrollment_id,
        attendance_date,
        r.status,
        markedByUserId,
        r.remarks || null,
      ]);

      await connection.query(upsertSql, [values]);

      // 4. Audit Log
      await AuditService.log({
        actorUserId: markedByUserId,
        action: 'ATTENDANCE_BULK_MARKED',
        entityType: 'attendance',
        entityId: course_id,
        metadata: {
          course_id,
          attendance_date,
          records_count: records.length,
        },
        ipAddress,
        connection,
      });

      await connection.commit();

      return {
        course_id,
        attendance_date,
        processed_records: records.length,
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }
}

