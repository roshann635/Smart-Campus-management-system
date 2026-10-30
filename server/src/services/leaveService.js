import { query, getConnection } from '../config/db.js';
import { AuditService } from './auditService.js';

export class LeaveService {
  /**
   * Student submits a leave application for an enrolled course on a specific date.
   */
  static async submitLeaveRequest({ studentId, enrollmentId, leaveDate, reason, actorUserId, ipAddress }) {
    // 1. Verify enrollment belongs to student
    const [enrRows] = await query(
      `SELECT e.enrollment_id, e.course_id, c.course_code, c.course_name 
       FROM enrollments e
       JOIN courses c ON e.course_id = c.course_id
       WHERE e.enrollment_id = ? AND e.student_id = ? AND e.status = 'enrolled'`,
      [enrollmentId, studentId]
    );

    if (!enrRows || enrRows.length === 0) {
      const err = new Error('Invalid enrollment or course not actively enrolled.');
      err.statusCode = 400;
      throw err;
    }

    // 2. Check for duplicate leave date
    const [dup] = await query(
      `SELECT leave_id FROM leave_requests WHERE enrollment_id = ? AND leave_date = ?`,
      [enrollmentId, leaveDate]
    );
    if (dup && dup.length > 0) {
      const err = new Error('A leave request has already been submitted for this date.');
      err.statusCode = 409;
      err.code = 'DUPLICATE_LEAVE_REQUEST';
      throw err;
    }

    // 3. Insert leave request
    const insertSql = `
      INSERT INTO leave_requests (enrollment_id, leave_date, reason, status)
      VALUES (?, ?, ?, 'Pending')
    `;
    const [result] = await query(insertSql, [enrollmentId, leaveDate, reason]);
    const leaveId = result.insertId;

    await AuditService.log({
      actorUserId,
      action: 'LEAVE_REQUEST_SUBMITTED',
      entityType: 'leave_requests',
      entityId: leaveId,
      metadata: { enrollmentId, leaveDate, reason },
      ipAddress,
    });

    return {
      leave_id: leaveId,
      enrollment_id: enrollmentId,
      course_code: enrRows[0].course_code,
      course_name: enrRows[0].course_name,
      leave_date: leaveDate,
      reason,
      status: 'Pending',
    };
  }

  /**
   * Retrieves leave requests according to user role.
   */
  static async getLeaveRequests({ userRole, studentId, facultyId }) {
    let sql = `
      SELECT 
        lr.leave_id,
        lr.enrollment_id,
        lr.leave_date,
        lr.reason,
        lr.status,
        lr.reviewed_by,
        lr.review_remarks,
        lr.created_at,
        lr.updated_at,
        s.student_id,
        s.roll_number,
        CONCAT(s.first_name, ' ', s.last_name) AS student_name,
        c.course_id,
        c.course_code,
        c.course_name,
        c.faculty_id
      FROM leave_requests lr
      JOIN enrollments e ON lr.enrollment_id = e.enrollment_id
      JOIN students s ON e.student_id = s.student_id
      JOIN courses c ON e.course_id = c.course_id
    `;

    const where = [];
    const params = [];

    if (userRole === 'student') {
      where.push('s.student_id = ?');
      params.push(studentId);
    } else if (userRole === 'faculty') {
      where.push('c.faculty_id = ?');
      params.push(facultyId);
    }

    if (where.length > 0) {
      sql += ' WHERE ' + where.join(' AND ');
    }

    sql += ' ORDER BY lr.created_at DESC';

    const [rows] = await query(sql, params);
    return Array.isArray(rows) ? rows : [];
  }

  /**
   * Reviews leave request (Approve / Reject) in an ACID transaction.
   * If Approved, automatically marks attendance as 'Excused' and sends student notification.
   */
  static async reviewLeaveRequest({ leaveId, status, reviewRemarks, reviewerUserId, reviewerFacultyId, reviewerRole, ipAddress }) {
    if (!['Approved', 'Rejected'].includes(status)) {
      const err = new Error('Review status must be Approved or Rejected.');
      err.statusCode = 400;
      throw err;
    }

    const connection = await getConnection();
    try {
      await connection.beginTransaction();

      // 1. Fetch leave request details
      const [leaveRows] = await connection.query(
        `SELECT lr.*, e.enrollment_id, e.course_id, e.student_id, c.faculty_id, c.course_code, s.user_id AS student_user_id
         FROM leave_requests lr
         JOIN enrollments e ON lr.enrollment_id = e.enrollment_id
         JOIN courses c ON e.course_id = c.course_id
         JOIN students s ON e.student_id = s.student_id
         WHERE lr.leave_id = ?`,
        [leaveId]
      );

      if (!leaveRows || leaveRows.length === 0) {
        const err = new Error('Leave request not found.');
        err.statusCode = 404;
        throw err;
      }

      const leave = leaveRows[0];

      // 2. Strict Course Isolation: Faculty cannot review unassigned course requests
      if (reviewerRole === 'faculty' && Number(leave.faculty_id) !== Number(reviewerFacultyId)) {
        const err = new Error('You are not authorized to review leave requests for unassigned courses.');
        err.statusCode = 403;
        err.code = 'COURSE_ACCESS_FORBIDDEN';
        throw err;
      }

      // 3. Update Leave Request Status
      await connection.query(
        `UPDATE leave_requests 
         SET status = ?, reviewed_by = ?, review_remarks = ?
         WHERE leave_id = ?`,
        [status, reviewerUserId, reviewRemarks || null, leaveId]
      );

      // 4. If Approved, atomically mark attendance as Excused
      if (status === 'Approved') {
        const attSql = `
          INSERT INTO attendance (enrollment_id, attendance_date, status, marked_by, remarks)
          VALUES (?, ?, 'Excused', ?, ?)
          ON DUPLICATE KEY UPDATE 
            status = 'Excused',
            marked_by = VALUES(marked_by),
            remarks = VALUES(remarks)
        `;
        await connection.query(attSql, [
          leave.enrollment_id,
          leave.leave_date,
          reviewerUserId,
          reviewRemarks ? `Excused: ${reviewRemarks}` : 'Excused via approved leave',
        ]);
      }

      // 5. Create In-App Notification for Student
      const notifSql = `
        INSERT INTO notifications (user_id, title, message, type, is_read)
        VALUES (?, ?, ?, 'LEAVE_UPDATE', 0)
      `;
      const notifMessage = status === 'Approved'
        ? `Your leave request for ${leave.course_code} on ${leave.leave_date} has been Approved (Marked as Excused).`
        : `Your leave request for ${leave.course_code} on ${leave.leave_date} was Rejected. Remarks: ${reviewRemarks || 'None'}`;

      await connection.query(notifSql, [
        leave.student_user_id,
        `Leave Request ${status}`,
        notifMessage,
      ]);

      // 6. Audit Trail
      await AuditService.log({
        actorUserId: reviewerUserId,
        action: 'LEAVE_REQUEST_REVIEWED',
        entityType: 'leave_requests',
        entityId: leaveId,
        metadata: { status, reviewRemarks, enrollmentId: leave.enrollment_id, leaveDate: leave.leave_date },
        ipAddress,
        connection,
      });

      await connection.commit();

      return {
        leave_id: leaveId,
        status,
        review_remarks: reviewRemarks,
        reviewed_by: reviewerUserId,
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      if (connection.release) connection.release();
    }
  }
}

