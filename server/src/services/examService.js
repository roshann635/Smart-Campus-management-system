import { query, getConnection } from '../config/db.js';
import { calculateGrade } from '../utils/grading.js';
import { AuditService } from './auditService.js';

export class ExamService {
  static async getExams({ course_id = null } = {}) {
    const conditions = [];
    const params = [];

    if (course_id) {
      conditions.push('ex.course_id = ?');
      params.push(course_id);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        ex.exam_id,
        ex.course_id,
        c.course_code,
        c.course_name,
        ex.exam_name,
        ex.exam_type,
        ex.exam_date,
        ex.max_marks,
        ex.created_by,
        u.email AS created_by_email,
        (SELECT COUNT(*) FROM results r WHERE r.exam_id = ex.exam_id) AS graded_students_count,
        ex.created_at
      FROM exams ex
      JOIN courses c ON ex.course_id = c.course_id
      JOIN users u ON ex.created_by = u.user_id
      ${whereClause}
      ORDER BY ex.exam_date DESC
    `;

    const [rows] = await query(sql, params);
    return rows;
  }

  static async getExamById(id) {
    const sql = `
      SELECT 
        ex.exam_id,
        ex.course_id,
        c.course_code,
        c.course_name,
        c.faculty_id,
        ex.exam_name,
        ex.exam_type,
        ex.exam_date,
        ex.max_marks,
        ex.created_by,
        ex.created_at
      FROM exams ex
      JOIN courses c ON ex.course_id = c.course_id
      WHERE ex.exam_id = ?
    `;
    const [rows] = await query(sql, [id]);
    if (rows.length === 0) {
      const err = new Error('Exam not found.');
      err.statusCode = 404;
      err.code = 'EXAM_NOT_FOUND';
      throw err;
    }
    return rows[0];
  }

  static async createExam(data, actorUserId = null, ipAddress = null) {
    const [courseRows] = await query('SELECT course_id FROM courses WHERE course_id = ?', [data.course_id]);
    if (courseRows.length === 0) {
      const err = new Error('Specified course does not exist.');
      err.statusCode = 404;
      err.code = 'COURSE_NOT_FOUND';
      throw err;
    }

    const sql = `
      INSERT INTO exams (course_id, exam_name, exam_type, exam_date, max_marks, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await query(sql, [
      data.course_id,
      data.exam_name,
      data.exam_type,
      data.exam_date,
      data.max_marks,
      actorUserId,
    ]);
    const newExamId = result.insertId;

    await AuditService.log({
      actorUserId,
      action: 'EXAM_CREATED',
      entityType: 'exams',
      entityId: newExamId,
      metadata: data,
      ipAddress,
    });

    return this.getExamById(newExamId);
  }

  static async getResultsByExam(examId) {
    const exam = await this.getExamById(examId);

    const sql = `
      SELECT 
        e.enrollment_id,
        s.student_id,
        s.roll_number,
        CONCAT(s.first_name, ' ', s.last_name) AS student_name,
        r.result_id,
        r.marks_obtained,
        r.grade,
        r.entered_by,
        u.email AS entered_by_email,
        r.updated_at
      FROM enrollments e
      JOIN students s ON e.student_id = s.student_id
      LEFT JOIN results r ON e.enrollment_id = r.enrollment_id AND r.exam_id = ?
      LEFT JOIN users u ON r.entered_by = u.user_id
      WHERE e.course_id = ? AND e.status = 'enrolled'
      ORDER BY s.roll_number ASC
    `;

    const [rows] = await query(sql, [examId, exam.course_id]);
    return {
      exam,
      roster: rows,
    };
  }

  static async getResultsByStudent(studentId) {
    const sql = `
      SELECT 
        r.result_id,
        ex.exam_id,
        ex.exam_name,
        ex.exam_type,
        ex.exam_date,
        ex.max_marks,
        r.marks_obtained,
        r.grade,
        c.course_id,
        c.course_code,
        c.course_name,
        c.credits,
        e.semester,
        e.academic_year
      FROM results r
      JOIN exams ex ON r.exam_id = ex.exam_id
      JOIN enrollments e ON r.enrollment_id = e.enrollment_id
      JOIN courses c ON e.course_id = c.course_id
      WHERE e.student_id = ?
      ORDER BY ex.exam_date DESC
    `;
    const [rows] = await query(sql, [studentId]);
    return rows;
  }

  /**
   * ACID Transaction: Bulk Student Marks Entry with max_marks and grade calculation
   */
  static async submitBulkResults({ exam_id, results }, enteredByUserId, ipAddress = null) {
    const connection = await getConnection();
    try {
      await connection.beginTransaction();

      // 1. Fetch exam details and max_marks
      const [examRows] = await connection.query(
        'SELECT exam_id, course_id, exam_name, max_marks FROM exams WHERE exam_id = ?',
        [exam_id]
      );
      if (examRows.length === 0) {
        const err = new Error('Specified exam does not exist.');
        err.statusCode = 404;
        err.code = 'EXAM_NOT_FOUND';
        throw err;
      }
      const exam = examRows[0];
      const maxMarks = parseFloat(exam.max_marks);

      // 2. Validate enrollment IDs belong to the exam's course
      const enrollmentIds = results.map((r) => r.enrollment_id);
      const [enrRows] = await connection.query(
        'SELECT enrollment_id, course_id FROM enrollments WHERE enrollment_id IN (?)',
        [enrollmentIds]
      );
      const enrMap = new Map();
      enrRows.forEach((r) => enrMap.set(r.enrollment_id, r.course_id));

      const processedRows = [];

      for (const res of results) {
        const courseId = enrMap.get(res.enrollment_id);
        if (!courseId) {
          const err = new Error(`Enrollment ID ${res.enrollment_id} does not exist.`);
          err.statusCode = 400;
          err.code = 'INVALID_ENROLLMENT_ID';
          throw err;
        }
        if (Number(courseId) !== Number(exam.course_id)) {
          const err = new Error(`Enrollment ID ${res.enrollment_id} does not belong to course ID ${exam.course_id}.`);
          err.statusCode = 400;
          err.code = 'ENROLLMENT_COURSE_MISMATCH';
          throw err;
        }

        const marks = parseFloat(res.marks_obtained);
        if (isNaN(marks) || marks < 0) {
          const err = new Error(`Marks obtained cannot be negative or invalid for enrollment ${res.enrollment_id}.`);
          err.statusCode = 400;
          err.code = 'INVALID_MARKS';
          throw err;
        }

        if (marks > maxMarks) {
          const err = new Error(`Marks obtained (${marks}) cannot exceed maximum allowed marks (${maxMarks}) for exam '${exam.exam_name}'.`);
          err.statusCode = 400;
          err.code = 'MARKS_EXCEED_MAXIMUM';
          throw err;
        }

        const { grade } = calculateGrade(marks, maxMarks);
        processedRows.push([
          exam_id,
          res.enrollment_id,
          marks,
          grade,
          enteredByUserId,
        ]);
      }

      // 3. Upsert results
      const upsertSql = `
        INSERT INTO results (exam_id, enrollment_id, marks_obtained, grade, entered_by)
        VALUES ?
        ON DUPLICATE KEY UPDATE
          marks_obtained = VALUES(marks_obtained),
          grade = VALUES(grade),
          entered_by = VALUES(entered_by),
          updated_at = CURRENT_TIMESTAMP
      `;
      await connection.query(upsertSql, [processedRows]);

      // 4. Create in-app notifications for graded students
      for (const res of results) {
        try {
          const [stRows] = await connection.query(
            `SELECT s.user_id FROM enrollments e JOIN students s ON e.student_id = s.student_id WHERE e.enrollment_id = ?`,
            [res.enrollment_id]
          );
          if (stRows && stRows.length > 0) {
            await connection.query(
              `INSERT INTO notifications (user_id, title, message, type, is_read)
               VALUES (?, ?, ?, 'EXAM_RESULT', 0)`,
              [
                stRows[0].user_id,
                `Grade Published: ${exam.exam_name}`,
                `Your result for ${exam.exam_name} (${exam.course_code || 'Course'}) has been published. Marks: ${res.marks_obtained}/${exam.max_marks}.`,
              ]
            );
          }
        } catch (e) {
          // Non-blocking notification
        }
      }

      // 5. Audit Log
      await AuditService.log({
        actorUserId: enteredByUserId,
        action: 'RESULT_BULK_ENTERED',
        entityType: 'results',
        entityId: exam_id,
        metadata: {
          exam_id,
          exam_name: exam.exam_name,
          results_count: results.length,
        },
        ipAddress,
        connection,
      });

      await connection.commit();

      return {
        exam_id,
        processed_count: results.length,
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }
}

