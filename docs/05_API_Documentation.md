# REST API Documentation
## Smart Campus Management System

**Base URL:** `http://localhost:5000/api`  
**Authentication:** Cookie-based Session (`campus_session_id`)  
**Standard Response Envelopes:**
- **Success:** `{ "success": true, "message": "...", "data": ..., "meta": { ... } }`
- **Error:** `{ "success": false, "error": { "code": "...", "message": "...", "details": [...] } }`

---

## 1. Authentication Endpoints

### 1.1 User Login
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "admin@campus.edu",
    "password": "Campus@123"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "data": {
      "user_id": 1,
      "email": "admin@campus.edu",
      "role": "administrator",
      "status": "active"
    }
  }
  ```

### 1.2 User Logout
- **Endpoint:** `POST /api/auth/logout`
- **Access:** Authenticated
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logout successful. Session terminated."
  }
  ```

### 1.3 Active Session Check
- **Endpoint:** `GET /api/auth/me`
- **Access:** Authenticated

---

## 2. Dashboard Endpoints

### 2.1 Role-Tailored Summary
- **Endpoint:** `GET /api/dashboard/summary`
- **Access:** Authenticated (Dynamic payload based on user role)

---

## 3. Department Endpoints

### 3.1 List Departments
- **Endpoint:** `GET /api/departments`
- **Access:** Authenticated

### 3.2 Create Department
- **Endpoint:** `POST /api/departments`
- **Access:** Administrator
- **Request Body:**
  ```json
  {
    "code": "AI",
    "name": "Artificial Intelligence",
    "description": "Department of AI and Data Systems"
  }
  ```

### 3.3 Delete Department
- **Endpoint:** `DELETE /api/departments/:id`
- **Access:** Administrator (Blocks with 409 Conflict if referenced)

---

## 4. Student Endpoints

### 4.1 Browse Students Roster
- **Endpoint:** `GET /api/students`
- **Access:** Administrator, Faculty
- **Query Parameters:** `page`, `limit`, `search`, `department_id`, `status`

### 4.2 View Student Profile
- **Endpoint:** `GET /api/students/:id`
- **Access:** Administrator, Faculty, or Enrolled Student (Strict Ownership Enforced)

### 4.3 View 360-Degree Academic Dossier
- **Endpoint:** `GET /api/students/:id/dossier`
- **Access:** Administrator, Faculty, or Enrolled Student (Strict Ownership Enforced)

### 4.4 Register Student
- **Endpoint:** `POST /api/students`
- **Access:** Administrator (ACID Transaction)
- **Request Body:**
  ```json
  {
    "email": "student@campus.edu",
    "password": "Campus@123",
    "roll_number": "CS2025099",
    "first_name": "Daniel",
    "last_name": "Miller",
    "dob": "2004-05-12",
    "enrollment_year": 2025,
    "department_id": 1
  }
  ```

---

## 5. Course & Enrollment Endpoints

### 5.1 List Courses
- **Endpoint:** `GET /api/courses`
- **Query Parameters:** `department_id`, `semester`, `faculty_id`, `search`

### 5.2 Create Course
- **Endpoint:** `POST /api/courses`
- **Access:** Administrator

### 5.3 Enrol Student in Course
- **Endpoint:** `POST /api/enrollments`
- **Access:** Administrator
- **Request Body:**
  ```json
  {
    "student_id": 1,
    "course_id": 2,
    "semester": 3,
    "academic_year": "2025-2026"
  }
  ```

---

## 6. Attendance Endpoints

### 6.1 View Course Attendance
- **Endpoint:** `GET /api/attendance/course/:courseId?date=YYYY-MM-DD`
- **Access:** Administrator, Assigned Course Faculty

### 6.2 View Student Attendance
- **Endpoint:** `GET /api/attendance/student/:studentId`
- **Access:** Administrator, Faculty, Enrolled Student (Own ID only)

### 6.3 Submit Daily Attendance (Bulk Upsert)
- **Endpoint:** `POST /api/attendance/bulk`
- **Access:** Administrator, Assigned Course Faculty
- **Request Body:**
  ```json
  {
    "course_id": 1,
    "attendance_date": "2026-03-01",
    "records": [
      { "enrollment_id": 1, "status": "Present", "remarks": "On time" },
      { "enrollment_id": 3, "status": "Late", "remarks": "Transit delay" }
    ]
  }
  ```

---

## 7. Examination & Grading Endpoints

### 7.1 Schedule Examination
- **Endpoint:** `POST /api/exams`
- **Access:** Administrator, Assigned Course Faculty
- **Request Body:**
  ```json
  {
    "course_id": 1,
    "exam_name": "Final Comprehensive Exam",
    "exam_type": "Final",
    "exam_date": "2026-05-25",
    "max_marks": 100.0
  }
  ```

### 7.2 Submit Bulk Marks
- **Endpoint:** `POST /api/results/bulk`
- **Access:** Administrator, Assigned Course Faculty
- **Request Body:**
  ```json
  {
    "exam_id": 1,
    "results": [
      { "enrollment_id": 1, "marks_obtained": 46.5 },
      { "enrollment_id": 3, "marks_obtained": 38.0 }
    ]
  }
  ```

---

## 8. Reports & Audit Endpoints

