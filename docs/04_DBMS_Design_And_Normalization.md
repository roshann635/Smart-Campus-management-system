# Relational DBMS Design, Normalization, and Query Optimization
## Smart Campus Management System

---

## 1. Complete Data Dictionary

### Table: `departments`
| Column Name | Data Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :---: | :--- |
| `department_id` | INT | NO | PK, AUTO_INCREMENT | Unique surrogate identifier for the department |
| `code` | VARCHAR(10) | NO | UNIQUE | Department acronym (e.g., CSE, ECE) |
| `name` | VARCHAR(100) | NO | UNIQUE | Full official name of the department |
| `description` | TEXT | YES | — | Academic focus and departmental scope |
| `created_at` | TIMESTAMP | NO | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | NO | ON UPDATE CURRENT_TIMESTAMP | Last modification timestamp |

### Table: `users`
| Column Name | Data Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :---: | :--- |
| `user_id` | INT | NO | PK, AUTO_INCREMENT | Surrogate identifier for system user |
| `email` | VARCHAR(150) | NO | UNIQUE, INDEX | Unique login and institutional email |
| `password_hash`| VARCHAR(255) | NO | — | Bcrypt hash with salt rounds (Cost = 10) |
| `role` | ENUM | NO | 'administrator', 'faculty', 'student' | Security role for RBAC authorization |
| `status` | ENUM | NO | 'active', 'inactive' (DEFAULT 'active') | Account lifecycle status |
| `created_at` | TIMESTAMP | NO | DEFAULT CURRENT_TIMESTAMP | Account creation time |
| `updated_at` | TIMESTAMP | NO | ON UPDATE CURRENT_TIMESTAMP | Account update time |

### Table: `students`
| Column Name | Data Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :---: | :--- |
| `student_id` | INT | NO | PK, AUTO_INCREMENT | Primary student identifier |
| `user_id` | INT | NO | UNIQUE, FK -> `users(user_id)` | 1-to-1 link to security account |
| `roll_number` | VARCHAR(30) | NO | UNIQUE, INDEX | University registration / matriculation number |
| `first_name` | VARCHAR(50) | NO | — | Student legal first name |
| `last_name` | VARCHAR(50) | NO | — | Student legal surname |
| `dob` | DATE | NO | — | Date of birth |
| `phone` | VARCHAR(20) | YES | — | Contact telephone number |
| `address` | TEXT | YES | — | Residential postal address |
| `enrollment_year` | YEAR | NO | — | Academic entry year (e.g., 2025) |
| `department_id`| INT | NO | FK -> `departments(department_id)` | Academic department affiliation |

### Table: `faculty`
| Column Name | Data Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :---: | :--- |
| `faculty_id` | INT | NO | PK, AUTO_INCREMENT | Primary faculty identifier |
| `user_id` | INT | NO | UNIQUE, FK -> `users(user_id)` | 1-to-1 link to security account |
| `employee_code`| VARCHAR(30) | NO | UNIQUE, INDEX | Institutional employee code |
| `first_name` | VARCHAR(50) | NO | — | Instructor first name |
| `last_name` | VARCHAR(50) | NO | — | Instructor surname |
| `designation` | VARCHAR(80) | NO | — | Academic rank (e.g. Professor) |
| `phone` | VARCHAR(20) | YES | — | Office telephone |
| `department_id`| INT | NO | FK -> `departments(department_id)` | Faculty department affiliation |

### Table: `courses`
| Column Name | Data Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :---: | :--- |
| `course_id` | INT | NO | PK, AUTO_INCREMENT | Primary course identifier |
| `course_code` | VARCHAR(20) | NO | UNIQUE, INDEX | Course code (e.g. CS101) |
| `course_name` | VARCHAR(120)| NO | — | Official title of course |
| `credits` | INT | NO | CHECK (`credits` BETWEEN 1 AND 6) | Academic credit weight |
| `semester` | INT | NO | CHECK (`semester` BETWEEN 1 AND 8) | Academic curriculum semester |
| `department_id`| INT | NO | FK -> `departments(department_id)` | Offering department |
| `faculty_id` | INT | YES | FK -> `faculty(faculty_id)` | Assigned instructor (NULL if unassigned) |

