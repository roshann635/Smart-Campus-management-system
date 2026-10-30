import { query } from '../config/db.js';

export class ReportService {
  static async getAttendanceReport({ course_id = null, department_id = null, min_percentage = null, max_percentage = null } = {}) {
    const conditions = [];
    const params = [];

    if (course_id) {
      conditions.push('v.course_id = ?');
      params.push(course_id);
    }
    if (department_id) {
      conditions.push('s.department_id = ?');
      params.push(department_id);
    }
    if (min_percentage !== null) {
      conditions.push('v.attendance_percentage >= ?');
      params.push(min_percentage);
    }
    if (max_percentage !== null) {
      conditions.push('v.attendance_percentage <= ?');
      params.push(max_percentage);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        v.student_id,
        v.roll_number,
        v.student_name,
        v.course_id,
        v.course_code,
        v.course_name,
        v.semester,
        v.academic_year,
        v.total_classes,
        v.classes_attended,
        v.attendance_percentage
      FROM vw_student_attendance_summary v
      JOIN students s ON v.student_id = s.student_id
      ${whereClause}
      ORDER BY v.course_code ASC, v.roll_number ASC
    `;

    const [rows] = await query(sql, params);
    return rows;
  }

  static async getPerformanceReport({ course_id = null } = {}) {
    const conditions = [];
    const params = [];

    if (course_id) {
      conditions.push('v.course_id = ?');
      params.push(course_id);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        v.course_id,
        v.course_code,
        v.course_name,
        v.exam_id,
        v.exam_name,
        v.exam_type,
        v.exam_date,
        v.max_marks,
        v.total_students_graded,
        v.average_marks,
        v.highest_marks,
        v.lowest_marks,
        v.pass_count,
        v.pass_percentage
      FROM vw_course_performance_summary v
      ${whereClause}
      ORDER BY v.course_code ASC, v.exam_date DESC
    `;

    const [rows] = await query(sql, params);
    return rows;
  }

  static async getDepartmentMetrics() {
    const sql = `
      SELECT 
        department_id,
        department_code,
        department_name,
        total_active_students,
        total_active_faculty,
        total_courses
      FROM vw_department_metrics
      ORDER BY department_code ASC
    `;
    const [rows] = await query(sql);
    return rows;
  }

  static async getAtRiskStudentsReport({ facultyId = null, departmentId = null, riskCategory = null } = {}) {
    let sql = 'SELECT * FROM vw_at_risk_students';
    const conditions = [];
    const params = [];

    if (facultyId) {
      conditions.push('faculty_id = ?');
      params.push(facultyId);
    }
    if (departmentId) {
      conditions.push('department_id = ?');
      params.push(departmentId);
    }
    if (riskCategory) {
      conditions.push('risk_category = ?');
      params.push(riskCategory);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += " ORDER BY FIELD(risk_category, 'CRITICAL_BOTH', 'LOW_ATTENDANCE', 'ACADEMIC_PROBATION'), attendance_percentage ASC";

    const [rows] = await query(sql, params);
    return Array.isArray(rows) ? rows : [];
  }

  static async notifyAtRiskStudents({ studentIds = null, facultyId = null, actorUserId = null, ipAddress = null } = {}) {
    const atRisk = await this.getAtRiskStudentsReport({ facultyId });
    const targetStudents = studentIds && studentIds.length > 0
      ? atRisk.filter(s => studentIds.includes(s.student_id))
      : atRisk;

    let notifiedCount = 0;
    for (const st of targetStudents) {
      const [uRows] = await query('SELECT user_id FROM students WHERE student_id = ?', [st.student_id]);
      if (uRows && uRows.length > 0) {
        const userId = uRows[0].user_id;
        const msg = `Academic Alert: In ${st.course_code} (${st.course_name}), your attendance is ${st.attendance_percentage}% (risk category: ${st.risk_category}). Please consult your course instructor.`;
        await query(
          'INSERT INTO notifications (user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, 0)',
          [userId, 'Academic Warning & Attendance Alert', msg, 'ATTENDANCE_ALERT']
        );
        notifiedCount++;
      }
    }

    const { AuditService } = await import('./auditService.js');
    await AuditService.log({
      actorUserId,
      action: 'AT_RISK_INTERVENTION_NOTIFIED',
      entityType: 'reports',
      entityId: 'at_risk',
      metadata: { notifiedCount, targetCount: targetStudents.length },
      ipAddress,
    });

    return { notifiedCount };
  }
}

