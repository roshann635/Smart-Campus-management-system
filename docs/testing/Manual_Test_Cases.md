# Manual Test Cases Execution Matrix
## Smart Campus Management System

This document provides laboratory demonstration guidelines, test steps, inputs, and validation assertions for live evaluators.

---

### TC-M-01: Admin Quick-Fill Login and Session Persistence
- **Objective:** Verify administrator authentication and session cookie reception.
- **Preconditions:** Node.js backend server listening on `http://localhost:5000`.
- **Steps:**
  1. Open browser to `http://localhost:5173/login`.
  2. Click the quick-fill button **Admin**.
  3. Form automatically fills `admin@campus.edu` and `Campus@123`.
  4. Click **Sign In**.
- **Expected Outcome:** User is redirected to `/dashboard`. Navbar displays "Admin" role badge and email. Session cookie `campus_session_id` is set.
- **Status:** **VERIFIED (PASS)**

---

### TC-M-02: Strict Student Ownership Isolation
- **Objective:** Verify student role cannot inspect or mutate another student's academic profile.
- **Preconditions:** Logged in as `student1@campus.edu` (Student ID: 1).
- **Steps:**
  1. Navigate to `/dashboard` - view personal attendance summary.
  2. In browser address bar, attempt to navigate to `http://localhost:5173/students/2` (Student 2's dossier).
- **Expected Outcome:** Frontend displays 403 Access Forbidden or backend API returns `{ "success": false, "error": { "code": "FORBIDDEN_STUDENT_ISOLATION" } }`.
- **Status:** **VERIFIED (PASS)**

---

### TC-M-03: Faculty Course Isolation on Attendance Marking
- **Objective:** Verify faculty cannot mark attendance for courses they are not assigned to instruct.
- **Preconditions:** Logged in as `faculty1@campus.edu` (Assigned to CS101, CS102).
- **Steps:**
  1. Navigate to `/attendance`.
  2. Course selector dropdown only populates assigned courses (CS101, CS102).
  3. Send raw API POST to `/api/attendance/bulk` with `course_id: 3` (EC201 - assigned to Faculty 2).
- **Expected Outcome:** Backend rejects request with HTTP 403 `{ "code": "FORBIDDEN_COURSE_UNASSIGNED" }`.
- **Status:** **VERIFIED (PASS)**

---

### TC-M-04: Live Grade Preview and Marks Maximum Enforcement
- **Objective:** Verify examination grading calculation and overflow rejection.
- **Preconditions:** Logged in as `faculty1@campus.edu`.
- **Steps:**
  1. Navigate to `/exams-results`.
  2. Select "CS101: Midterm Examination (Max: 50.0)".
  3. In marks input for Alice Smith, enter `46.5`. Live grade badge displays **O** (93%).
  4. In marks input for Bob Johnson, enter `38.0`. Live grade badge displays **A** (76%).
  5. In marks input for another student, enter `55.0` (exceeding maximum 50.0).
  6. Click **Save & Record Grades**.
- **Expected Outcome:** System rejects submission with error "Marks obtained (55) cannot exceed maximum allowed marks (50)".
- **Status:** **VERIFIED (PASS)**

---

### TC-M-05: Administrative Report Generation and CSV Streaming
- **Objective:** Verify SQL view aggregation and CSV export streaming.
- **Preconditions:** Logged in as `admin@campus.edu`.
- **Steps:**
  1. Navigate to `/reports`.
  2. Click on tab "Student Attendance Summary" - view aggregated records from `vw_student_attendance_summary`.
  3. Click **Export to CSV**.
- **Expected Outcome:** Browser downloads valid RFC-4180 CSV file titled `attendance_report_<timestamp>.csv` containing proper headers and rows.
- **Status:** **VERIFIED (PASS)**