### Table: `enrollments`
| Column Name | Data Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :---: | :--- |
| `enrollment_id`| INT | NO | PK, AUTO_INCREMENT | Primary enrollment identifier |
| `student_id` | INT | NO | FK -> `students(student_id)` | Enrolled student |
| `course_id` | INT | NO | FK -> `courses(course_id)` | Course registered |
| `semester` | INT | NO | CHECK (`semester` BETWEEN 1 AND 8) | Semester enrolled |
| `academic_year`| VARCHAR(9) | NO | — | Academic term (e.g., '2025-2026') |
| `status` | ENUM | NO | 'enrolled', 'dropped', 'completed' | Enrollment status |
| *Composite* | — | — | `uq_student_course_term` | UNIQUE(`student_id`, `course_id`, `semester`, `academic_year`) |

### Table: `attendance`
| Column Name | Data Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :---: | :--- |
| `attendance_id`| INT | NO | PK, AUTO_INCREMENT | Primary attendance entry ID |
| `enrollment_id`| INT | NO | FK -> `enrollments(enrollment_id)` | Reference to student enrollment |
| `attendance_date`| DATE | NO | — | Lecture date |
| `status` | ENUM | NO | 'Present', 'Absent', 'Late' | Verified attendance status |
| `marked_by` | INT | NO | FK -> `users(user_id)` | Instructor/Admin who marked |
| `remarks` | VARCHAR(255)| YES | — | Optional justification |
| *Composite* | — | — | `uq_enrollment_date` | UNIQUE(`enrollment_id`, `attendance_date`) |

### Table: `exams`
| Column Name | Data Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :---: | :--- |
| `exam_id` | INT | NO | PK, AUTO_INCREMENT | Primary exam identifier |
| `course_id` | INT | NO | FK -> `courses(course_id)` | Course evaluated |
| `exam_name` | VARCHAR(100)| NO | — | Exam title (e.g., 'Midterm Exam') |
| `exam_type` | ENUM | NO | 'Midterm', 'Final', 'Quiz', 'Practical'| Evaluation category |
| `exam_date` | DATE | NO | — | Examination date |
| `max_marks` | DECIMAL(5,2)| NO | CHECK (`max_marks` > 0) | Maximum achievable marks |
| `created_by` | INT | NO | FK -> `users(user_id)` | Staff member who created exam |
| *Composite* | — | — | `uq_course_exam_name` | UNIQUE(`course_id`, `exam_name`) |

### Table: `results`
| Column Name | Data Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :---: | :--- |
| `result_id` | INT | NO | PK, AUTO_INCREMENT | Primary result identifier |
| `exam_id` | INT | NO | FK -> `exams(exam_id)` | Evaluated examination |
| `enrollment_id`| INT | NO | FK -> `enrollments(enrollment_id)` | Student enrollment evaluated |
| `marks_obtained`| DECIMAL(5,2)| NO | CHECK (`marks_obtained` >= 0) | Marks awarded |
| `grade` | VARCHAR(2) | NO | Standard Scale ('O', 'A+', 'A', etc.) | Letter grade awarded |
| `entered_by` | INT | NO | FK -> `users(user_id)` | Faculty member entering marks |
| *Composite* | — | — | `uq_exam_enrollment` | UNIQUE(`exam_id`, `enrollment_id`) |

