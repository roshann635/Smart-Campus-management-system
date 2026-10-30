# Testing Strategy, Test Plan & Requirements Traceability Matrix (RTM)
## Smart Campus Management System

---

## 1. Quality Assurance Strategy & Test Plan

### 1.1 Objective
Verify that the Smart Campus Management System operates reliably, maintains strict 3NF database invariants, prevents security regressions, enforces server-side RBAC, and delivers accurate academic performance reports.

### 1.2 Test Levels & Tools
- **Unit Testing (Vitest):** Tests pure business calculations (standardized grade tiers, percentage rounding, attendance metrics, CSV string escaping).
- **Integration & Security Testing (Vitest + Supertest):** Tests all 22 required system scenarios against the Express server running complete RBAC, Zod validation, and ACID database transactions.
- **E2E & Manual Verification:** Manual verification matrix of 25+ structured test cases with verified pass status.

---

## 2. Requirements Traceability Matrix (RTM)

| Requirement ID | Requirement Description | Automated Test Scenario | Manual Test ID | Status |
| :--- | :--- | :--- | :--- | :---: |
| **FR-1.1** | User login with email & password | Integration Scenario 1 | TC-AUTH-01 | PASS |
| **FR-1.2** | Secure session cookie generation | Integration Scenario 1 | TC-AUTH-02 | PASS |
| **FR-1.3** | Rejection of inactive user accounts | Integration Scenario 2 | TC-AUTH-03 | PASS |
| **FR-1.4** | User logout & session invalidation | Integration Scenario 3 | TC-AUTH-04 | PASS |
| **FR-2.1** | CRUD on academic departments | Integration Scenario 8 | TC-DEPT-01 | PASS |
| **FR-2.2** | Deletion blocked if department has relations | Integration Scenario 8 | TC-DEPT-02 | PASS |
| **FR-3.1** | Transactional student creation | Integration Scenario 8, 19 | TC-STU-01 | PASS |
| **FR-3.2** | Duplicate roll number or email rejected | Integration Scenario 9 | TC-STU-02 | PASS |
| **FR-4.1** | Course enrollment lifecycle | Integration Scenario 8 | TC-ENR-01 | PASS |
| **FR-4.2** | Duplicate enrollment prevention | Integration Scenario 11 | TC-ENR-02 | PASS |
| **FR-5.1** | Bulk attendance marking | Integration Scenario 12 | TC-ATT-01 | PASS |
| **FR-5.2** | Faculty course isolation on attendance | Integration Scenario 7 | TC-ATT-02 | PASS |
| **FR-5.3** | Attendance calculation formula verification | Unit Grading Test & Scen 16 | TC-ATT-03 | PASS |
| **FR-6.1** | Examination scheduling | Integration Scenario 8 | TC-EXAM-01 | PASS |
| **FR-6.2** | Marks obtained $\le$ max_marks enforcement | Integration Scenario 14 | TC-EXAM-02 | PASS |
| **FR-6.3** | Grade scale calculation | Unit Grading Test | TC-EXAM-03 | PASS |
| **FR-7.1** | SQL view execution & aggregation | Integration Scenario 17 | TC-REP-01 | PASS |
| **FR-7.2** | CSV export streaming | Unit CSV Test & Scen 21 | TC-REP-02 | PASS |
| **FR-8.1** | Strict student ownership isolation | Integration Scenario 6 | TC-SEC-01 | PASS |
| **FR-8.2** | Audit trail restricted to Administrator | Integration Scenario 21 | TC-SEC-02 | PASS |
| **NFR-3** | SQL injection parameterization protection | Integration Scenario 18 | TC-SEC-03 | PASS |

---

## 3. Comprehensive Manual Test Execution Matrix (25+ Test Cases)

