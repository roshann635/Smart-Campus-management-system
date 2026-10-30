# System Design & Architecture Diagrams
## Smart Campus Management System

---

## 1. System Architecture Diagram

```mermaid
graph TD
    subgraph ClientLayer ["Client Layer (Browser SPA)"]
        UI["React 18 + Vite SPA"]
        Router["React Router v6"]
        AuthCtx["Auth Context"]
        AxiosClient["Axios HTTP Client"]
        UI --> Router
        Router --> AuthCtx
        AuthCtx --> AxiosClient
    end

    subgraph ServerLayer ["Server Layer (Node.js & Express.js)"]
        ReverseProxy["Express App Router"]
        HelmetCors["Helmet + CORS + RateLimiter"]
        SessionStore["express-session (MySQL Store)"]
        AuthMW["requireAuth + RBAC Middleware"]
        ValMW["Zod Validation Middleware"]
        Controllers["REST API Controllers"]
        Services["Transactional Services Engine"]

        AxiosClient -->|"HTTP / REST with Credentials"| ReverseProxy
        ReverseProxy --> HelmetCors
        HelmetCors --> SessionStore
        SessionStore --> AuthMW
        AuthMW --> ValMW
        ValMW --> Controllers
        Controllers --> Services
    end

    subgraph DataLayer ["Data Layer (MySQL 8.0 InnoDB)"]
        Pool["mysql2/promise Connection Pool"]
        Schema["Tables (3NF Normalization)"]
        Views["Materialized Aggregation Views"]
        Audit["Immutable Audit Log Table"]

        Services -->|"Parameterized SQL"| Pool
        Pool --> Schema
        Pool --> Views
        Pool --> Audit
    end
```

---

## 2. Use-Case Diagram

```mermaid
graph LR
    Admin((Administrator))
    Faculty((Faculty))
    Student((Student))

    subgraph SystemBoundaries ["Smart Campus Management System"]
        UC1[Authenticate / Login]
        UC2[Manage Departments]
        UC3[Manage Courses]
        UC4[Manage Student & Faculty Accounts]
        UC5[Enrol Students in Courses]
        UC6[Mark Daily Attendance]
        UC7[Schedule Exams & Enter Marks]
        UC8[View Personal Attendance & Results]
        UC9[Generate & Export System Reports]
        UC10[Inspect System Audit Logs]
    end

    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC9
    Admin --> UC10

    Faculty --> UC1
    Faculty --> UC6
    Faculty --> UC7
    Faculty --> UC9

    Student --> UC1
    Student --> UC8
```

---

## 3. Entity-Relationship (ER) Diagram (Crow's Foot Notation)

```mermaid
erDiagram
    DEPARTMENTS ||--o{ STUDENTS : "belongs to"
    DEPARTMENTS ||--o{ FACULTY : "appointed to"
    DEPARTMENTS ||--o{ COURSES : "offers"

    USERS ||--|| STUDENTS : "authenticates"
    USERS ||--|| FACULTY : "authenticates"
    USERS ||--o{ AUDIT_LOGS : "acts as"

    FACULTY ||--o{ COURSES : "instructs"

    STUDENTS ||--o{ ENROLLMENTS : "registers"
    COURSES ||--o{ ENROLLMENTS : "has"

    ENROLLMENTS ||--o{ ATTENDANCE : "logged for"
    USERS ||--o{ ATTENDANCE : "marked by"

    COURSES ||--o{ EXAMS : "assesses"
    USERS ||--o{ EXAMS : "scheduled by"

    EXAMS ||--o{ RESULTS : "evaluates"
    ENROLLMENTS ||--o{ RESULTS : "scored for"
    USERS ||--o{ RESULTS : "entered by"

    DEPARTMENTS {
        int department_id PK
        string code UK
        string name UK
        text description
    }

    USERS {
        int user_id PK
        string email UK
        string password_hash
        string role
        string status
    }

    STUDENTS {
        int student_id PK
        int user_id FK,UK
        string roll_number UK
        string first_name
        string last_name
        date dob
        int enrollment_year
        int department_id FK
    }

    FACULTY {
        int faculty_id PK
        int user_id FK,UK
        string employee_code UK
        string first_name
        string last_name
        string designation
        int department_id FK
    }

    COURSES {
        int course_id PK
        string course_code UK
        string course_name
        int credits
        int semester
        int department_id FK
        int faculty_id FK
    }

    ENROLLMENTS {
        int enrollment_id PK
        int student_id FK
        int course_id FK
        int semester
        string academic_year
        string status
    }

    ATTENDANCE {
        int attendance_id PK
        int enrollment_id FK
        date attendance_date
        string status
        int marked_by FK
        string remarks
    }

    EXAMS {
        int exam_id PK
        int course_id FK
        string exam_name
        string exam_type
        date exam_date
        decimal max_marks
        int created_by FK
    }

    RESULTS {
        int result_id PK
        int exam_id FK
        int enrollment_id FK
        decimal marks_obtained
        string grade
        int entered_by FK
    }

    AUDIT_LOGS {
        bigint log_id PK
        int actor_user_id FK
        string action
        string entity_type
        string entity_id
        json metadata
        string ip_address
    }
```