### Table: `audit_logs`
| Column Name | Data Type | Nullable | Key / Constraint | Description |
| :--- | :--- | :---: | :---: | :--- |
| `log_id` | BIGINT | NO | PK, AUTO_INCREMENT | Monotonic log sequence number |
| `actor_user_id`| INT | YES | FK -> `users(user_id)` ON DELETE SET NULL | Initiating user |
| `action` | VARCHAR(80) | NO | INDEX | Action token (e.g., 'STUDENT_CREATED') |
| `entity_type` | VARCHAR(50) | NO | — | Target table or entity |
| `entity_id` | VARCHAR(50) | YES | — | Primary key of affected record |
| `metadata` | JSON | YES | — | Non-sensitive event parameters |
| `ip_address` | VARCHAR(45) | YES | — | IPv4 / IPv6 client address |
| `created_at` | TIMESTAMP | NO | DEFAULT CURRENT_TIMESTAMP | Event log timestamp |

---

## 2. Normalization Proof: UNF to 3NF

### Unnormalized Form (UNF)
Consider a flat spreadsheet record representing campus enrollment and results:
```
CAMPUS_RECORD (
    StudentRoll, StudentName, StudentDOB, StudentEmail, DeptCode, DeptName, 
    Course1Code, Course1Name, Course1Credits, Course1FacultyCode, Course1FacultyName, 
    Course1AttendanceDates, Course1AttendanceStatuses, Course1ExamName, Course1ExamMarks, Course1Grade,
    Course2Code, ...
)
```
**Anomalies Present in UNF:**
- **Repeating Groups:** Courses, attendance sessions, and exams repeat across columns.
- **Update Anomaly:** Changing `DeptName` requires editing thousands of rows.
- **Insertion Anomaly:** A course cannot be recorded without an enrolled student.
- **Deletion Anomaly:** Deleting the only student enrolled in a department purges department existence.

### First Normal Form (1NF)
**Rule:** Eliminate repeating groups. Ensure all attributes are atomic (indivisible) and every table has a defined primary key.
- Decompose repeating courses, attendance, and exam marks into distinct rows.
- Deconstruct student and faculty names into `first_name` and `last_name`.
- Eliminate multi-valued attributes in attendance and results.

### Second Normal Form (2NF)
**Rule:** Must be in 1NF. Eliminate Partial Functional Dependencies (no non-prime attribute may depend on a proper subset of any candidate key).
- In a composite relation `(StudentRoll, CourseCode) -> DeptName, CourseCredits`, `DeptName` depends solely on `StudentRoll` (or Department), and `CourseCredits` depends solely on `CourseCode`.
- **Resolution:**
  - Separate `STUDENTS` with candidate key `roll_number`.
  - Separate `COURSES` with candidate key `course_code`.
  - Establish `ENROLLMENTS` linking `student_id` and `course_id`.

### Third Normal Form (3NF)
**Rule:** Must be in 2NF. Eliminate Transitive Functional Dependencies (non-prime attributes must depend only on the primary key, and not on another non-prime attribute: $X \to Y \to Z$).
- In `STUDENTS (student_id, ..., department_id, department_name, department_code)`, `department_name` depends on `department_id`, which depends on `student_id`.
  $$\text{student\_id} \to \text{department\_id} \to \text{department\_name}$$
- **Resolution:**
  - Extract `DEPARTMENTS` into its own relation with primary key `department_id`.
  - Replace transitive attributes in `STUDENTS`, `FACULTY`, and `COURSES` with foreign keys referencing `department_id`.
- The final relational design is strictly in **3NF**.

---

## 3. Query Optimization, Indexes & `EXPLAIN` Analysis

### Index Strategy Table
| Table | Index Name | Columns Indexed | Type | Justification |
| :--- | :--- | :--- | :--- | :--- |
| `users` | `idx_users_email` | `(email)` | BTREE | Accelerates auth lookup to $O(\log N)$ point query. |
| `users` | `idx_users_role_status` | `(role, status)` | Composite BTREE | Optimizes filtered role counts in admin dashboards. |
| `students` | `idx_students_dept` | `(department_id)` | BTREE | Accelerates foreign-key joins with `departments`. |
| `students` | `idx_students_roll` | `(roll_number)` | BTREE | Rapid prefix searches for student dossiers. |
| `enrollments`| `uq_student_course_term` | `(student_id, course_id, semester, academic_year)` | Composite UNIQUE | Prevents duplicate enrollments; speeds up roster joins. |
| `attendance` | `idx_attendance_date` | `(attendance_date)` | BTREE | Optimizes date-range institutional attendance filters. |
| `results` | `uq_exam_enrollment` | `(exam_id, enrollment_id)` | Composite UNIQUE | Ensures single grade per student per exam; rapid lookup. |

