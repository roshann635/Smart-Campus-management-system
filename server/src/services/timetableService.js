import { query, getConnection } from '../config/db.js';
import { AuditService } from './auditService.js';

export class TimetableService {
  /**
   * Retrieves timetable slots with optional filters.
   */
  static async getTimetable({ departmentId, semester, academicYear, facultyId, studentId }) {
    let sql = `
      SELECT 
        ts.slot_id,
        ts.course_id,
        ts.day_of_week,
        ts.start_time,
        ts.end_time,
        ts.room_number,
        ts.semester,
        ts.academic_year,
        c.course_code,
        c.course_name,
        c.credits,
        c.department_id,
        c.faculty_id,
        f.first_name AS faculty_first_name,
        f.last_name AS faculty_last_name,
        f.employee_code
      FROM timetable_slots ts
      JOIN courses c ON ts.course_id = c.course_id
      LEFT JOIN faculty f ON c.faculty_id = f.faculty_id
    `;

    const whereClauses = [];
    const params = [];

    if (studentId) {
      sql += ` JOIN enrollments e ON c.course_id = e.course_id AND e.status = 'enrolled'`;
      whereClauses.push('e.student_id = ?');
      params.push(studentId);
    }

    if (departmentId) {
      whereClauses.push('c.department_id = ?');
      params.push(departmentId);
    }

    if (semester) {
      whereClauses.push('ts.semester = ?');
      params.push(semester);
    }

    if (academicYear) {
      whereClauses.push('ts.academic_year = ?');
      params.push(academicYear);
    }

    if (facultyId) {
      whereClauses.push('c.faculty_id = ?');
      params.push(facultyId);
    }

    if (whereClauses.length > 0) {
      sql += ` WHERE ` + whereClauses.join(' AND ');
    }

    sql += ` ORDER BY FIELD(ts.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'), ts.start_time ASC`;

    const [rows] = await query(sql, params);
    return Array.isArray(rows) ? rows : [];
  }

  /**
   * Adds a new timetable slot with strict Room and Faculty overlap detection.
   */
  static async createSlot({ courseId, dayOfWeek, startTime, endTime, roomNumber, semester, academicYear, actorUserId, ipAddress }) {
    if (startTime >= endTime) {
      const err = new Error('Slot end time must be after start time.');
      err.statusCode = 400;
      throw err;
    }

    // 1. Room Overlap Check
    const roomOverlapSql = `
      SELECT ts.slot_id, ts.room_number, ts.day_of_week, ts.start_time, ts.end_time, c.course_code
      FROM timetable_slots ts
      JOIN courses c ON ts.course_id = c.course_id
      WHERE ts.day_of_week = ?
        AND ts.academic_year = ?
        AND ts.semester = ?
        AND ts.room_number = ?
        AND (ts.start_time < ? AND ts.end_time > ?)
    `;
    const [roomConflicts] = await query(roomOverlapSql, [dayOfWeek, academicYear, semester, roomNumber, endTime, startTime]);
    if (roomConflicts && roomConflicts.length > 0) {
      const c = roomConflicts[0];
      const err = new Error(`Room conflict: Room ${roomNumber} is already booked on ${dayOfWeek} from ${c.start_time} to ${c.end_time} for ${c.course_code}.`);
      err.statusCode = 409;
      err.code = 'ROOM_CONFLICT';
      throw err;
    }

    // 2. Faculty Overlap Check
    const facultyOverlapSql = `
      SELECT ts.slot_id, ts.room_number, ts.day_of_week, ts.start_time, ts.end_time, c.course_code,
             CONCAT(f.first_name, ' ', f.last_name) AS faculty_name
      FROM timetable_slots ts
      JOIN courses c ON ts.course_id = c.course_id
      JOIN faculty f ON c.faculty_id = f.faculty_id
      WHERE c.faculty_id = (SELECT faculty_id FROM courses WHERE course_id = ?)
        AND ts.day_of_week = ?
        AND ts.academic_year = ?
        AND (ts.start_time < ? AND ts.end_time > ?)
    `;
    const [facConflicts] = await query(facultyOverlapSql, [courseId, dayOfWeek, academicYear, endTime, startTime]);
    if (facConflicts && facConflicts.length > 0) {
      const f = facConflicts[0];
      const err = new Error(`Faculty clash: Instructor ${f.faculty_name || 'assigned to this course'} is already scheduled in Room ${f.room_number} on ${dayOfWeek} during this slot (${f.start_time} - ${f.end_time}).`);
      err.statusCode = 409;
      err.code = 'FACULTY_CLASH';
      throw err;
    }

    // 3. Insert Slot
    const insertSql = `
      INSERT INTO timetable_slots (course_id, day_of_week, start_time, end_time, room_number, semester, academic_year)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await query(insertSql, [courseId, dayOfWeek, startTime, endTime, roomNumber, semester, academicYear]);
    const slotId = result.insertId;

    await AuditService.log({
      actorUserId,
      action: 'TIMETABLE_SLOT_CREATED',
      entityType: 'timetable_slots',
      entityId: slotId,
      metadata: { courseId, dayOfWeek, startTime, endTime, roomNumber, semester, academicYear },
      ipAddress,
    });

    return {
      slot_id: slotId,
      course_id: courseId,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      room_number: roomNumber,
      semester,
      academic_year: academicYear,
    };
  }

  /**
   * Deletes a timetable slot.
   */
  static async deleteSlot(slotId, actorUserId, ipAddress) {
    const [existing] = await query(`SELECT * FROM timetable_slots WHERE slot_id = ?`, [slotId]);
    if (!existing || existing.length === 0) {
      const err = new Error('Timetable slot not found.');
      err.statusCode = 404;
      throw err;
    }

    await query(`DELETE FROM timetable_slots WHERE slot_id = ?`, [slotId]);

    await AuditService.log({
      actorUserId,
      action: 'TIMETABLE_SLOT_DELETED',
      entityType: 'timetable_slots',
      entityId: slotId,
      metadata: existing[0],
      ipAddress,
    });

    return true;
  }
}

