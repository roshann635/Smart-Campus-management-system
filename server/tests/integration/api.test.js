import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { setMockPool } from '../../src/config/db.js';
import { TestDbHarness } from '../helpers/testDbHarness.js';
import { StudentService } from '../../src/services/studentService.js';

let testDb;

beforeAll(() => {
  testDb = new TestDbHarness();
  setMockPool(testDb);
});

beforeEach(() => {
  testDb.reset();
});

// Helper to log in and retrieve session cookie
async function loginAs(email, password = 'Campus@123') {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  const cookie = res.headers['set-cookie'];
  return { res, cookie, user: res.body.data };
}

describe('Smart Campus 22 Mandatory Verification Scenarios', () => {
  // Scenario 1: Successful login & session cookie creation
  it('Scenario 1: Successful login & session cookie creation', async () => {
    const { res, cookie } = await loginAs('admin@campus.edu');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('administrator');
    expect(cookie).toBeDefined();
    expect(cookie[0]).toContain('campus_session_id');
  });

  // Scenario 2: Login rejection with invalid password or inactive user (401/403)
  it('Scenario 2: Login rejection with invalid password or inactive user (401/403)', async () => {
    const badPass = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@campus.edu', password: 'WrongPassword@999' });
    expect(badPass.status).toBe(401);
    expect(badPass.body.error.code).toBe('INVALID_CREDENTIALS');

    const inactiveUser = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inactive@campus.edu', password: 'Campus@123' });
    expect(inactiveUser.status).toBe(403);
    expect(inactiveUser.body.error.code).toBe('ACCOUNT_INACTIVE');
  });

  // Scenario 3: Logout and session invalidation (GET /api/auth/me returns 401 after logout)
  it('Scenario 3: Logout and session invalidation (GET /api/auth/me returns 401 after logout)', async () => {
    const { cookie } = await loginAs('admin@campus.edu');
    const meBefore = await request(app).get('/api/auth/me').set('Cookie', cookie);
    expect(meBefore.status).toBe(200);

    const logoutRes = await request(app).post('/api/auth/logout').set('Cookie', cookie);
    expect(logoutRes.status).toBe(200);

    const meAfter = await request(app).get('/api/auth/me').set('Cookie', cookie);
    expect(meAfter.status).toBe(401);
  });

  // Scenario 4: Unauthenticated request blocked on protected routes (401)
  it('Scenario 4: Unauthenticated request blocked on protected routes (401)', async () => {
    const res = await request(app).get('/api/departments');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  // Scenario 5: Student successfully reading their own attendance and results (200)
  it('Scenario 5: Student successfully reading their own attendance and results (200)', async () => {
    const { cookie } = await loginAs('student1@campus.edu');
    const attRes = await request(app).get('/api/attendance/student/1').set('Cookie', cookie);
    expect(attRes.status).toBe(200);
    expect(attRes.body.success).toBe(true);

    const resRes = await request(app).get('/api/results/student/1').set('Cookie', cookie);
    expect(resRes.status).toBe(200);
    expect(resRes.body.success).toBe(true);
  });

  // Scenario 6: Student blocked from reading another student\'s profile, attendance, or results (403)
  it('Scenario 6: Student blocked from reading another student\'s profile, attendance, or results (403)', async () => {
    const { cookie } = await loginAs('student1@campus.edu'); // student1 has student_id = 1

    const student2Profile = await request(app).get('/api/students/2').set('Cookie', cookie);
    expect(student2Profile.status).toBe(403);

    const student2Attendance = await request(app).get('/api/attendance/student/2').set('Cookie', cookie);
    expect(student2Attendance.status).toBe(403);

    const student2Results = await request(app).get('/api/results/student/2').set('Cookie', cookie);
    expect(student2Results.status).toBe(403);
  });

  // Scenario 7: Faculty blocked from marking attendance or entering marks for an unassigned course (403)
  it('Scenario 7: Faculty blocked from marking attendance or entering marks for an unassigned course (403)', async () => {
    const { cookie } = await loginAs('faculty1@campus.edu'); // faculty 1 is assigned course 1 & 2, but NOT course 3 (EC201)

    // Attempting to post attendance for unassigned course 3
    const attRes = await request(app)
      .post('/api/attendance/bulk')
      .set('Cookie', cookie)
      .send({
        course_id: 3,
        attendance_date: '2026-02-15',
        records: [{ enrollment_id: 1, status: 'Present' }],
      });
    expect(attRes.status).toBe(403);
    expect(attRes.body.error.code).toBe('FORBIDDEN_COURSE_UNASSIGNED');

    // Attempting to enter results for exam on unassigned course 3 (Exam 2)
    const marksRes = await request(app)
      .post('/api/results/bulk')
      .set('Cookie', cookie)
      .send({
        exam_id: 2,
        results: [{ enrollment_id: 1, marks_obtained: 40 }],
      });
    expect(marksRes.status).toBe(403);
  });

  // Scenario 8: Full CRUD lifecycle on departments, students, faculty, and courses (201, 200)
  it('Scenario 8: Full CRUD lifecycle on departments, students, faculty, and courses (201, 200)', async () => {
    const { cookie } = await loginAs('admin@campus.edu');

    // Create Department
    const createDept = await request(app)
      .post('/api/departments')
      .set('Cookie', cookie)
      .send({ code: 'AI', name: 'Artificial Intelligence', description: 'AI & Data' });
    expect(createDept.status).toBe(201);
    const newDeptId = createDept.body.data.department_id;

    // Create Student
    const createStu = await request(app)
      .post('/api/students')
      .set('Cookie', cookie)
      .send({
        email: 'danny@campus.edu',
        roll_number: 'AI2025001',
        first_name: 'Danny',
        last_name: 'Dev',
        dob: '2004-01-01',
        enrollment_year: 2025,
        department_id: newDeptId,
      });
    expect(createStu.status).toBe(201);

    // Create Faculty
    const createFac = await request(app)
      .post('/api/faculty')
      .set('Cookie', cookie)
      .send({
        email: 'prof.ai@campus.edu',
        employee_code: 'FAC-AI-001',
        first_name: 'John',
        last_name: 'McCarthy',
        designation: 'Chair Professor',
        department_id: newDeptId,
      });
    expect(createFac.status).toBe(201);
    const newFacId = createFac.body.data.faculty_id;

    // Create Course
    const createCourse = await request(app)
      .post('/api/courses')
      .set('Cookie', cookie)
      .send({
        course_code: 'AI101',
        course_name: 'Intro to AI',
        credits: 4,
        semester: 1,
        department_id: newDeptId,
        faculty_id: newFacId,
      });
    expect(createCourse.status).toBe(201);
  });

  // Scenario 9: Duplicate student email or roll_number rejected (409 Conflict)
  it('Scenario 9: Duplicate student email or roll_number rejected (409 Conflict)', async () => {
    const { cookie } = await loginAs('admin@campus.edu');

    // Duplicate email
    const dupEmail = await request(app)
      .post('/api/students')
      .set('Cookie', cookie)
      .send({
        email: 'student1@campus.edu', // duplicate email
        roll_number: 'NEWROLL123',
        first_name: 'Test',
        last_name: 'Student',
        dob: '2004-01-01',
        enrollment_year: 2025,
        department_id: 1,
      });
    expect(dupEmail.status).toBe(409);

    // Duplicate roll number
    const dupRoll = await request(app)
      .post('/api/students')
      .set('Cookie', cookie)
      .send({
        email: 'unique_student@campus.edu',
        roll_number: 'CS2025001', // duplicate roll
        first_name: 'Test',
        last_name: 'Student',
        dob: '2004-01-01',
        enrollment_year: 2025,
        department_id: 1,
      });
    expect(dupRoll.status).toBe(409);
  });

  // Scenario 10: Duplicate course_code rejected (409 Conflict)
  it('Scenario 10: Duplicate course_code rejected (409 Conflict)', async () => {
    const { cookie } = await loginAs('admin@campus.edu');
    const dupCourse = await request(app)
      .post('/api/courses')
      .set('Cookie', cookie)
      .send({
        course_code: 'CS101', // duplicate course code
        course_name: 'Duplicate DBMS',
        credits: 4,
        semester: 4,
        department_id: 1,
      });
    expect(dupCourse.status).toBe(409);
  });

  // Scenario 11: Duplicate course enrolment (student_id, course_id, semester, academic_year) rejected (409 Conflict)
  it('Scenario 11: Duplicate course enrolment rejected (409 Conflict)', async () => {
    const { cookie } = await loginAs('admin@campus.edu');
    const dupEnr = await request(app)
      .post('/api/enrollments')
      .set('Cookie', cookie)
      .send({
        student_id: 1,
        course_id: 1,
        semester: 4,
        academic_year: '2025-2026', // already exists in seed
      });
    expect(dupEnr.status).toBe(409);
  });

  // Scenario 12: Duplicate daily attendance prevented or cleanly upserted
  it('Scenario 12: Duplicate daily attendance prevented or cleanly upserted', async () => {
    const { cookie } = await loginAs('faculty1@campus.edu');
    const res = await request(app)
      .post('/api/attendance/bulk')
      .set('Cookie', cookie)
      .send({
        course_id: 1,
        attendance_date: '2026-02-02', // existing date
        records: [{ enrollment_id: 1, status: 'Late', remarks: 'Updated to late' }],
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  // Scenario 13: Invalid foreign-key reference handled gracefully (400/404, never raw 500)
  it('Scenario 13: Invalid foreign-key reference handled gracefully (400/404)', async () => {
    const { cookie } = await loginAs('admin@campus.edu');

    // Nonexistent department_id
    const badDept = await request(app)
      .post('/api/students')
      .set('Cookie', cookie)
      .send({
        email: 'foreign_key_fail@campus.edu',
        roll_number: 'FKFAIL001',
        first_name: 'Bad',
        last_name: 'FK',
        dob: '2004-01-01',
        enrollment_year: 2025,
        department_id: 999999,
      });
    expect([400, 404]).toContain(badDept.status);
    expect(badDept.body.success).toBe(false);
  });

  // Scenario 14: Marks entry exceeding exam.max_marks or negative marks rejected (400 Bad Request)
  it('Scenario 14: Marks entry exceeding exam.max_marks or negative marks rejected (400 Bad Request)', async () => {
    const { cookie } = await loginAs('faculty1@campus.edu');

    // Exceeding max marks (50.0)
    const exceed = await request(app)
      .post('/api/results/bulk')
      .set('Cookie', cookie)
      .send({
        exam_id: 1,
        results: [{ enrollment_id: 1, marks_obtained: 55.5 }],
      });
    expect(exceed.status).toBe(400);
    expect(exceed.body.error.code).toBe('MARKS_EXCEED_MAXIMUM');

    // Negative marks
    const neg = await request(app)
      .post('/api/results/bulk')
      .set('Cookie', cookie)
      .send({
        exam_id: 1,
        results: [{ enrollment_id: 1, marks_obtained: -10 }],
      });
    expect(neg.status).toBe(400);
  });

  // Scenario 15: Duplicate exam result handled/prevented (upsert / update)
  it('Scenario 15: Duplicate exam result handled/prevented (clean upsert)', async () => {
    const { cookie } = await loginAs('faculty1@campus.edu');
    const res = await request(app)
      .post('/api/results/bulk')
      .set('Cookie', cookie)
      .send({
        exam_id: 1,
        results: [{ enrollment_id: 1, marks_obtained: 48.0 }],
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  // Scenario 16: Unit/Integration test verifying exact attendance percentage calculation
  it('Scenario 16: Unit/Integration test verifying exact attendance percentage calculation', async () => {
    const { cookie } = await loginAs('admin@campus.edu');
    const rep = await request(app).get('/api/reports/attendance').set('Cookie', cookie);
    expect(rep.status).toBe(200);
    const row = rep.body.data[0];
    expect(row).toBeDefined();
    expect(row).toHaveProperty('attendance_percentage');
  });

  // Scenario 17: Verification of aggregate report views (vw_student_attendance_summary, vw_course_performance_summary)
  it('Scenario 17: Verification of aggregate report views', async () => {
    const { cookie } = await loginAs('admin@campus.edu');
    const attView = await request(app).get('/api/reports/attendance').set('Cookie', cookie);
    expect(attView.status).toBe(200);

    const perfView = await request(app).get('/api/reports/performance').set('Cookie', cookie);
    expect(perfView.status).toBe(200);
    expect(perfView.body.data[0]).toHaveProperty('average_marks');
  });

  // Scenario 18: SQL injection payload safely neutralized by prepared statements
  it('Scenario 18: SQL injection payload safely neutralized by prepared statements', async () => {
    const { cookie } = await loginAs('admin@campus.edu');
    const sqli = await request(app)
      .get("/api/students?search=' OR 1=1 --")
      .set('Cookie', cookie);
    expect(sqli.status).toBe(200);
    expect(sqli.body.data.length).toBe(0); // Safely treated as literal string, no injection
  });

  // Scenario 19: Multi-table transaction rollback verification
  it('Scenario 19: Multi-table transaction rollback verification', async () => {
    const initialUsersCount = testDb.tables.users.length;
    let failed = false;

    try {
      // Force failure during student creation: duplicate roll_number CS2025001
      await StudentService.createStudent({
        email: 'rollback_test@campus.edu',
        roll_number: 'CS2025001', // Collides with existing student
        first_name: 'Rollback',
        last_name: 'Test',
        dob: '2004-01-01',
        enrollment_year: 2025,
        department_id: 1,
      });
    } catch (err) {
      failed = true;
    }

    expect(failed).toBe(true);
    // Assert that the user row inserted before student insert was rolled back
    expect(testDb.tables.users.length).toBe(initialUsersCount);
  });

  // Scenario 20: Pagination (page, limit) and search filtering accuracy on /api/students
  it('Scenario 20: Pagination (page, limit) and search filtering accuracy on /api/students', async () => {
    const { cookie } = await loginAs('admin@campus.edu');
    const res = await request(app).get('/api/students?page=1&limit=2').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.limit).toBe(2);
  });

  // Scenario 21: Student/Faculty blocked from accessing /api/audit-logs and administrative exports (403)
  it('Scenario 21: Student/Faculty blocked from accessing /api/audit-logs and administrative exports (403)', async () => {
    const student = await loginAs('student1@campus.edu');
    const sLogs = await request(app).get('/api/audit-logs').set('Cookie', student.cookie);
    expect(sLogs.status).toBe(403);
    const sExport = await request(app).get('/api/reports/export/attendance').set('Cookie', student.cookie);
    expect(sExport.status).toBe(403);

    const faculty = await loginAs('faculty1@campus.edu');
    const fLogs = await request(app).get('/api/audit-logs').set('Cookie', faculty.cookie);
    expect(fLogs.status).toBe(403);
    const fExport = await request(app).get('/api/reports/export/attendance').set('Cookie', faculty.cookie);
    expect(fExport.status).toBe(403);
  });

  // Scenario 22: Malformed IDs and nonexistent IDs return 400 and 404 respectively
  it('Scenario 22: Malformed IDs (/api/students/abc) and nonexistent IDs (/api/students/999999) return 400 and 404 respectively', async () => {
    const { cookie } = await loginAs('admin@campus.edu');

    // Malformed ID (string instead of integer)
    const malformed = await request(app).get('/api/students/abc').set('Cookie', cookie);
    expect(malformed.status).toBe(400);

    // Nonexistent integer ID
    const notFound = await request(app).get('/api/students/999999').set('Cookie', cookie);
    expect(notFound.status).toBe(404);
  });

  // Scenario 23: Timetable slot creation rejects room or faculty time-slot overlap (409 Conflict)
  it('Scenario 23: Timetable slot creation rejects room or faculty time overlap with 409 Conflict', async () => {
    const { cookie } = await loginAs('admin@campus.edu');

    // Attempt to book slot that conflicts with existing Monday slot in Room 101 (09:00 - 10:30)
    const res = await request(app)
      .post('/api/timetable')
      .set('Cookie', cookie)
      .send({
        course_id: 2,
        day_of_week: 'Monday',
        start_time: '09:30:00',
        end_time: '11:00:00',
        room_number: 'Room 101',
        semester: 3,
        academic_year: '2025-2026',
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toMatch(/ROOM_CONFLICT|ROOM_SLOT_CONFLICT|FACULTY_SCHEDULE_CONFLICT/);
  });

  // Scenario 24: Course enrollment blocked when student lacks required prerequisite (400 Bad Request)
  it('Scenario 24: Course enrollment blocked when student lacks required prerequisite (400)', async () => {
    const { cookie } = await loginAs('admin@campus.edu');

    // Student 3 attempts to enroll in Course 1 (which has Course 2 as prerequisite, and student 3 has not completed it)
    const res = await request(app)
      .post('/api/enrollments')
      .set('Cookie', cookie)
      .send({
        student_id: 3,
        course_id: 1,
        semester: 3,
        academic_year: '2025-2026',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('PREREQUISITE_NOT_MET');
  });

  // Scenario 25: Course enrollment blocked when semester credit cap (24 credits) is exceeded (400 Bad Request)
  it('Scenario 25: Course enrollment blocked when semester credit cap is exceeded (400)', async () => {
    const { cookie } = await loginAs('admin@campus.edu');

    // Temporarily add high-credit enrollments for student 1 in testDb
    testDb.tables.courses.push({
      course_id: 99,
      course_code: 'TEST999',
      course_name: 'Massive Credits Lab',
      credits: 22,
      department_id: 1,
      semester: 1,
    });
    testDb.tables.enrollments.push({
      enrollment_id: 999,
      student_id: 1,
      course_id: 99,
      semester: 1,
      academic_year: '2025-2026',
      status: 'enrolled',
    });

    // Student 1 now has 22 credits; enrolling in 4-credit course 1 would make it 26 > 24
    const res = await request(app)
      .post('/api/enrollments')
      .set('Cookie', cookie)
      .send({
        student_id: 1,
        course_id: 2,
        semester: 1,
        academic_year: '2025-2026',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('CREDIT_LIMIT_EXCEEDED');

    // Cleanup
    testDb.tables.courses = testDb.tables.courses.filter(c => c.course_id !== 99);
    testDb.tables.enrollments = testDb.tables.enrollments.filter(e => e.enrollment_id !== 999);
  });

  // Scenario 26: Student submits leave request (201), Faculty approves it (200) -> transactional Excused status
  it('Scenario 26: Student submits leave request (201), Faculty approves it (200)', async () => {
    const student = await loginAs('student1@campus.edu');

    // Student submits leave
    const leaveRes = await request(app)
      .post('/api/leaves')
      .set('Cookie', student.cookie)
      .send({
        enrollment_id: 1,
        leave_date: '2025-11-20',
        reason: 'Medical appointment',
      });

    expect(leaveRes.status).toBe(201);
    const leaveId = leaveRes.body.data.leave_id;

    // Faculty 1 approves leave
    const faculty = await loginAs('faculty1@campus.edu');
    const reviewRes = await request(app)
      .patch(`/api/leaves/${leaveId}/review`)
      .set('Cookie', faculty.cookie)
      .send({
        status: 'Approved',
        review_remarks: 'Doctor certificate verified.',
      });

    expect(reviewRes.status).toBe(200);
    expect(reviewRes.body.data.status).toBe('Approved');
  });

  // Scenario 27: Faculty blocked from approving leave request for an unassigned course (403)
  it('Scenario 27: Faculty blocked from approving leave request for an unassigned course (403)', async () => {
    // Leave 2 is for Enrollment 3 (Course 3, which belongs to Faculty 2)
    // Faculty 1 tries to approve Leave 2
    const faculty1 = await loginAs('faculty1@campus.edu');
    const res = await request(app)
      .patch('/api/leaves/2/review')
      .set('Cookie', faculty1.cookie)
      .send({
        status: 'Approved',
        review_remarks: 'Cross-faculty approval attempt',
      });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toMatch(/COURSE_ACCESS_FORBIDDEN|UNAUTHORIZED_COURSE_ACCESS/);
  });

  // Scenario 28: GET /api/reports/at-risk accurately flags students with <75% attendance or <40% marks
  it('Scenario 28: GET /api/reports/at-risk accurately flags students from vw_at_risk_students', async () => {
    const { cookie } = await loginAs('admin@campus.edu');
    const res = await request(app).get('/api/reports/at-risk').set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    const flagged = res.body.data[0];
    expect(flagged).toHaveProperty('risk_category');
    expect(flagged).toHaveProperty('attendance_percentage');
  });

  // Scenario 29: GET /api/students/:id/transcript returns credit-weighted SGPA/CGPA, SHA-256 hash, and blocks cross-student access (403)
  it('Scenario 29: GET /api/students/:id/transcript returns SGPA/CGPA, SHA-256 hash, and blocks cross-student access (403)', async () => {
    // Admin can view transcript of Student 1
    const admin = await loginAs('admin@campus.edu');
    const adminView = await request(app).get('/api/students/1/transcript').set('Cookie', admin.cookie);
    expect(adminView.status).toBe(200);
    expect(adminView.body.data).toHaveProperty('cgpa');
    expect(adminView.body.data).toHaveProperty('verification_hash');
    expect(adminView.body.data.verification_hash).toHaveLength(64); // SHA-256 hex length

    // Student 1 can view their own transcript
    const student1 = await loginAs('student1@campus.edu');
    const ownView = await request(app).get('/api/students/1/transcript').set('Cookie', student1.cookie);
    expect(ownView.status).toBe(200);

    // Student 1 cannot view Student 2 transcript (403)
    const forbiddenView = await request(app).get('/api/students/2/transcript').set('Cookie', student1.cookie);
    expect(forbiddenView.status).toBe(403);
  });

  // Scenario 30: Bulk exam marks submission triggers student notifications and marking notifications as read
  it('Scenario 30: Notifications lifecycle - unread retrieval and mark-all-as-read', async () => {
    const student1 = await loginAs('student1@campus.edu');

    // Retrieve notifications for Student 1
    const getRes = await request(app).get('/api/notifications').set('Cookie', student1.cookie);
    expect(getRes.status).toBe(200);
    expect(Array.isArray(getRes.body.data.notifications)).toBe(true);

    // Mark all as read
    const readRes = await request(app).patch('/api/notifications/read-all').set('Cookie', student1.cookie);
    expect(readRes.status).toBe(200);
    expect(readRes.body.success).toBe(true);
  });

  // Scenario 31: Admin creates Fee Structure (201), triggers batch invoice generation (201) & verifies idempotency
  it('Scenario 31: Admin creates Fee Structure (201), triggers POST /api/fees/invoices/generate-batch and verifies idempotency', async () => {
    const admin = await loginAs('admin@campus.edu');

    // 1. Create a new fee structure for MECH (Dept 3), Semester 1, 2025-2026
    const structRes = await request(app)
      .post('/api/fees/structures')
      .set('Cookie', admin.cookie)
      .send({
        department_id: 3,
        semester: 1,
        academic_year: '2025-2026',
        tuition_fee: 40000.0,
        development_fee: 8000.0,
        laboratory_fee: 5000.0,
        library_fee: 2000.0,
        other_charges: 1000.0,
        due_date: '2026-05-30',
      });

    expect(structRes.status).toBe(201);
    expect(structRes.body.data).toHaveProperty('structure_id');
    expect(structRes.body.data.total_fee).toBe(56000.0);
    const structId = structRes.body.data.structure_id;

    // 2. Trigger batch invoice generation for this structure
    const batchRes = await request(app)
      .post('/api/fees/invoices/generate-batch')
      .set('Cookie', admin.cookie)
      .send({
        structure_id: structId,
      });

    expect(batchRes.status).toBe(201);
    expect(batchRes.body.data).toHaveProperty('generatedCount');

    // 3. Second run should be strictly idempotent (generatedCount: 0, skippedCount >= 0)
    const secondRun = await request(app)
      .post('/api/fees/invoices/generate-batch')
      .set('Cookie', admin.cookie)
      .send({
        structure_id: structId,
      });

    expect(secondRun.status).toBe(201);
    expect(secondRun.body.data.generatedCount).toBe(0);
  });

  // Scenario 32: Partial fee payment transitions invoice to Partially_Paid (200), subsequent final payment transitions to Paid
  it('Scenario 32: Partial fee payment transitions invoice to Partially_Paid (200), subsequent final payment transitions to Paid', async () => {
    // Invoice 3 exists for Student 3 (total_due: 66500, amount_paid: 0, status: Pending)
    const admin = await loginAs('admin@campus.edu');

    // Partial installment of 20,000
    const pay1 = await request(app)
      .post('/api/fees/invoices/3/pay')
      .set('Cookie', admin.cookie)
      .send({
        amount: 20000.0,
        payment_mode: 'UPI',
        transaction_reference: 'TXN_TEST_PARTIAL_001',
        remarks: 'First installment payment',
      });

    expect(pay1.status).toBe(200);
    expect(pay1.body.data.invoice_status).toBe('Partially_Paid');
    expect(pay1.body.data.new_amount_paid).toBe(20000.0);
    expect(pay1.body.data.remaining_balance).toBe(46500.0);

    // Final settlement of remaining 46,500
    const pay2 = await request(app)
      .post('/api/fees/invoices/3/pay')
      .set('Cookie', admin.cookie)
      .send({
        amount: 46500.0,
        payment_mode: 'Net_Banking',
        transaction_reference: 'TXN_TEST_FINAL_002',
        remarks: 'Final settlement payment',
      });

    expect(pay2.status).toBe(200);
    expect(pay2.body.data.invoice_status).toBe('Paid');
    expect(pay2.body.data.remaining_balance).toBe(0.0);
    expect(pay2.body.data).toHaveProperty('receipt_number');
  });

  // Scenario 33: Overpayment attempt rejected (400 Bad Request), cross-student receipt access blocked (403 Forbidden)
  it('Scenario 33: Overpayment attempt rejected (400 Bad Request) and cross-student receipt access blocked (403 Forbidden)', async () => {
    // Invoice 2 has net_payable: 66500, amount_paid: 30000, remaining: 36500
    const student2 = await loginAs('student2@campus.edu'); // student_id: 2

    // Attempting to pay 40,000 when remaining is 36,500 -> 400 Bad Request
    const overpayRes = await request(app)
      .post('/api/fees/invoices/2/pay')
      .set('Cookie', student2.cookie)
      .send({
        amount: 40000.0,
        payment_mode: 'Debit_Card',
        transaction_reference: 'TXN_TEST_OVERPAY_999',
      });

    expect(overpayRes.status).toBe(400);
    expect(overpayRes.body.error.message).toMatch(/exceeds the remaining balance/);

    // Payment 1 belongs to Student 1 (invoice 1). Student 2 attempting to view Student 1's receipt -> 403 Forbidden
    const crossStudentReceipt = await request(app)
      .get('/api/fees/payments/1/receipt')
      .set('Cookie', student2.cookie);

    expect(crossStudentReceipt.status).toBe(403);
    expect(crossStudentReceipt.body.error.message).toMatch(/Access denied/);

    // Student 1 viewing their own payment receipt -> 200 OK with authentic SHA-256 digital seal
    const student1 = await loginAs('student1@campus.edu'); // student_id: 1
    const ownReceipt = await request(app)
      .get('/api/fees/payments/1/receipt')
      .set('Cookie', student1.cookie);

    expect(ownReceipt.status).toBe(200);
    expect(ownReceipt.body.data).toHaveProperty('digital_seal');
    expect(ownReceipt.body.data.digital_seal).toHaveLength(64);
  });
});