### Query Plan Analysis (`EXPLAIN`)
For the attendance report view join:
```sql
EXPLAIN SELECT v.* FROM vw_student_attendance_summary v WHERE v.course_id = 1;
```
1. `courses`: Uses `PRIMARY` index lookup on `course_id = 1` (`type: const`, rows: 1).
2. `enrollments`: Uses `idx_enrollments_course` (`type: ref`, rows: ~30).
3. `students`: Uses `PRIMARY` key join on `student_id` (`type: eq_ref`, rows: 1).
4. `attendance`: Uses `idx_attendance_enrollment` (`type: ref`).
**Result:** Zero full table scans (`ALL`). Query scales logarithmically $O(\log N)$ across millions of attendance records.

---

## 4. ACID Transaction Mechanics

| Principle | Implementation in Smart Campus System |
| :--- | :--- |
| **Atomicity** | Multi-step mutations (e.g., student creation inserting into `users`, `students`, and `audit_logs`) execute under `connection.beginTransaction()`. Any exception triggers `connection.rollback()`, ensuring zero orphan records. |
| **Consistency** | Database constraints (`CHECK (credits BETWEEN 1 AND 6)`, `CHECK (max_marks > 0)`, `UNIQUE`, `FOREIGN KEY ON DELETE RESTRICT`) ensure illegal states cannot be written to disk. |
| **Isolation** | MySQL InnoDB default `REPEATABLE READ` transaction isolation ensures concurrent transactions cannot observe phantom updates or dirty reads. |
| **Durability** | Committed transactions are written to InnoDB redo logs (`ib_logfile`), surviving sudden server termination or power failure. |

---

## 5. Annotated Production SQL Queries

### Query 1: Student Attendance Summary Aggregation
```sql
SELECT 
    s.student_id,
    s.roll_number,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    c.course_id,
    c.course_code,
    c.course_name,
    COUNT(a.attendance_id) AS total_classes,
    SUM(CASE WHEN a.status IN ('Present', 'Late') THEN 1 ELSE 0 END) AS classes_attended,
    CASE 
        WHEN COUNT(a.attendance_id) = 0 THEN 0.00
        ELSE ROUND((SUM(CASE WHEN a.status IN ('Present', 'Late') THEN 1 ELSE 0 END) / COUNT(a.attendance_id)) * 100, 2)
    END AS attendance_percentage
FROM enrollments e
JOIN students s ON e.student_id = s.student_id
JOIN courses c ON e.course_id = c.course_id
LEFT JOIN attendance a ON e.enrollment_id = a.enrollment_id
GROUP BY 
    s.student_id, s.roll_number, s.first_name, s.last_name,
    c.course_id, c.course_code, c.course_name;
```

### Query 2: Department Metrics Institutional View with LEFT JOINs
```sql
SELECT 
    d.department_id,
    d.code AS department_code,
    d.name AS department_name,
    COUNT(DISTINCT CASE WHEN u.status = 'active' THEN s.student_id ELSE NULL END) AS total_active_students,
    COUNT(DISTINCT CASE WHEN fu.status = 'active' THEN f.faculty_id ELSE NULL END) AS total_active_faculty,
    COUNT(DISTINCT c.course_id) AS total_courses
FROM departments d
LEFT JOIN students s ON d.department_id = s.department_id
LEFT JOIN users u ON s.user_id = u.user_id
LEFT JOIN faculty f ON d.department_id = f.department_id
LEFT JOIN users fu ON f.user_id = fu.user_id
LEFT JOIN courses c ON d.department_id = c.department_id
GROUP BY d.department_id, d.code, d.name;
```

