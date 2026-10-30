-- =============================================================================
-- SMART CAMPUS MANAGEMENT SYSTEM - DATABASE SCHEMA (3NF)
-- DBMS Engine: MySQL 8.0+ (InnoDB, utf8mb4)
-- Enforces: Strict Referential Integrity, Constraints, Indexes & Audit Logs
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `leave_requests`;
DROP TABLE IF EXISTS `timetable_slots`;
DROP TABLE IF EXISTS `course_prerequisites`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `results`;
DROP TABLE IF EXISTS `exams`;
DROP TABLE IF EXISTS `attendance`;
DROP TABLE IF EXISTS `enrollments`;
DROP TABLE IF EXISTS `courses`;
DROP TABLE IF EXISTS `faculty`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `departments`;
DROP TABLE IF EXISTS `sessions`;
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- 1. DEPARTMENTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `departments` (
    `department_id` INT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(10) NOT NULL UNIQUE,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `description` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. USERS TABLE (Authentication & Base Role Entity)
-- -----------------------------------------------------------------------------
CREATE TABLE `users` (
    `user_id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('administrator', 'faculty', 'student') NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_users_role_status` (`role`, `status`),
    INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. STUDENTS TABLE (Academic Profile)
-- -----------------------------------------------------------------------------
CREATE TABLE `students` (
    `student_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `roll_number` VARCHAR(30) NOT NULL UNIQUE,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `dob` DATE NOT NULL,
    `phone` VARCHAR(20) NULL,
    `address` TEXT NULL,
    `enrollment_year` YEAR NOT NULL,
    `department_id` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_students_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_students_department` FOREIGN KEY (`department_id`)
        REFERENCES `departments` (`department_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_students_dept` (`department_id`),
    INDEX `idx_students_roll` (`roll_number`),
    INDEX `idx_students_name` (`last_name`, `first_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. FACULTY TABLE (Instructor Profile)
-- -----------------------------------------------------------------------------
CREATE TABLE `faculty` (
    `faculty_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `employee_code` VARCHAR(30) NOT NULL UNIQUE,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `designation` VARCHAR(80) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `department_id` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_faculty_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_faculty_department` FOREIGN KEY (`department_id`)
        REFERENCES `departments` (`department_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_faculty_dept` (`department_id`),
    INDEX `idx_faculty_code` (`employee_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. COURSES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `courses` (
    `course_id` INT AUTO_INCREMENT PRIMARY KEY,
    `course_code` VARCHAR(20) NOT NULL UNIQUE,
    `course_name` VARCHAR(120) NOT NULL,
    `credits` INT NOT NULL,
    `semester` INT NOT NULL,
    `department_id` INT NOT NULL,
    `faculty_id` INT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `chk_courses_credits` CHECK (`credits` BETWEEN 1 AND 6),
    CONSTRAINT `chk_courses_semester` CHECK (`semester` BETWEEN 1 AND 8),
    CONSTRAINT `fk_courses_department` FOREIGN KEY (`department_id`)
        REFERENCES `departments` (`department_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_courses_faculty` FOREIGN KEY (`faculty_id`)
        REFERENCES `faculty` (`faculty_id`) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX `idx_courses_dept` (`department_id`),
    INDEX `idx_courses_faculty` (`faculty_id`),
    INDEX `idx_courses_code` (`course_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. ENROLLMENTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `enrollments` (
    `enrollment_id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` INT NOT NULL,
    `course_id` INT NOT NULL,
    `semester` INT NOT NULL,
    `academic_year` VARCHAR(9) NOT NULL,
    `status` ENUM('enrolled', 'dropped', 'completed') NOT NULL DEFAULT 'enrolled',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_enrollments_semester` CHECK (`semester` BETWEEN 1 AND 8),
    CONSTRAINT `fk_enrollments_student` FOREIGN KEY (`student_id`)
        REFERENCES `students` (`student_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_enrollments_course` FOREIGN KEY (`course_id`)
        REFERENCES `courses` (`course_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `uq_student_course_term` UNIQUE (`student_id`, `course_id`, `semester`, `academic_year`),
    INDEX `idx_enrollments_student` (`student_id`),
    INDEX `idx_enrollments_course` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. ATTENDANCE TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `attendance` (
    `attendance_id` INT AUTO_INCREMENT PRIMARY KEY,
    `enrollment_id` INT NOT NULL,
    `attendance_date` DATE NOT NULL,
    `status` ENUM('Present', 'Absent', 'Late', 'Excused') NOT NULL,
    `marked_by` INT NOT NULL,
    `remarks` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_attendance_enrollment` FOREIGN KEY (`enrollment_id`)
        REFERENCES `enrollments` (`enrollment_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_attendance_marked_by` FOREIGN KEY (`marked_by`)
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `uq_enrollment_date` UNIQUE (`enrollment_id`, `attendance_date`),
    INDEX `idx_attendance_date` (`attendance_date`),
    INDEX `idx_attendance_enrollment` (`enrollment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. EXAMS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `exams` (
    `exam_id` INT AUTO_INCREMENT PRIMARY KEY,
    `course_id` INT NOT NULL,
    `exam_name` VARCHAR(100) NOT NULL,
    `exam_type` ENUM('Midterm', 'Final', 'Quiz', 'Practical') NOT NULL,
    `exam_date` DATE NOT NULL,
    `max_marks` DECIMAL(5,2) NOT NULL,
    `created_by` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `chk_exams_max_marks` CHECK (`max_marks` > 0),
    CONSTRAINT `fk_exams_course` FOREIGN KEY (`course_id`)
        REFERENCES `courses` (`course_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_exams_creator` FOREIGN KEY (`created_by`)
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `uq_course_exam_name` UNIQUE (`course_id`, `exam_name`),
    INDEX `idx_exams_course` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. RESULTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `results` (
    `result_id` INT AUTO_INCREMENT PRIMARY KEY,
    `exam_id` INT NOT NULL,
    `enrollment_id` INT NOT NULL,
    `marks_obtained` DECIMAL(5,2) NOT NULL,
    `grade` VARCHAR(2) NOT NULL,
    `entered_by` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `chk_results_marks` CHECK (`marks_obtained` >= 0),
    CONSTRAINT `fk_results_exam` FOREIGN KEY (`exam_id`)
        REFERENCES `exams` (`exam_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_results_enrollment` FOREIGN KEY (`enrollment_id`)
        REFERENCES `enrollments` (`enrollment_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_results_entered_by` FOREIGN KEY (`entered_by`)
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `uq_exam_enrollment` UNIQUE (`exam_id`, `enrollment_id`),
    INDEX `idx_results_exam` (`exam_id`),
    INDEX `idx_results_enrollment` (`enrollment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. AUDIT LOGS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE `audit_logs` (
    `log_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `actor_user_id` INT NULL,
    `action` VARCHAR(80) NOT NULL,
    `entity_type` VARCHAR(50) NOT NULL,
    `entity_id` VARCHAR(50) NULL,
    `metadata` JSON NULL,
    `ip_address` VARCHAR(45) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_audit_actor` FOREIGN KEY (`actor_user_id`)
        REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX `idx_audit_actor` (`actor_user_id`),
    INDEX `idx_audit_action` (`action`),
    INDEX `idx_audit_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 11. SESSIONS TABLE (For express-mysql-session Store)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sessions` (
    `session_id` VARCHAR(128) COLLATE utf8mb4_bin NOT NULL PRIMARY KEY,
    `expires` INT(11) UNSIGNED NOT NULL,
    `data` MEDIUMTEXT COLLATE utf8mb4_bin,
    INDEX `idx_sessions_expires` (`expires`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 12. COURSE PREREQUISITES TABLE
-- Enforces curriculum dependency and academic progression
-- -----------------------------------------------------------------------------
CREATE TABLE `course_prerequisites` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `course_id` INT NOT NULL,
    `prerequisite_course_id` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_prereq_distinct` CHECK (`course_id` <> `prerequisite_course_id`),
    CONSTRAINT `fk_prereq_course` FOREIGN KEY (`course_id`)
        REFERENCES `courses` (`course_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_prereq_required_course` FOREIGN KEY (`prerequisite_course_id`)
        REFERENCES `courses` (`course_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `uq_course_prereq` UNIQUE (`course_id`, `prerequisite_course_id`),
    INDEX `idx_prereq_course` (`course_id`),
    INDEX `idx_prereq_required` (`prerequisite_course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 13. TIMETABLE SLOTS TABLE
-- Clash-free lecture and lab scheduling with room and faculty overlap prevention
-- -----------------------------------------------------------------------------
CREATE TABLE `timetable_slots` (
    `slot_id` INT AUTO_INCREMENT PRIMARY KEY,
    `course_id` INT NOT NULL,
    `day_of_week` ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `room_number` VARCHAR(30) NOT NULL,
    `semester` INT NOT NULL,
    `academic_year` VARCHAR(9) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_timetable_semester` CHECK (`semester` BETWEEN 1 AND 8),
    CONSTRAINT `chk_timetable_time_window` CHECK (`end_time` > `start_time`),
    CONSTRAINT `fk_timetable_course` FOREIGN KEY (`course_id`)
        REFERENCES `courses` (`course_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `uq_room_schedule` UNIQUE (`day_of_week`, `start_time`, `room_number`, `academic_year`, `semester`),
    INDEX `idx_timetable_course` (`course_id`),
    INDEX `idx_timetable_day_time` (`day_of_week`, `start_time`, `end_time`),
    INDEX `idx_timetable_room` (`room_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 14. LEAVE REQUESTS TABLE
-- Student medical excuses & attendance excuse approvals
-- -----------------------------------------------------------------------------
CREATE TABLE `leave_requests` (
    `leave_id` INT AUTO_INCREMENT PRIMARY KEY,
    `enrollment_id` INT NOT NULL,
    `leave_date` DATE NOT NULL,
    `reason` VARCHAR(500) NOT NULL,
    `status` ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
    `reviewed_by` INT NULL,
    `review_remarks` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_leave_enrollment` FOREIGN KEY (`enrollment_id`)
        REFERENCES `enrollments` (`enrollment_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_leave_reviewed_by` FOREIGN KEY (`reviewed_by`)
        REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `uq_enrollment_leave_date` UNIQUE (`enrollment_id`, `leave_date`),
    INDEX `idx_leave_enrollment` (`enrollment_id`),
    INDEX `idx_leave_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 15. NOTIFICATIONS TABLE
-- Real-time role-targeted and user-specific in-app alerts
-- -----------------------------------------------------------------------------
CREATE TABLE `notifications` (
    `notification_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `title` VARCHAR(120) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('ATTENDANCE_ALERT', 'EXAM_RESULT', 'LEAVE_UPDATE', 'SYSTEM_ANNOUNCEMENT', 'FEE_RECEIPT') NOT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_notifications_user` (`user_id`, `created_at`),
    INDEX `idx_notifications_unread` (`user_id`, `is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 16. FEE_STRUCTURES TABLE
-- Prescribes semester/department fee breakdown and due dates
-- -----------------------------------------------------------------------------
CREATE TABLE `fee_structures` (
    `structure_id` INT AUTO_INCREMENT PRIMARY KEY,
    `department_id` INT NOT NULL,
    `semester` INT NOT NULL CHECK (`semester` BETWEEN 1 AND 8),
    `academic_year` VARCHAR(9) NOT NULL,
    `tuition_fee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `development_fee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `laboratory_fee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `library_fee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `other_charges` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `total_fee` DECIMAL(10, 2) GENERATED ALWAYS AS (
        `tuition_fee` + `development_fee` + `laboratory_fee` + `library_fee` + `other_charges`
    ) STORED,
    `due_date` DATE NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_fee_structures_dept` FOREIGN KEY (`department_id`)
        REFERENCES `departments` (`department_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `uq_dept_sem_year` UNIQUE (`department_id`, `semester`, `academic_year`),
    INDEX `idx_fee_dept_sem` (`department_id`, `semester`, `academic_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 17. STUDENT_INVOICES TABLE
-- Student-specific fee bill instances with scholarship adjustments
-- -----------------------------------------------------------------------------
CREATE TABLE `student_invoices` (
    `invoice_id` INT AUTO_INCREMENT PRIMARY KEY,
    `invoice_number` VARCHAR(30) NOT NULL UNIQUE,
    `student_id` INT NOT NULL,
    `structure_id` INT NOT NULL,
    `total_due` DECIMAL(10, 2) NOT NULL,
    `scholarship_discount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `net_payable` DECIMAL(10, 2) NOT NULL,
    `amount_paid` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `status` ENUM('Pending', 'Partially_Paid', 'Paid', 'Overdue') NOT NULL DEFAULT 'Pending',
    `generated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_invoices_student` FOREIGN KEY (`student_id`)
        REFERENCES `students` (`student_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_invoices_structure` FOREIGN KEY (`structure_id`)
        REFERENCES `fee_structures` (`structure_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `uq_student_structure` UNIQUE (`student_id`, `structure_id`),
    INDEX `idx_invoices_student` (`student_id`),
    INDEX `idx_invoices_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 18. FEE_PAYMENTS TABLE
-- Itemized financial transaction ledger with audit trace & receipt numbers
-- -----------------------------------------------------------------------------
CREATE TABLE `fee_payments` (
    `payment_id` INT AUTO_INCREMENT PRIMARY KEY,
    `invoice_id` INT NOT NULL,
    `receipt_number` VARCHAR(30) NOT NULL UNIQUE,
    `amount_paid` DECIMAL(10, 2) NOT NULL CHECK (`amount_paid` > 0),
    `payment_mode` ENUM('UPI', 'Net_Banking', 'Credit_Card', 'Debit_Card', 'Demand_Draft', 'Cash') NOT NULL,
    `transaction_reference` VARCHAR(100) NOT NULL UNIQUE,
    `paid_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `recorded_by_user_id` INT NOT NULL,
    `remarks` VARCHAR(255) NULL,
    CONSTRAINT `fk_fee_payments_invoice` FOREIGN KEY (`invoice_id`)
        REFERENCES `student_invoices` (`invoice_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_fee_payments_user` FOREIGN KEY (`recorded_by_user_id`)
        REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_payments_invoice` (`invoice_id`),
    INDEX `idx_payments_receipt` (`receipt_number`),
    INDEX `idx_payments_tx_ref` (`transaction_reference`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