### 8.1 Stream CSV Export
- **Endpoint:** `GET /api/reports/export/:reportType?format=csv`
- **Access:** Administrator Only
- **Valid Report Types:** `attendance`, `performance`, `departments`

### 8.2 Security Audit Logs
- **Endpoint:** `GET /api/audit-logs`
- **Access:** Administrator Only

---

## 9. Timetable & Room Scheduling Endpoints

### 9.1 Retrieve Timetable Slots
- **Endpoint:** `GET /api/timetable`
- **Access:** All Authenticated Roles
- **Query Params:** `semester`, `academic_year`, `room_number`, `course_id`

### 9.2 Schedule Class Slot (With Collision Guard)
- **Endpoint:** `POST /api/timetable`
- **Access:** Administrator Only
- **Request Body:**
  ```json
  {
    "course_id": 1,
    "day_of_week": "Monday",
    "start_time": "09:00:00",
    "end_time": "10:00:00",
    "room_number": "Room 101",
    "semester": 4,
    "academic_year": "2025-2026"
  }
  ```
- **Responses:** `201 Created` or `409 Conflict` (`ROOM_CONFLICT` / `FACULTY_SCHEDULE_CONFLICT`).

---

## 10. Digital Leave & Excuse Endpoints

### 10.1 Submit Leave Application
- **Endpoint:** `POST /api/leaves`
- **Access:** Student (Own enrollment)
- **Request Body:**
  ```json
  {
    "enrollment_id": 1,
    "leave_date": "2026-03-01",
    "reason": "Medical illness with certified doctor note"
  }
  ```

### 10.2 Review Leave Application (ACID Transaction)
- **Endpoint:** `PATCH /api/leaves/:id/review`
- **Access:** Administrator, Assigned Course Faculty
- **Request Body:**
  ```json
  {
    "status": "Approved",
    "review_remarks": "Verified with clinic document"
  }
  ```
- **Side Effect:** Automatically sets `attendance.status = 'Excused'` for the date and dispatches a notification to the student.

---

## 11. Notification Center Endpoints

### 11.1 Get User Notifications
- **Endpoint:** `GET /api/notifications`
- **Access:** All Authenticated Users

### 11.2 Mark All As Read
- **Endpoint:** `PATCH /api/notifications/read-all`
- **Access:** All Authenticated Users

---

## 12. Early Warning & Official Transcript Endpoints

### 12.1 At-Risk Students Report
- **Endpoint:** `GET /api/reports/at-risk`
- **Access:** Administrator, Faculty

### 12.2 Dispatch Academic Retention Alerts
- **Endpoint:** `POST /api/reports/at-risk/notify`
- **Access:** Administrator Only

### 12.3 Official Academic Transcript & Grade Card
- **Endpoint:** `GET /api/students/:id/transcript`
- **Access:** Administrator, Faculty, Student (Own ID only)
- **Response:** Credit-weighted SGPA per semester, cumulative CGPA, earned credits, and deterministic 64-character SHA-256 verification seal.

---

## 13. Financial Ledger & Fee Collection Endpoints

### 13.1 Define Fee Structure
- **Endpoint:** `POST /api/fees/structures`
- **Access:** Administrator Only
- **Request Body:**
  ```json
  {
    "department_id": 1,
    "semester": 4,
    "academic_year": "2025-2026",
    "tuition_fee": 45000.00,
    "development_fee": 10000.00,
    "laboratory_fee": 8000.00,
    "library_fee": 2000.00,
    "other_charges": 1500.00,
    "due_date": "2026-04-15"
  }
  ```

### 13.2 List Fee Structures
- **Endpoint:** `GET /api/fees/structures`
- **Access:** All Authenticated Users

### 13.3 Generate Batch Invoices (ACID Transaction)
- **Endpoint:** `POST /api/fees/invoices/generate-batch`
- **Access:** Administrator Only
- **Request Body:**
  ```json
  {
    "structure_id": 1,
    "scholarship_rules": [
      { "student_id": 1, "discount_percentage": 15 }
    ]
  }
  ```
- **Guarantees:** Idempotent batch insertion, scholarship concession adjustment, automated notification dispatch.

### 13.4 List Invoices & Collection Metrics
- **Endpoint:** `GET /api/fees/invoices`
- **Access:** All Authenticated Users (Scoped to `student_id` for students)
- **Query Params:** `status`, `department_id`, `semester`, `search`
- **Response:** Array of itemized invoices and aggregated `vw_department_fee_collection` metrics.

### 13.5 Record Fee Payment (Row Lock & Overpayment Guard)
- **Endpoint:** `POST /api/fees/invoices/:invoiceId/pay`
- **Access:** Administrator, Student (Own invoice only)
- **Request Body:**
  ```json
  {
    "amount": 20000.00,
    "payment_mode": "UPI",
    "transaction_reference": "TXN_UPI_9837264101",
    "remarks": "First installment"
  }
  ```
- **Guarantees:** `SELECT ... FOR UPDATE` row locking, overpayment rejection (`amount > remaining_due`), status transition (`Partially_Paid` / `Paid`), immutable receipt generation, and real-time student notification.

### 13.6 Official Itemized Receipt with SHA-256 Seal
- **Endpoint:** `GET /api/fees/payments/:paymentId/receipt`
- **Access:** Administrator, Student (Own receipt only)
- **Response:** Complete fee component breakdown, payment audit trail, and institutional SHA-256 digital verification seal.