---

## 8. Phase 2 Advanced Relational Schema Extensions

### 15-Table Extended 3NF Architecture
In Phase 2, the relational schema is expanded to 15 tables and 5 institutional aggregation views:

1. **`course_prerequisites`**:
   - `id` INT AUTO_INCREMENT PRIMARY KEY
   - `course_id` INT NOT NULL (FK -> `courses.course_id` ON DELETE CASCADE)
   - `prerequisite_course_id` INT NOT NULL (FK -> `courses.course_id` ON DELETE CASCADE)
   - **Constraints:** `UNIQUE KEY uq_course_prereq (course_id, prerequisite_course_id)`, `CHECK (course_id <> prerequisite_course_id)`.

2. **`timetable_slots`**:
   - `slot_id` INT AUTO_INCREMENT PRIMARY KEY
   - `course_id` INT NOT NULL (FK -> `courses.course_id` ON DELETE CASCADE)
   - `day_of_week` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')
   - `start_time` TIME NOT NULL, `end_time` TIME NOT NULL
   - `room_number` VARCHAR(30) NOT NULL, `semester` INT NOT NULL, `academic_year` VARCHAR(9) NOT NULL
   - **Constraints:** `CHECK (end_time > start_time)`, `UNIQUE KEY uq_room_schedule (day_of_week, start_time, room_number, academic_year, semester)`.
   - **Overlap Query Logic:**
     ```sql
     -- Room conflict detection
     SELECT slot_id FROM timetable_slots
     WHERE day_of_week = ? AND academic_year = ? AND semester = ? AND room_number = ?
       AND (start_time < ? AND end_time > ?);

     -- Instructor conflict detection
     SELECT ts.slot_id FROM timetable_slots ts
     JOIN courses c ON ts.course_id = c.course_id
     WHERE c.faculty_id = ? AND ts.day_of_week = ? AND ts.academic_year = ?
       AND (ts.start_time < ? AND ts.end_time > ?);
     ```

3. **`leave_requests`**:
   - `leave_id` INT AUTO_INCREMENT PRIMARY KEY
   - `enrollment_id` INT NOT NULL (FK -> `enrollments.enrollment_id` ON DELETE CASCADE)
   - `leave_date` DATE NOT NULL
   - `reason` VARCHAR(500) NOT NULL
   - `status` ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending'
   - `reviewed_by` INT NULL (FK -> `users.user_id` ON DELETE SET NULL)
   - `review_remarks` VARCHAR(255) NULL
   - **ACID Transaction:** Approval transactionally executes:
     ```sql
     START TRANSACTION;
     UPDATE leave_requests SET status = 'Approved', reviewed_by = ?, review_remarks = ? WHERE leave_id = ?;
     INSERT INTO attendance (enrollment_id, attendance_date, status, marked_by, remarks)
     VALUES (?, ?, 'Excused', ?, 'Leave Request Approved')
     ON DUPLICATE KEY UPDATE status = 'Excused', remarks = VALUES(remarks);
     INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Leave Approved', ..., 'LEAVE_UPDATE');
     COMMIT;
     ```

4. **`notifications`**:
   - `notification_id` INT AUTO_INCREMENT PRIMARY KEY
   - `user_id` INT NOT NULL (FK -> `users.user_id` ON DELETE CASCADE)
   - `title` VARCHAR(120) NOT NULL
   - `message` TEXT NOT NULL
   - `type` ENUM('ATTENDANCE_ALERT', 'EXAM_RESULT', 'LEAVE_UPDATE', 'SYSTEM_ANNOUNCEMENT')
   - `is_read` BOOLEAN NOT NULL DEFAULT FALSE

5. **`vw_at_risk_students`**: Identifies at-risk candidates across attendance (< 75%) and examination marks (< 40%).
6. **`vw_student_cgpa_transcript`**: Dynamically computes credit-weighted SGPA and cumulative CGPA per semester.

---

## 5. Financial Ledger & Revenue Schema (3NF Normalization)