---

## 4. Relational Schema Mapping (Table Invariants)

```
DEPARTMENTS (department_id [PK], code [UK], name [UK], description, created_at, updated_at)

USERS (user_id [PK], email [UK], password_hash, role, status, created_at, updated_at)

STUDENTS (student_id [PK], user_id [FK->USERS, UK], roll_number [UK], first_name, last_name, 
          dob, phone, address, enrollment_year, department_id [FK->DEPARTMENTS], created_at, updated_at)

FACULTY (faculty_id [PK], user_id [FK->USERS, UK], employee_code [UK], first_name, last_name, 
         designation, phone, department_id [FK->DEPARTMENTS], created_at, updated_at)

COURSES (course_id [PK], course_code [UK], course_name, credits, semester, 
         department_id [FK->DEPARTMENTS], faculty_id [FK->FACULTY, NULLABLE], created_at, updated_at)

ENROLLMENTS (enrollment_id [PK], student_id [FK->STUDENTS], course_id [FK->COURSES], semester, 
             academic_year, status, created_at, UNIQUE(student_id, course_id, semester, academic_year))

ATTENDANCE (attendance_id [PK], enrollment_id [FK->ENROLLMENTS], attendance_date, status, 
            marked_by [FK->USERS], remarks, created_at, updated_at, UNIQUE(enrollment_id, attendance_date))

EXAMS (exam_id [PK], course_id [FK->COURSES], exam_name, exam_type, exam_date, max_marks, 
       created_by [FK->USERS], created_at, updated_at, UNIQUE(course_id, exam_name))

RESULTS (result_id [PK], exam_id [FK->EXAMS], enrollment_id [FK->ENROLLMENTS], marks_obtained, 
         grade, entered_by [FK->USERS], created_at, updated_at, UNIQUE(exam_id, enrollment_id))

AUDIT_LOGS (log_id [PK], actor_user_id [FK->USERS], action, entity_type, entity_id, 
            metadata [JSON], ip_address, created_at)
```

---

## 5. UML Class Diagram

```mermaid
classDiagram
    class User {
        +int userId
        +string email
        +string passwordHash
        +Role role
        +Status status
        +login(password) bool
        +logout() void
    }

    class Student {
        +int studentId
        +string rollNumber
        +string firstName
        +string lastName
        +Date dob
        +int enrollmentYear
        +getDossier() Dossier
        +calculateGPA() float
    }

    class Faculty {
        +int facultyId
        +string employeeCode
        +string firstName
        +string lastName
        +string designation
        +getAssignedCourses() List~Course~
    }

    class Course {
        +int courseId
        +string courseCode
        +string courseName
        +int credits
        +int semester
    }

    class Enrollment {
        +int enrollmentId
        +int semester
        +string academicYear
        +EnrollmentStatus status
    }

    class Attendance {
        +int attendanceId
        +Date date
        +AttendanceStatus status
        +string remarks
    }

    class Exam {
        +int examId
        +string examName
        +ExamType examType
        +Date examDate
        +float maxMarks
    }

    class Result {
        +int resultId
        +float marksObtained
        +string grade
        +calculateGrade() string
    }

    User <|-- Student
    User <|-- Faculty
    Course "1" --> "*" Enrollment
    Student "1" --> "*" Enrollment
    Enrollment "1" --> "*" Attendance
    Course "1" --> "*" Exam
    Exam "1" --> "*" Result
    Enrollment "1" --> "*" Result
```

---

## 6. Sequence Diagrams