| Test ID | Test Category | Preconditions | Execution Steps | Test Data | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Authentication | Server running | POST `/api/auth/login` with valid admin credentials | `admin@campus.edu` / `Campus@123` | HTTP 200, session cookie set | HTTP 200, cookie set | **PASS** |
| **TC-02** | Authentication | Server running | POST `/api/auth/login` with wrong password | `admin@campus.edu` / `BadPass` | HTTP 401 INVALID_CREDENTIALS | HTTP 401 | **PASS** |
| **TC-03** | Authentication | User status inactive | POST `/api/auth/login` for inactive user | `inactive@campus.edu` | HTTP 403 ACCOUNT_INACTIVE | HTTP 403 | **PASS** |
| **TC-04** | Authentication | Authenticated | POST `/api/auth/logout`, then GET `/api/auth/me` | Session Cookie | HTTP 200 on logout, 401 on me | HTTP 200, 401 | **PASS** |
| **TC-05** | Authorization | No cookie | GET `/api/departments` without headers | None | HTTP 401 UNAUTHENTICATED | HTTP 401 | **PASS** |
| **TC-06** | Student RBAC | Logged as Student 1 | GET `/api/attendance/student/1` | Session: Student 1 | HTTP 200 with own attendance | HTTP 200 | **PASS** |
| **TC-07** | Student RBAC | Logged as Student 1 | GET `/api/students/2` (Targeting Student 2) | Session: Student 1 | HTTP 403 FORBIDDEN | HTTP 403 | **PASS** |
| **TC-08** | Student RBAC | Logged as Student 1 | GET `/api/attendance/student/2` | Session: Student 1 | HTTP 403 FORBIDDEN | HTTP 403 | **PASS** |
| **TC-09** | Student RBAC | Logged as Student 1 | GET `/api/results/student/2` | Session: Student 1 | HTTP 403 FORBIDDEN | HTTP 403 | **PASS** |
| **TC-10** | Faculty RBAC | Logged as Faculty 1 | POST `/api/attendance/bulk` on Course 3 | `course_id: 3` (unassigned) | HTTP 403 FORBIDDEN_COURSE_UNASSIGNED | HTTP 403 | **PASS** |
| **TC-11** | Faculty RBAC | Logged as Faculty 1 | POST `/api/results/bulk` on Course 3 Exam | `exam_id: 2` (unassigned) | HTTP 403 FORBIDDEN_COURSE_UNASSIGNED | HTTP 403 | **PASS** |
| **TC-12** | Department CRUD | Admin session | POST `/api/departments` with valid info | Code: `AI`, Name: `Art. Intel.` | HTTP 201 Created | HTTP 201 | **PASS** |
| **TC-13** | Department Integrity| Dept has students | DELETE `/api/departments/1` | `id: 1` | HTTP 409 Conflict | HTTP 409 | **PASS** |
| **TC-14** | Student Creation | Admin session | POST `/api/students` with valid payload | Roll: `CS2025099` | HTTP 201 User + Student created | HTTP 201 | **PASS** |
| **TC-15** | Student Uniqueness | Student exists | POST `/api/students` with duplicate roll | Roll: `CS2025001` | HTTP 409 Conflict | HTTP 409 | **PASS** |
| **TC-16** | Course Uniqueness | Course CS101 exists | POST `/api/courses` with code `CS101` | Code: `CS101` | HTTP 409 Conflict | HTTP 409 | **PASS** |
| **TC-17** | Enrollment Unique | Enrolled in term | POST `/api/enrollments` with same term | `student: 1, course: 1, sem: 4` | HTTP 409 Conflict | HTTP 409 | **PASS** |
| **TC-18** | Attendance Upsert | Session exists | POST `/api/attendance/bulk` on same date | Status: `Late` | HTTP 201 Updated cleanly | HTTP 201 | **PASS** |
| **TC-19** | Foreign Key Check | Nonexistent Dept | POST `/api/students` with `dept_id: 9999`| `department_id: 9999` | HTTP 400 or 404 | HTTP 400 | **PASS** |
| **TC-20** | Grading Validation | Max marks = 50 | POST `/api/results/bulk` with marks 55 | `marks_obtained: 55` | HTTP 400 MARKS_EXCEED_MAXIMUM | HTTP 400 | **PASS** |
| **TC-21** | Grading Validation | Negative marks | POST `/api/results/bulk` with marks -5 | `marks_obtained: -5` | HTTP 400 Validation Error | HTTP 400 | **PASS** |
| **TC-22** | SQL Views | Database seeded | GET `/api/reports/attendance` | View Query | HTTP 200 with calculated % | HTTP 200 | **PASS** |
| **TC-23** | SQL Injection | Admin session | GET `/api/students?search=' OR 1=1 --` | SQL Injection payload | HTTP 200 Safe literal query | HTTP 200 | **PASS** |
| **TC-24** | ACID Rollback | Invalid student data | Force error after `users` insertion | Duplicate roll number | User row rolled back | Rolled back | **PASS** |
| **TC-25** | Admin Authorization| Student session | GET `/api/audit-logs` | Student cookie | HTTP 403 Forbidden | HTTP 403 | **PASS** |
| **TC-26** | Malformed Parameter| Admin session | GET `/api/students/invalid-string` | `/api/students/abc` | HTTP 400 Validation Error | HTTP 400 | **PASS** |

---

## 4. Regression Checklist
- [x] All 22 automated integration scenarios passing in Vitest.
- [x] All unit test cases passing (Grading logic & CSV exporter).
- [x] Vite frontend bundle compiles with zero syntax/import errors.
- [x] Prepared statements verify 0 vulnerabilities to SQL injection.
- [x] Session cookie flags (`HttpOnly`, `SameSite=Lax`) verified.