### Table 16: `fee_structures`
Prescribes institutional billing rates per department and semester:
- `structure_id` INT AUTO_INCREMENT PRIMARY KEY
- `department_id` INT NOT NULL (FK -> `departments.department_id`)
- `semester` INT NOT NULL CHECK (`semester` BETWEEN 1 AND 8)
- `academic_year` VARCHAR(9) NOT NULL
- `tuition_fee`, `development_fee`, `laboratory_fee`, `library_fee`, `other_charges` DECIMAL(10, 2) NOT NULL DEFAULT 0.00
- `total_fee` DECIMAL(10, 2) GENERATED ALWAYS AS (tuition_fee + development_fee + laboratory_fee + library_fee + other_charges) STORED
- `due_date` DATE NOT NULL
- **Uniqueness Constraint:** `uq_dept_sem_year UNIQUE (department_id, semester, academic_year)`

### Table 17: `student_invoices`
Instantiates student-specific billing accounts:
- `invoice_id` INT AUTO_INCREMENT PRIMARY KEY
- `invoice_number` VARCHAR(30) NOT NULL UNIQUE
- `student_id` INT NOT NULL (FK -> `students.student_id` ON DELETE CASCADE)
- `structure_id` INT NOT NULL (FK -> `fee_structures.structure_id`)
- `total_due` DECIMAL(10, 2) NOT NULL
- `scholarship_discount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00
- `net_payable` DECIMAL(10, 2) NOT NULL
- `amount_paid` DECIMAL(10, 2) NOT NULL DEFAULT 0.00
- `status` ENUM('Pending', 'Partially_Paid', 'Paid', 'Overdue') NOT NULL DEFAULT 'Pending'
- **Uniqueness Constraint:** `uq_student_structure UNIQUE (student_id, structure_id)`

### Table 18: `fee_payments`
Itemized double-entry transaction ledger:
- `payment_id` INT AUTO_INCREMENT PRIMARY KEY
- `invoice_id` INT NOT NULL (FK -> `student_invoices.invoice_id` ON DELETE CASCADE)
- `receipt_number` VARCHAR(30) NOT NULL UNIQUE
- `amount_paid` DECIMAL(10, 2) NOT NULL CHECK (`amount_paid` > 0)
- `payment_mode` ENUM('UPI', 'Net_Banking', 'Credit_Card', 'Debit_Card', 'Demand_Draft', 'Cash') NOT NULL
- `transaction_reference` VARCHAR(100) NOT NULL UNIQUE
- `recorded_by_user_id` INT NOT NULL (FK -> `users.user_id`)
- `remarks` VARCHAR(255) NULL
- **Pessimistic Concurrency Control:** Payment processing uses `SELECT ... FOR UPDATE` row locking on `student_invoices` to eliminate race conditions and overpayment anomalies.

### View 6: `vw_department_fee_collection`
Aggregates department-level financial health:
```sql
SELECT 
    d.department_id,
    d.name AS department_name,
    fs.academic_year,
    fs.semester,
    COUNT(inv.invoice_id) AS total_invoices_issued,
    COALESCE(SUM(inv.total_due), 0.00) AS total_billed,
    COALESCE(SUM(inv.scholarship_discount), 0.00) AS total_discount,
    COALESCE(SUM(inv.amount_paid), 0.00) AS total_collected,
    COALESCE(SUM(inv.net_payable - inv.amount_paid), 0.00) AS total_outstanding,
    CASE 
        WHEN COALESCE(SUM(inv.net_payable), 0.00) = 0 THEN 100.00
        ELSE ROUND((SUM(inv.amount_paid) / SUM(inv.net_payable)) * 100, 2)
    END AS collection_percentage
FROM departments d
JOIN fee_structures fs ON d.department_id = fs.department_id
LEFT JOIN student_invoices inv ON fs.structure_id = inv.structure_id
GROUP BY d.department_id, d.name, fs.academic_year, fs.semester;
```



