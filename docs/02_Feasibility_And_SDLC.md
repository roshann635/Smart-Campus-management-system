# Feasibility Analysis and SDLC Methodology
## Smart Campus Management System

---

## 1. Feasibility Study

### 1.1 Technical Feasibility
The chosen technology stack (React 18, Vite, Express.js, Node.js, and MySQL 8.0) is technically mature, industry-proven, and supported by extensive community documentation:
- **Relational Integrity:** MySQL InnoDB engine delivers full ACID compliance, foreign-key cascade/restrict controls, and deterministic transaction isolation (`REPEATABLE READ`).
- **Raw SQL Parameterization:** Avoids ORM bloat and overhead, allowing direct demonstration of DBMS concepts (indexes, joins, views, locks, constraints).
- **Asynchronous Architecture:** Node.js event loop handles concurrent HTTP client connections with connection pool reuse (`mysql2/promise`).

### 1.2 Operational Feasibility
- **Role Alignment:** The software models actual university workflows (Admissions -> Curriculum Setup -> Semester Enrollment -> Daily Attendance -> Exam Marks -> Reporting).
- **Zero Training Barrier:** The single-page interface offers intuitive role-specific navigations, live grade previewing, and one-click quick-fill credentials for demo reviews and grading vivas.

### 1.3 Economic Feasibility
- **Open-Source Foundations:** 100% of libraries used (MySQL Community Server, Express, React, Vite, Tailwind CSS, Vitest) are open source under MIT/ISC/GPL licenses.
- **Hardware Efficiency:** Lightweight memory footprint allows deployment on entry-level cloud VMs (1 vCPU, 1 GB RAM) or standard campus laboratory machines.

---

## 2. Software Development Life Cycle (SDLC) Model

The project adopts an **Iterative Incremental SDLC Model** aligned with Phase-Gate verification:

```
[Phase 1: Inception & Scaffolding]
       │
       ▼
[Phase 2: Relational Schema & 3NF Design]
       │
       ▼
[Phase 3: Core API Services & ACID Transactions]
       │
       ▼
[Phase 4: Automated Verification (Vitest & Supertest)]
       │
       ▼
[Phase 5: User Interface Development (React + Vite)]
       │
       ▼
[Phase 6: Academic Documentation & Deployment Runbooks]
```

### Phase-Gate Milestone Reviews
1. **Gate 1 (Data Layer Verification):** Relational schema scripts verified for foreign key consistency, composite unique keys, check constraints, and view definitions.
2. **Gate 2 (Backend & Transactional Verification):** All 22 test scenarios pass in Vitest with zero exit code.
3. **Gate 3 (Build & Frontend Verification):** Client builds cleanly via `vite build` without syntax or import errors.

---

## 3. Comprehensive Risk Register

| Risk ID | Description | Severity | Probability | Mitigation Strategy |
| :--- | :--- | :---: | :---: | :--- |
| **RSK-01** | Database offline during demonstration | High | Medium | Test harness with mock pool fallbacks allows full verification; scripts provide automated initialization once MySQL starts. |
| **RSK-02** | SQL Injection via search parameters | Critical | Low | 100% prepared parameterized SQL statements (`?` placeholders) throughout all controllers and services. |
| **RSK-03** | Partial failure during multi-table creation | Critical | Medium | Explicit ACID transactions (`beginTransaction()`, `commit()`, `rollback()`) wrapped in `try/catch/finally` blocks. |
| **RSK-04** | Unauthorized student cross-inspection | High | Low | Server-side RBAC middleware `requireStudentOwnership` enforces that students can only query their own ID. |
| **RSK-05** | High-load session expiration loss | Medium | Low | Server-side session persistence in MySQL (`express-mysql-session`) with automated session cleanup. |