### 6.1 Authentication & RBAC Verification Sequence
```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant API as Express Router
    participant AuthMW as requireAuth / RBAC
    participant AuthService as AuthService
    participant MySQL as MySQL Database

    User->>API: POST /api/auth/login { email, password }
    API->>AuthService: login(email, password)
    AuthService->>MySQL: SELECT * FROM users WHERE email = ?
    MySQL-->>AuthService: Return User Row (with password_hash)
    AuthService->>AuthService: bcrypt.compare(password, password_hash)
    AuthService->>MySQL: INSERT INTO audit_logs (USER_LOGIN)
    AuthService-->>API: User Profile Payload
    API->>API: req.session.user = payload
    API-->>User: 200 OK with Set-Cookie: campus_session_id

    User->>API: GET /api/departments (with session cookie)
    API->>AuthMW: Validate session & role
    AuthMW-->>API: Session valid & role allowed
    API->>MySQL: SELECT * FROM departments
    MySQL-->>API: Department rows
    API-->>User: 200 OK { success: true, data: [...] }
```

### 6.2 Transactional Student Registration Sequence
```mermaid
sequenceDiagram
    autonumber
    actor Admin as Administrator
    participant API as StudentController
    participant Service as StudentService
    participant DB as MySQL Connection (InnoDB)

    Admin->>API: POST /api/students { email, roll_number, name, dept_id, ... }
    API->>Service: createStudent(payload, actorId)
    Service->>DB: connection.beginTransaction()
    Service->>DB: INSERT INTO users (...)
    DB-->>Service: user_id = 42
    Service->>DB: INSERT INTO students (user_id=42, roll_number, ...)
    alt Roll Number Unique Constraint Met
        DB-->>Service: student_id = 15
        Service->>DB: INSERT INTO audit_logs (STUDENT_CREATED, entity_id=15)
        Service->>DB: connection.commit()
        Service-->>API: Student Created Record
        API-->>Admin: 201 Created { success: true, data: {...} }
    else Duplicate Roll Number Detected (ER_DUP_ENTRY)
        DB-->>Service: Error 1062 Duplicate Key
        Service->>DB: connection.rollback()
        Service-->>API: Error thrown (409 Conflict)
        API-->>Admin: 409 Conflict (Orphan user record rolled back)
    end
```

### 6.3 Bulk Attendance Marking Sequence
```mermaid
sequenceDiagram
    autonumber
    actor Fac as Faculty Member
    participant API as AttendanceController
    participant RBAC as requireCourseFacultyOwnership
    participant Service as AttendanceService
    participant DB as MySQL Database

    Fac->>API: POST /api/attendance/bulk { course_id: 1, date, records: [...] }
    API->>RBAC: Verify courses.faculty_id == req.user.faculty_id
    alt Not Instructor for Course
        RBAC-->>Fac: 403 Forbidden (Unassigned Course)
    else Instructor Verified
        RBAC->>Service: markBulkAttendance(...)
        Service->>DB: connection.beginTransaction()
        Service->>DB: Validate all enrollment_ids belong to course_id
        Service->>DB: INSERT INTO attendance (...) ON DUPLICATE KEY UPDATE status, remarks
        Service->>DB: INSERT INTO audit_logs (ATTENDANCE_BULK_MARKED)
        Service->>DB: connection.commit()
        Service-->>API: Processed count
        API-->>Fac: 201 Created { success: true, data: {...} }
    end
```

---

## 7. Data Flow Diagrams (DFD)

### 7.1 Level-0 Context DFD
```mermaid
graph LR
    Admin[Administrator] -->|Curriculum & User Management| SCMS((Smart Campus System))
    Faculty[Faculty Member] -->|Attendance & Exam Marks| SCMS
    Student[Student] -->|Profile & Record Queries| SCMS

    SCMS -->|Institutional Reports & Audits| Admin
    SCMS -->|Course Performance Summaries| Faculty
    SCMS -->|Grades & Attendance Dossier| Student
```

### 7.2 Level-1 Detailed DFD
```mermaid
graph TD
    User([User Entity]) -->|Credentials| P1[1.0 Authentication Engine]
    P1 -->|Session Data| D1[(Sessions Table)]
    P1 -->|Auth Context| P2[2.0 RBAC Controller]

    P2 -->|Admin Requests| P3[3.0 Institutional Management]
    P3 --> D2[(Departments & Courses)]
    P3 --> D3[(Users & Profiles)]

    P2 -->|Faculty Requests| P4[4.0 Academic Operations]
    P4 --> D4[(Enrollments Table)]
    P4 --> D5[(Attendance Table)]
    P4 --> D6[(Exams & Results)]

    P2 -->|Student Requests| P5[5.0 Academic Dossier Inquiry]
    D4 --> P5
    D5 --> P5
    D6 --> P5

    P3 -->|Event Log| D7[(Audit Logs Table)]
    P4 -->|Event Log| D7
```

