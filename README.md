# Smart Campus Management System
### Enterprise Relational DBMS & University Academic Management Architecture

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.21-lightgrey.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-v18.3-blue.svg)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%20(InnoDB)-orange.svg)](https://www.mysql.com/)
[![Vitest](https://img.shields.io/badge/Vitest-49%2F49%20Passing-brightgreen.svg)](https://vitest.dev/)
[![Tables](https://img.shields.io/badge/Schema-18%20Tables%20(3NF)-indigo.svg)](database/schema.sql)

---

## 1. Executive Summary & Objective

The **Smart Campus Management System** is a university-grade web application engineered for academic record centralization, referential integrity enforcement, and real-time analytical reporting. It replaces fragmented spreadsheet workflows with a strictly normalized **3NF MySQL relational database** backed by an **Express.js REST API** with explicit ACID transactions, server-side RBAC, immutable security audit logging, and a responsive **React 18 single-page application**.

---

## 2. Locked Technology Stack (Strict Implementation)

- **Frontend:** React 18, Vite, React Router v6, Tailwind CSS, Axios (with `withCredentials: true`), Lucide React icons, Recharts analytics.
- **Backend:** Node.js, Express.js, `mysql2/promise` (connection pool with parameterized queries), `bcryptjs` (password hashing), `express-session` with `express-mysql-session` persistence, `zod` schema validation, `helmet`, `cors`, `express-rate-limit`, native RFC-4180 CSV export streamer.
- **Database:** MySQL 8.0+ (InnoDB engine, `utf8mb4` charset). Pure raw parameterized SQL scripts (`schema.sql`, `views.sql`, `seed.sql`) without ORM overhead.
- **Testing:** Vitest + Supertest covering 38 unit and integration tests (including all 22 required evaluation scenarios), plus Postman Collection v2.1.

---

## 3. Seeded Accounts & Server-Enforced RBAC

All development accounts share the default password: **`Campus@123`** (supported by one-click quick-fill demo buttons on the login screen):

| Role | Email | Scope & Permissions |
| :--- | :--- | :--- |
| **Administrator** | `admin@campus.edu` | Global institutional KPIs, Department CRUD, Course catalog, Student/Faculty roster management & account activation, Semester enrollments, CSV exports, and Security audit logs. |
| **Faculty Member** | `faculty1@campus.edu`<br>`faculty2@campus.edu` | View assigned courses (`courses.faculty_id = faculty.faculty_id`), daily bulk attendance marking (`Present`, `Absent`, `Late`), exam scheduling, and live grading. **Strict course isolation enforces 403 Forbidden on unassigned courses.** |
| **Student** | `student1@campus.edu`<br>`student2@campus.edu`<br>`student3@campus.edu` | Student Dashboard with cumulative GPA, overall attendance percentage, enrolled courses, and exam grades. **Strict ownership isolation enforces 403 Forbidden when requesting other student records.** |

---

## 4. Relational Database Design (15 Tables, 3NF Normalized)

```
DEPARTMENTS (department_id [PK], code [UK], name [UK], description, timestamps)
USERS (user_id [PK], email [UK], password_hash, role, status, timestamps)
STUDENTS (student_id [PK], user_id [FK, UK], roll_number [UK], first_name, last_name, dob, phone, address, enrollment_year, department_id [FK], timestamps)
FACULTY (faculty_id [PK], user_id [FK, UK], employee_code [UK], first_name, last_name, designation, phone, department_id [FK], timestamps)
COURSES (course_id [PK], course_code [UK], course_name, credits [CHECK 1-6], semester [CHECK 1-8], department_id [FK], faculty_id [FK, NULLABLE], timestamps)
COURSE_PREREQUISITES (id [PK], course_id [FK], prerequisite_course_id [FK], UNIQUE(course_id, prerequisite_course_id), CHECK(course_id <> prerequisite_course_id))
TIMETABLE_SLOTS (slot_id [PK], course_id [FK], day_of_week, start_time, end_time, room_number, semester, academic_year, UNIQUE(day_of_week, start_time, room_number, academic_year, semester), CHECK(end_time > start_time))
ENROLLMENTS (enrollment_id [PK], student_id [FK], course_id [FK], semester, academic_year, status, UNIQUE(student_id, course_id, semester, academic_year))
ATTENDANCE (attendance_id [PK], enrollment_id [FK], attendance_date, status ['Present','Absent','Late','Excused'], marked_by [FK], remarks, UNIQUE(enrollment_id, attendance_date))
LEAVE_REQUESTS (leave_id [PK], enrollment_id [FK], leave_date, reason, status ['Pending','Approved','Rejected'], reviewed_by [FK], review_remarks, UNIQUE(enrollment_id, leave_date))
NOTIFICATIONS (notification_id [PK], user_id [FK], title, message, type, is_read, created_at)
EXAMS (exam_id [PK], course_id [FK], exam_name, exam_type, exam_date, max_marks [CHECK >0], created_by [FK], UNIQUE(course_id, exam_name))
RESULTS (result_id [PK], exam_id [FK], enrollment_id [FK], marks_obtained [CHECK >=0], grade, entered_by [FK], UNIQUE(exam_id, enrollment_id))
AUDIT_LOGS (log_id [PK], actor_user_id [FK, NULLABLE], action, entity_type, entity_id, metadata [JSON], ip_address, created_at)
FEE_STRUCTURES (structure_id [PK], department_id [FK], semester [CHECK 1-8], academic_year, tuition_fee, development_fee, laboratory_fee, library_fee, other_charges, total_fee [STORED GENERATED], due_date, UNIQUE(department_id, semester, academic_year))
STUDENT_INVOICES (invoice_id [PK], invoice_number [UK], student_id [FK], structure_id [FK], total_due, scholarship_discount, net_payable, amount_paid, status, UNIQUE(student_id, structure_id))
FEE_PAYMENTS (payment_id [PK], invoice_id [FK], receipt_number [UK], amount_paid [CHECK >0], payment_mode, transaction_reference [UK], recorded_by_user_id [FK], remarks, paid_at)
SESSIONS (session_id [PK], expires, data)
```

### Deterministic Business Formulas & Grading Policy
- **Attendance Percentage Formula (Including Excused Leaves):**
  $$\text{Attendance \%} = \text{ROUND}\left(\frac{\sum (\text{Present} + \text{Late} + \text{Excused})}{\text{COUNT}(*)} \times 100, 2\right)$$
- **Credit-Weighted SGPA Formula:**
  $$\text{SGPA} = \frac{\sum (\text{Credits}_i \times \text{GradePoint}_i)}{\sum \text{Credits}_i}$$
- **Cryptographic Tamper-Evident Transcript Seal:**
  $$\text{Verification Hash} = \text{SHA256}(\text{StudentID} : \text{RollNo} : \text{CGPA} : \text{EarnedCredits} : \text{SECRET\_SALT})$$

### Analytical Database Views
1. `vw_student_attendance_summary`: Computes per-student per-course session counts and attendance percentages.
2. `vw_course_performance_summary`: Aggregates exam-level averages, pass counts, highest, and lowest scores.
3. `vw_department_metrics`: Multi-table `LEFT JOIN` aggregations displaying total active students, faculty, and courses per department.
4. `vw_at_risk_students`: Proactive academic retention filter isolating students below 75% attendance or below 40% exam marks.
5. `vw_student_cgpa_transcript`: Computes credit-weighted semester SGPA and cumulative CGPA.

---

## 5. Getting Started & Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
Copy `.env.example` to `.env` and `server/.env`:
```bash
cp .env.example .env
cp .env.example server/.env
```

### Step 3: Initialize MySQL Database (When MySQL is running)
```bash
npm run db:init
```

### Step 4: Run Development Servers
```bash
npm run dev
```
- **Backend API:** `http://localhost:5000/api`
- **Frontend SPA:** `http://localhost:5173`
- **Health Check:** `http://localhost:5000/api/health`

### Step 5: Run Automated Tests
```bash
npm test
```
Executes all 38 test cases across unit and integration suites with Vitest.

### Step 6: Build Client Production Bundle
```bash
npm run build
```

---

## 6. Automated Testing Verification (All 22 Mandatory Scenarios)

The test suite runs against Vitest + Supertest, verifying all 22 scenarios:
- **Scenario 1:** Successful login & session cookie creation.
- **Scenario 2:** Login rejection with invalid password or inactive user (401/403).
- **Scenario 3:** Logout and session invalidation (GET `/api/auth/me` returns 401).
- **Scenario 4:** Unauthenticated requests blocked on protected routes (401).
- **Scenario 5:** Student successfully reading their own attendance and results (200).
- **Scenario 6:** Student blocked from reading another student's profile, attendance, or results (403).
- **Scenario 7:** Faculty blocked from marking attendance or entering marks for an unassigned course (403).
- **Scenario 8:** Full CRUD lifecycle on departments, students, faculty, and courses (201, 200).
- **Scenario 9:** Duplicate student email or roll_number rejected (409 Conflict).
- **Scenario 10:** Duplicate course_code rejected (409 Conflict).
- **Scenario 11:** Duplicate course enrolment rejected (409 Conflict).
- **Scenario 12:** Duplicate daily attendance prevented or cleanly upserted.
- **Scenario 13:** Invalid foreign-key reference handled gracefully (400/404, never raw 500).
- **Scenario 14:** Marks entry exceeding `exam.max_marks` or negative marks rejected (400).
- **Scenario 15:** Duplicate exam result handled cleanly via upsert.
- **Scenario 16:** Verification of exact attendance percentage calculation.
- **Scenario 17:** Verification of aggregate report views (`vw_student_attendance_summary`, `vw_course_performance_summary`).
- **Scenario 18:** SQL injection payloads (`?search=' OR 1=1 --`) safely neutralized by prepared statements.
- **Scenario 19:** Multi-table transaction rollback verification (assert orphan user row rolled back on mid-transaction error).
- **Scenario 20:** Pagination (`page`, `limit`) and search filtering accuracy.
- **Scenario 21:** Student/Faculty blocked from accessing `/api/audit-logs` and administrative exports (403).
- **Scenario 22:** Malformed IDs (`/api/students/abc`) and nonexistent IDs (`/api/students/999999`) return 400 and 404 respectively.

---

## 7. Project Documentation Index

- [`docs/01_SRS.md`](file:///e:/smart-campus-management-system/docs/01_SRS.md): Problem Statement, Stakeholders, Functional & Non-Functional Requirements.
- [`docs/02_Feasibility_And_SDLC.md`](file:///e:/smart-campus-management-system/docs/02_Feasibility_And_SDLC.md): Technical/Operational/Economic Feasibility, Risk Register & Iterative Model.
- [`docs/03_System_Design_Diagrams.md`](file:///e:/smart-campus-management-system/docs/03_System_Design_Diagrams.md): Mermaid Diagrams (Architecture, Use-Case, Crow's Foot ERD, Schema, UML, Sequence, DFDs).
- [`docs/04_DBMS_Design_And_Normalization.md`](file:///e:/smart-campus-management-system/docs/04_DBMS_Design_And_Normalization.md): Data Dictionary, Normalization Proof (UNF -> 3NF), Index Justification & `EXPLAIN` analysis.
- [`docs/05_API_Documentation.md`](file:///e:/smart-campus-management-system/docs/05_API_Documentation.md): Full REST API specification with envelopes and payloads.
- [`docs/06_Testing_And_Traceability.md`](file:///e:/smart-campus-management-system/docs/06_Testing_And_Traceability.md): Test Plan, RTM, and 25+ Manual Test Cases.
- [`docs/07_User_And_Deployment_Manual.md`](file:///e:/smart-campus-management-system/docs/07_User_And_Deployment_Manual.md): Setup, Least-Privilege DB User, `mysqldump` backup/restore, PM2 + NGINX deployment.
- [`docs/postman/Smart_Campus_API.postman_collection.json`](file:///e:/smart-campus-management-system/docs/postman/Smart_Campus_API.postman_collection.json): Ready-to-import Postman Collection v2.1.

