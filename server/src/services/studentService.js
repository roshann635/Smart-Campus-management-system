import bcrypt from 'bcryptjs';
import { query, getConnection } from '../config/db.js';
import { AuditService } from './auditService.js';

export class StudentService {
  static async getStudents({ page = 1, limit = 10, search = '', department_id = null, status = null }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      conditions.push('(s.roll_number LIKE ? OR s.first_name LIKE ? OR s.last_name LIKE ? OR u.email LIKE ?)');
      params.push(term, term, term, term);
    }

    if (department_id) {
      conditions.push('s.department_id = ?');
      params.push(department_id);
    }

    if (status) {
      conditions.push('u.status = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*) AS total
      FROM students s
      JOIN users u ON s.user_id = u.user_id
      ${whereClause}
    `;
    const [countRows] = await query(countSql, params);
    const total = countRows[0].total;

    const dataSql = `
      SELECT 
        s.student_id,
        s.user_id,
        s.roll_number,
        s.first_name,
        s.last_name,
        s.dob,
        s.phone,
        s.address,
        s.enrollment_year,
        s.department_id,
        d.name AS department_name,
        d.code AS department_code,
        u.email,
        u.status,
        s.created_at,
        s.updated_at
      FROM students s
      JOIN users u ON s.user_id = u.user_id
      JOIN departments d ON s.department_id = d.department_id
      ${whereClause}
      ORDER BY s.roll_number ASC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await query(dataSql, [...params, Number(limit), Number(offset)]);
    return {
      students: rows,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async getStudentById(id) {
    const sql = `
      SELECT 
        s.student_id,
        s.user_id,
        s.roll_number,
        s.first_name,
        s.last_name,
        s.dob,
        s.phone,
        s.address,
        s.enrollment_year,
        s.department_id,
        d.name AS department_name,
        d.code AS department_code,
        u.email,
        u.status,
        s.created_at,
        s.updated_at
      FROM students s
      JOIN users u ON s.user_id = u.user_id
      JOIN departments d ON s.department_id = d.department_id
      WHERE s.student_id = ?
    `;
    const [rows] = await query(sql, [id]);
    if (rows.length === 0) {
      const err = new Error('Student not found.');
      err.statusCode = 404;
      err.code = 'STUDENT_NOT_FOUND';
      throw err;
    }
    return rows[0];
  }

  /**
   * ACID Transaction: Create User + Student Profile + Audit Log
   */
  static async createStudent(data, actorUserId = null, ipAddress = null) {
    const connection = await getConnection();
    try {
      await connection.beginTransaction();

      // 1. Verify department exists
      const [deptRows] = await connection.query('SELECT department_id FROM departments WHERE department_id = ?', [data.department_id]);
      if (deptRows.length === 0) {
        const err = new Error('Specified department does not exist.');
        err.statusCode = 400;
        err.code = 'INVALID_DEPARTMENT';
        throw err;
      }

      // 2. Hash password
      const passwordHash = await bcrypt.hash(data.password || 'Campus@123', 10);

      // 3. Insert into users
      const userSql = `INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, 'student', 'active')`;
      const [userResult] = await connection.query(userSql, [data.email, passwordHash]);
      const newUserId = userResult.insertId;

      // 4. Insert into students
      const studentSql = `
        INSERT INTO students (user_id, roll_number, first_name, last_name, dob, phone, address, enrollment_year, department_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [studentResult] = await connection.query(studentSql, [
        newUserId,
        data.roll_number,
        data.first_name,
        data.last_name,
        data.dob,
        data.phone || null,
        data.address || null,
        data.enrollment_year,
        data.department_id,
      ]);
      const newStudentId = studentResult.insertId;

      // 5. Insert Audit Log
      await AuditService.log({
        actorUserId,
        action: 'STUDENT_CREATED',
        entityType: 'students',
        entityId: newStudentId,
        metadata: {
          roll_number: data.roll_number,
          email: data.email,
          department_id: data.department_id,
        },
        ipAddress,
        connection,
      });

      await connection.commit();

      return {
        student_id: newStudentId,
        user_id: newUserId,
        roll_number: data.roll_number,
        first_name: data.first_name,
        last_name: data.last_name,
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

  static async updateStudent(id, data, actorUserId = null, ipAddress = null) {
    await this.getStudentById(id); // Ensure exists

    const fields = [];
    const params = [];

    if (data.first_name !== undefined) { fields.push('first_name = ?'); params.push(data.first_name); }
    if (data.last_name !== undefined) { fields.push('last_name = ?'); params.push(data.last_name); }
    if (data.dob !== undefined) { fields.push('dob = ?'); params.push(data.dob); }
    if (data.phone !== undefined) { fields.push('phone = ?'); params.push(data.phone); }
    if (data.address !== undefined) { fields.push('address = ?'); params.push(data.address); }
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
      await query(`UPDATE students SET ${fields.join(', ')} WHERE student_id = ?`, params);
    }

    await AuditService.log({
      actorUserId,
      action: 'STUDENT_UPDATED',
      entityType: 'students',
      entityId: id,
      metadata: data,
      ipAddress,
    });

    return this.getStudentById(id);
  }

  static async updateStatus(id, status, actorUserId = null, ipAddress = null) {
    const student = await this.getStudentById(id);
    await query('UPDATE users SET status = ? WHERE user_id = ?', [status, student.user_id]);

    await AuditService.log({
      actorUserId,
      action: 'STUDENT_STATUS_UPDATED',
      entityType: 'users',
      entityId: student.user_id,
      metadata: { student_id: id, status },
      ipAddress,
    });

    return { student_id: id, user_id: student.user_id, status };
  }

  /**
   * Retrieves 360-degree academic dossier for a student
   */
  static async getAcademicDossier(studentId) {
    const student = await this.getStudentById(studentId);

    // Enrollments
    const [enrollments] = await query(
      `SELECT e.enrollment_id, e.course_id, c.course_code, c.course_name, c.credits, e.semester, e.academic_year, e.status
       FROM enrollments e
       JOIN courses c ON e.course_id = c.course_id
       WHERE e.student_id = ?
       ORDER BY e.academic_year DESC, e.semester DESC`,
      [studentId]
    );

    // Attendance summary from view
    const [attendanceRows] = await query(
      `SELECT course_id, course_code, course_name, total_classes, classes_attended, attendance_percentage
       FROM vw_student_attendance_summary
       WHERE student_id = ?`,
      [studentId]
    );

    // Results
    const [results] = await query(
      `SELECT r.result_id, ex.exam_id, ex.exam_name, ex.exam_type, ex.max_marks,
              r.marks_obtained, r.grade, c.course_code, c.course_name, c.credits
       FROM results r
       JOIN exams ex ON r.exam_id = ex.exam_id
       JOIN enrollments e ON r.enrollment_id = e.enrollment_id
       JOIN courses c ON e.course_id = c.course_id
       WHERE e.student_id = ?
       ORDER BY ex.exam_date DESC`,
      [studentId]
    );

    // Calculate Cumulative GPA / Performance
    let totalCredits = 0;
    let totalPoints = 0;
    const gradePointsMap = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'F': 0 };

    for (const r of results) {
      const pts = gradePointsMap[r.grade] || 0;
      totalCredits += r.credits;
      totalPoints += (pts * r.credits);
    }

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

    return {
      student,
      enrollments,
      attendance: attendanceRows,
      results,
      metrics: {
        gpa: parseFloat(gpa),
        totalCreditsCompleted: totalCredits,
      },
    };
  }

  /**
   * Generates official academic transcript with semester-wise SGPA, overall CGPA,
   * credit totals, attendance compliance, and a deterministic SHA-256 verification hash.
   */
  static async getOfficialTranscript(studentId) {
    const crypto = await import('crypto');
    const dossier = await this.getAcademicDossier(studentId);
    const { student, enrollments, attendance, results } = dossier;

    const gradePointsMap = { 'O': 10.0, 'A+': 9.0, 'A': 8.0, 'B+': 7.0, 'B': 6.0, 'C': 5.0, 'P': 4.0, 'D': 4.0, 'F': 0.0 };

    // Group courses by semester
    const semesterMap = {};
    for (const enr of enrollments) {
      const semKey = `Semester ${enr.semester} (${enr.academic_year})`;
      if (!semesterMap[semKey]) {
        semesterMap[semKey] = {
          semester: enr.semester,
          academic_year: enr.academic_year,
          courses: [],
          registeredCredits: 0,
          earnedCredits: 0,
          weightedPoints: 0,
          sgpa: 0.0,
        };
      }

      const res = results.find(r => r.course_code === enr.course_code);
      const grade = res ? res.grade : (enr.status === 'completed' ? 'A' : 'In Progress');
      const marks = res ? res.marks_obtained : null;
      const maxMarks = res ? res.max_marks : null;
      const gp = gradePointsMap[grade] ?? (enr.status === 'completed' ? 8.0 : 0.0);
      const credits = Number(enr.credits || 4);

      semesterMap[semKey].courses.push({
        course_code: enr.course_code,
        course_name: enr.course_name,
        credits,
        marks,
        max_marks: maxMarks,
        grade,
        grade_point: gp,
        status: enr.status,
      });

      semesterMap[semKey].registeredCredits += credits;
      if (grade !== 'F' && grade !== 'In Progress') {
        semesterMap[semKey].earnedCredits += credits;
        semesterMap[semKey].weightedPoints += (credits * gp);
      }
    }

    let cumulativeRegisteredCredits = 0;
    let cumulativeEarnedCredits = 0;
    let cumulativePoints = 0;

    const semesters = Object.values(semesterMap).map(sem => {
      const sgpa = sem.registeredCredits > 0
        ? Math.round((sem.weightedPoints / sem.registeredCredits) * 100) / 100
        : 0.0;
      sem.sgpa = sgpa;
      cumulativeRegisteredCredits += sem.registeredCredits;
      cumulativeEarnedCredits += sem.earnedCredits;
      cumulativePoints += sem.weightedPoints;
      return sem;
    });

    const cgpa = cumulativeRegisteredCredits > 0
      ? Math.round((cumulativePoints / cumulativeRegisteredCredits) * 100) / 100
      : (dossier.metrics?.gpa || 0.0);

    let totalClasses = 0;
    let attendedClasses = 0;
    (attendance || []).forEach(a => {
      totalClasses += Number(a.total_classes || 0);
      attendedClasses += Number(a.classes_attended || 0);
    });
    const overallAttendance = totalClasses > 0
      ? Math.round((attendedClasses / totalClasses) * 10000) / 100
      : 100.0;

    const rawPayload = `${student.student_id}:${student.roll_number}:${cgpa}:${cumulativeEarnedCredits}:SMART_CAMPUS_VERIFIED_TRANSCRIPT`;
    const verificationHash = crypto.createHash('sha256').update(rawPayload).digest('hex');

    return {
      student,
      semesters,
      cgpa,
      verification_hash: verificationHash,
      summary: {
        totalRegisteredCredits: cumulativeRegisteredCredits,
        totalEarnedCredits: cumulativeEarnedCredits,
        cgpa,
        overallAttendancePercentage: overallAttendance,
        academicStanding: cgpa >= 8.5 ? 'First Class with Distinction' : cgpa >= 6.5 ? 'First Class' : 'Pass Division',
        verificationHash,
        issuedAt: new Date().toISOString(),
      },
    };
  }
}

