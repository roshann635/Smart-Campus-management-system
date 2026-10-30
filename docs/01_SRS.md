# Software Requirements Specification (SRS)
## Smart Campus Management System

**Document Version:** 1.0.0  
**Course:** Database Management Systems (DBMS) & Software Engineering  
**Target Release:** Production / Academic Evaluation  

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) establishes the complete functional and non-functional requirements for the **Smart Campus Management System**. It specifies the business rules, relational database schema invariants, security controls, and operational workflows for university administrators, faculty instructors, and students.

### 1.2 Problem Statement
Traditional university record keeping suffers from fragmented data repositories (paper registers, heterogeneous spreadsheets, and detached desktop applications). This fragmentation introduces severe DBMS anomalies:
- **Redundancy & Inconsistency:** Duplicate student data across departmental rosters leading to update anomalies.
- **Integrity Violations:** Absence of foreign-key constraints leading to orphaned grades and unverified course registrations.
- **Unauthorized Data Modification:** Inadequate server-side authorization permitting students or unauthorized staff to alter attendance or marks.
- **Inefficient Analytics:** Manual computation of Grade Point Averages (GPA), pass rates, and attendance thresholds taking days rather than milliseconds.

### 1.3 System Scope
The Smart Campus Management System centralizes institutional academic records in a 3NF normalized MySQL relational database managed via an ACID-compliant Express.js REST API and presented through a responsive React single-page application.

---

## 2. Stakeholder Analysis

| Stakeholder Role | Description | Key Responsibilities |
| :--- | :--- | :--- |
| **Administrator** | Institutional Dean & Registrar Staff | Manages departments, curricula, faculty appointments, student admissions, semester enrollments, system-wide reports, and audit logs. |
| **Faculty Member** | Course Instructors & Department Heads | Manages lecture attendance, schedules examinations, enters and updates student marks, reviews course performance analytics. |
| **Student** | Enrolled University Scholars | Inspects course enrollments, monitors daily attendance percentage, views examination results, reviews cumulative GPA. |
| **Database Administrator (DBA)** | Infrastructure & Security Engineers | Monitors connection pools, query execution plans (`EXPLAIN`), database backups (`mysqldump`), and least-privilege database user access. |

---

## 3. Functional Requirements (FR)

### 3.1 Authentication & Session Management
- **FR-1.1:** System shall authenticate users using email and bcrypt-hashed passwords.
- **FR-1.2:** System shall persist session state server-side in MySQL with HTTP-only, SameSite-protected session cookies.
- **FR-1.3:** Deactivated accounts (`status = 'inactive'`) must be rejected at login with HTTP 403 Forbidden.
- **FR-1.4:** System shall log every login event, including user ID, IP address, and timestamp into `audit_logs`.

### 3.2 Department & Course Management
- **FR-2.1:** Administrators shall perform CRUD operations on academic departments. Deletion of a department referenced by active students, faculty, or courses must be blocked with HTTP 409 Conflict.
- **FR-2.2:** Administrators shall define courses with course code (UNIQUE), credits (1 to 6), semester (1 to 8), department, and assigned faculty instructor.

### 3.3 Student & Faculty Profile Management
- **FR-3.1:** System shall support transactional creation of user accounts alongside corresponding student or faculty profile records.
- **FR-3.2:** Student roll numbers and faculty employee codes must be unique across the institution.
- **FR-3.3:** Administrators shall be able to activate or deactivate user accounts via PATCH endpoints.

### 3.4 Semester Enrollment
- **FR-4.1:** System shall allow enrolling active students into active courses for a given semester and academic year.
- **FR-4.2:** System shall prevent duplicate enrollment of a student in the same course, semester, and academic year using a composite unique constraint `uq_student_course_term`.

### 3.5 Daily Attendance Management
- **FR-5.1:** Faculty shall record daily attendance (`Present`, `Absent`, `Late`) in bulk for courses assigned to them.
- **FR-5.2:** Faculty attempting to access or modify attendance for unassigned courses must receive HTTP 403 Forbidden.
- **FR-5.3:** System shall calculate attendance percentage using the standardized formula:
  $$\text{Attendance \%} = \left(\frac{\text{Present} + \text{Late}}{\text{Total Sessions}}\right) \times 100$$
- **FR-5.4:** Attendance records on the same date for the same enrollment must be cleanly updated via `ON DUPLICATE KEY UPDATE`.

### 3.6 Examination & Standardized Grading
- **FR-6.1:** Faculty shall schedule examinations specifying exam type (`Midterm`, `Final`, `Quiz`, `Practical`), examination date, and positive maximum marks.
- **FR-6.2:** System shall enforce that student marks obtained are non-negative and do not exceed `exam.max_marks` (rejecting invalid marks with HTTP 400 Bad Request).
- **FR-6.3:** Standardized grading scale must be deterministically applied:
  - $\ge 90.00\%$: `'O'` (10 pts)
  - $80.00\% - 89.99\%$: `'A+'` (9 pts)
  - $70.00\% - 79.99\%$: `'A'` (8 pts)
  - $60.00\% - 69.99\%$: `'B+'` (7 pts)
  - $50.00\% - 59.99\%$: `'B'` (6 pts)
  - $40.00\% - 49.99\%$: `'C'` (5 pts)
  - $< 40.00\%$: `'F'` (0 pts / Fail)

### 3.7 Institutional Analytics & Reporting
- **FR-7.1:** System shall provide materialized SQL aggregation views (`vw_student_attendance_summary`, `vw_course_performance_summary`, `vw_department_metrics`).
- **FR-7.2:** Administrators shall be able to export reports in RFC-4180 compliant CSV format.

### 3.8 Security & Ownership Isolation
- **FR-8.1:** Students querying another student's profile, attendance, or results must receive immediate HTTP 403 Forbidden.
- **FR-8.2:** Only administrators can view security audit logs.

---

## 4. Non-Functional Requirements (NFR)

- **NFR-1 (Performance):** SQL aggregation queries over 10,000+ records must execute under 150 ms utilizing B-Tree foreign key and composite indexes.
- **NFR-2 (Reliability & ACID Compliance):** Multi-table mutations must be wrapped in atomic transactions with automatic rollback on runtime or constraint failures.
- **NFR-3 (Security):** All user input must be sanitized via Zod schemas and parameterized SQL statements to eliminate SQL Injection (CWE-89) and Cross-Site Scripting (XSS).
- **NFR-4 (Portability):** System must run across standard Node.js v18+ runtimes and MySQL 8.0+ installations.

