-- =============================================================================
-- SMART CAMPUS MANAGEMENT SYSTEM - SEED DATA
-- Seeded Academic Entities, User Accounts, Courses, Enrollments, and Metrics
-- Default Password for all seed users: Campus@123
-- (Bcrypt hash: $2a$10$e8wV411DfgH8W51Z03E8c.lR0u2J7QO0BvE17Iu5o0gC/gQ3zQ9aO)
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `notifications`;
TRUNCATE TABLE `leave_requests`;
TRUNCATE TABLE `timetable_slots`;
TRUNCATE TABLE `course_prerequisites`;
TRUNCATE TABLE `audit_logs`;
TRUNCATE TABLE `results`;
TRUNCATE TABLE `exams`;
TRUNCATE TABLE `attendance`;
TRUNCATE TABLE `enrollments`;
TRUNCATE TABLE `courses`;
TRUNCATE TABLE `faculty`;
TRUNCATE TABLE `students`;
TRUNCATE TABLE `users`;
TRUNCATE TABLE `departments`;
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- 1. DEPARTMENTS
-- -----------------------------------------------------------------------------
INSERT INTO `departments` (`department_id`, `code`, `name`, `description`) VALUES
(1, 'CSE', 'Computer Science and Engineering', 'Department specializing in software engineering, algorithms, AI, and systems architecture.'),
(2, 'ECE', 'Electronics and Communication Engineering', 'Department focusing on telecommunications, embedded systems, VLSI, and signal processing.'),
(3, 'MECH', 'Mechanical Engineering', 'Department covering thermodynamics, fluid mechanics, robotics, and manufacturing engineering.'),
(4, 'CIVIL', 'Civil and Environmental Engineering', 'Department dedicated to structural analysis, transportation, and geotechnical engineering.');

-- -----------------------------------------------------------------------------
-- 2. USERS
-- Initial temporary bcrypt hash for 'Campus@123'; dynamically refreshed by init-db.js
-- -----------------------------------------------------------------------------
INSERT INTO `users` (`user_id`, `email`, `password_hash`, `role`, `status`) VALUES
(1, 'admin@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'administrator', 'active'),
(2, 'faculty1@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'faculty', 'active'),
(3, 'faculty2@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'faculty', 'active'),
(4, 'student1@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(5, 'student2@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(6, 'student3@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(7, 'student4@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(8, 'student5@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(9, 'student6@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(10, 'student7@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(11, 'student8@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(12, 'student9@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(13, 'student10@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(14, 'student11@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(15, 'student12@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(16, 'student13@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(17, 'student14@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(18, 'student15@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(19, 'student16@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(20, 'student17@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(21, 'student18@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(22, 'student19@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(23, 'student20@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(24, 'student21@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(25, 'student22@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(26, 'student23@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(27, 'student24@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(28, 'student25@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(29, 'student26@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(30, 'student27@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(31, 'student28@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(32, 'student29@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(33, 'student30@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(34, 'student31@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(35, 'student32@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(36, 'student33@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(37, 'student34@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(38, 'student35@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(39, 'student36@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(40, 'student37@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(41, 'student38@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(42, 'student39@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(43, 'student40@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(44, 'student41@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(45, 'student42@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(46, 'student43@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(47, 'student44@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(48, 'student45@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(49, 'student46@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(50, 'student47@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(51, 'student48@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(52, 'student49@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(53, 'student50@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(54, 'student51@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(55, 'student52@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(56, 'student53@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(57, 'student54@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(58, 'student55@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(59, 'student56@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(60, 'student57@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(61, 'student58@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(62, 'student59@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(63, 'student60@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(64, 'student61@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(65, 'student62@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(66, 'student63@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(67, 'student64@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(68, 'student65@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(69, 'student66@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(70, 'student67@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(71, 'student68@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(72, 'student69@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(73, 'student70@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(74, 'student71@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(75, 'student72@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(76, 'student73@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(77, 'student74@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active'),
(78, 'student75@campus.edu', '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO', 'student', 'active');

-- -----------------------------------------------------------------------------
-- 3. FACULTY PROFILES
-- -----------------------------------------------------------------------------
INSERT INTO `faculty` (`faculty_id`, `user_id`, `employee_code`, `first_name`, `last_name`, `designation`, `phone`, `department_id`) VALUES
(1, 2, 'FAC-CSE-001', 'Alan', 'Turing', 'Professor & Head', '+1-555-0101', 1),
(2, 3, 'FAC-ECE-002', 'Grace', 'Hopper', 'Associate Professor', '+1-555-0102', 2);

-- -----------------------------------------------------------------------------
-- 4. STUDENT PROFILES
-- -----------------------------------------------------------------------------
INSERT INTO `students` (`student_id`, `user_id`, `roll_number`, `first_name`, `last_name`, `dob`, `phone`, `address`, `enrollment_year`, `department_id`) VALUES
(1, 4, 'CS2025001', 'Himesh Sunil', 'Adhikari', '2004-02-02', '+91-98220-10001', 'Campus Hostel, Tech Campus', 2025, 1),
(2, 5, 'CS2025002', 'Sanjana Bharat', 'Bagul', '2004-03-03', '+91-98220-10002', 'Campus Hostel, Tech Campus', 2025, 1),
(3, 6, 'CS2025003', 'Vaibhav Satyavijay', 'Baisane', '2004-04-04', '+91-98220-10003', 'Campus Hostel, Tech Campus', 2025, 1),
(4, 7, 'CS2025004', 'Tirupati Gorakh', 'Beldar', '2004-05-05', '+91-98220-10004', 'Campus Hostel, Tech Campus', 2025, 1),
(5, 8, 'CS2025005', 'Renuka Arun', 'Berad', '2004-06-06', '+91-98220-10005', 'Campus Hostel, Tech Campus', 2025, 1),
(6, 9, 'CS2025006', 'Adwait Sunil', 'Bhatkhande', '2004-07-07', '+91-98220-10006', 'Campus Hostel, Tech Campus', 2025, 1),
(7, 10, 'CS2025007', 'Pranali Arvind', 'Bhavar', '2004-08-08', '+91-98220-10007', 'Campus Hostel, Tech Campus', 2025, 1),
(8, 11, 'CS2025008', 'Devayani Vasant', 'Birari', '2004-09-09', '+91-98220-10008', 'Campus Hostel, Tech Campus', 2025, 1),
(9, 12, 'CS2025009', 'Kalpesh Navnath', 'Bire', '2004-10-10', '+91-98220-10009', 'Campus Hostel, Tech Campus', 2025, 1),
(10, 13, 'CS2025010', 'Payal Laxman', 'Bonde', '2004-11-11', '+91-98220-10010', 'Campus Hostel, Tech Campus', 2025, 1),
(11, 14, 'CS2025011', 'Anurag Narayan', 'Borse', '2004-12-12', '+91-98220-10011', 'Campus Hostel, Tech Campus', 2025, 1),
(12, 15, 'CS2025012', 'Kaustubh Pravin', 'Chaudhari', '2004-01-13', '+91-98220-10012', 'Campus Hostel, Tech Campus', 2025, 1),
(13, 16, 'CS2025013', 'Krushnal Mahesh', 'Chaudhari', '2004-02-14', '+91-98220-10013', 'Campus Hostel, Tech Campus', 2025, 1),
(14, 17, 'CS2025014', 'Sharvari Sandeep', 'Chaudhari', '2004-03-15', '+91-98220-10014', 'Campus Hostel, Tech Campus', 2025, 1),
(15, 18, 'CS2025015', 'Farukh Israil', 'Chaudhary', '2004-04-16', '+91-98220-10015', 'Campus Hostel, Tech Campus', 2025, 1),
(16, 19, 'CS2025016', 'Sanika Raju', 'Choughule', '2004-05-17', '+91-98220-10016', 'Campus Hostel, Tech Campus', 2025, 1),
(17, 20, 'CS2025017', 'Om Sachin', 'Deshmukh', '2004-06-18', '+91-98220-10017', 'Campus Hostel, Tech Campus', 2025, 1),
(18, 21, 'CS2025018', 'Abhishek Dnyandev', 'Dhomse', '2004-07-19', '+91-98220-10018', 'Campus Hostel, Tech Campus', 2025, 1),
(19, 22, 'CS2025019', 'Apurva Sanjay', 'Dhondage', '2004-08-20', '+91-98220-10019', 'Campus Hostel, Tech Campus', 2025, 1),
(20, 23, 'CS2025020', 'Swapnil Sanjay', 'Erande', '2004-09-21', '+91-98220-10020', 'Campus Hostel, Tech Campus', 2025, 1),
(21, 24, 'CS2025021', 'Ajinkyaraj Somnath', 'Gaikwad', '2004-10-22', '+91-98220-10021', 'Campus Hostel, Tech Campus', 2025, 1),
(22, 25, 'CS2025022', 'Ayush Suresh', 'Gaikwad', '2004-11-23', '+91-98220-10022', 'Campus Hostel, Tech Campus', 2025, 1),
(23, 26, 'CS2025023', 'Karan Ravikumar', 'Gaikwad', '2004-12-24', '+91-98220-10023', 'Campus Hostel, Tech Campus', 2025, 1),
(24, 27, 'CS2025024', 'Rohan Vishnu', 'Gaikwad', '2004-01-25', '+91-98220-10024', 'Campus Hostel, Tech Campus', 2025, 1),
(25, 28, 'CS2025025', 'Roshan Nitin', 'Gaikwad', '2004-02-26', '+91-98220-10025', 'Campus Hostel, Tech Campus', 2025, 1),
(26, 29, 'CS2025026', 'Vaishnavi Pradeepkumar', 'Itagi', '2004-03-27', '+91-98220-10026', 'Campus Hostel, Tech Campus', 2025, 1),
(27, 30, 'CS2025027', 'Aarya Narendra', 'Jadhav', '2004-04-28', '+91-98220-10027', 'Campus Hostel, Tech Campus', 2025, 1),
(28, 31, 'CS2025028', 'Bhumika Anil', 'Jadhav', '2004-05-01', '+91-98220-10028', 'Campus Hostel, Tech Campus', 2025, 1),
(29, 32, 'CS2025029', 'Om Dilip', 'Jadhav', '2004-06-02', '+91-98220-10029', 'Campus Hostel, Tech Campus', 2025, 1),
(30, 33, 'CS2025030', 'Roshan Hari', 'Jadhav', '2004-07-03', '+91-98220-10030', 'Campus Hostel, Tech Campus', 2025, 1),
(31, 34, 'CS2025031', 'Rucha Rajkumar', 'Jadhav', '2004-08-04', '+91-98220-10031', 'Campus Hostel, Tech Campus', 2025, 1),
(32, 35, 'CS2025032', 'Shaarav Akhilesh', 'Jain', '2004-09-05', '+91-98220-10032', 'Campus Hostel, Tech Campus', 2025, 1),
(33, 36, 'CS2025033', 'Sumit Gulab', 'Jamdhade', '2004-10-06', '+91-98220-10033', 'Campus Hostel, Tech Campus', 2025, 1),
(34, 37, 'CS2025034', 'Bhoomi Amit', 'Kabra', '2004-11-07', '+91-98220-10034', 'Campus Hostel, Tech Campus', 2025, 1),
(35, 38, 'CS2025035', 'Srushti Ramchandra', 'Kadam', '2004-12-08', '+91-98220-10035', 'Campus Hostel, Tech Campus', 2025, 1),
(36, 39, 'CS2025036', 'Omkar Sandip', 'Kahandal', '2004-01-09', '+91-98220-10036', 'Campus Hostel, Tech Campus', 2025, 1),
(37, 40, 'CS2025037', 'Sahil Shailesh', 'Kandalkar', '2004-02-10', '+91-98220-10037', 'Campus Hostel, Tech Campus', 2025, 1),
(38, 41, 'CS2025038', 'Ojaswita Sanjay', 'Kapadne', '2004-03-11', '+91-98220-10038', 'Campus Hostel, Tech Campus', 2025, 1),
(39, 42, 'CS2025039', 'Anjali Sachin', 'Karhale', '2004-04-12', '+91-98220-10039', 'Campus Hostel, Tech Campus', 2025, 1),
(40, 43, 'CS2025040', 'Akanksha Mangesh', 'Khodake', '2004-05-13', '+91-98220-10040', 'Campus Hostel, Tech Campus', 2025, 1),
(41, 44, 'CS2025041', 'Apurv Santosh', 'Kulkarni', '2004-06-14', '+91-98220-10041', 'Campus Hostel, Tech Campus', 2025, 1),
(42, 45, 'CS2025042', 'Pranav Shailesh', 'Landge', '2004-07-15', '+91-98220-10042', 'Campus Hostel, Tech Campus', 2025, 1),
(43, 46, 'CS2025043', 'Tanish Narendra', 'Mahajan', '2004-08-16', '+91-98220-10043', 'Campus Hostel, Tech Campus', 2025, 1),
(44, 47, 'CS2025044', 'Suhani Kundan', 'Mahapatra', '2004-09-17', '+91-98220-10044', 'Campus Hostel, Tech Campus', 2025, 1),
(45, 48, 'CS2025045', 'Ashay Shriram', 'Makode', '2004-10-18', '+91-98220-10045', 'Campus Hostel, Tech Campus', 2025, 1),
(46, 49, 'CS2025046', 'Sanchita Pawan', 'Misar', '2004-11-19', '+91-98220-10046', 'Campus Hostel, Tech Campus', 2025, 1),
(47, 50, 'CS2025047', 'Abhijith Ramachandran', 'Nair', '2004-12-20', '+91-98220-10047', 'Campus Hostel, Tech Campus', 2025, 1),
(48, 51, 'CS2025048', 'Muskan', 'Nath', '2004-01-21', '+91-98220-10048', 'Campus Hostel, Tech Campus', 2025, 1),
(49, 52, 'CS2025049', 'Harsh Sanjay', 'Navandar', '2004-02-22', '+91-98220-10049', 'Campus Hostel, Tech Campus', 2025, 1),
(50, 53, 'CS2025050', 'Het Dakshes', 'Parekh', '2004-03-23', '+91-98220-10050', 'Campus Hostel, Tech Campus', 2025, 1),
(51, 54, 'CS2025051', 'Hrutuja Hemant', 'Patil', '2004-04-24', '+91-98220-10051', 'Campus Hostel, Tech Campus', 2025, 2),
(52, 55, 'CS2025052', 'Sharayu Sanjay', 'Patil', '2004-05-25', '+91-98220-10052', 'Campus Hostel, Tech Campus', 2025, 2),
(53, 56, 'CS2025053', 'Shweta Nitin', 'Patil', '2004-06-26', '+91-98220-10053', 'Campus Hostel, Tech Campus', 2025, 2),
(54, 57, 'CS2025054', 'Chetan Bhavrao', 'Patole', '2004-07-27', '+91-98220-10054', 'Campus Hostel, Tech Campus', 2025, 2),
(55, 58, 'CS2025055', 'Harshada Pravin', 'Pawar', '2004-08-28', '+91-98220-10055', 'Campus Hostel, Tech Campus', 2025, 2),
(56, 59, 'CS2025056', 'Mandar Krushnarao', 'Pawar', '2004-09-01', '+91-98220-10056', 'Campus Hostel, Tech Campus', 2025, 2),
(57, 60, 'CS2025057', 'Pratiksha Janardan', 'Phapale', '2004-10-02', '+91-98220-10057', 'Campus Hostel, Tech Campus', 2025, 2),
(58, 61, 'CS2025058', 'Sakshi Anil', 'Pimpale', '2004-11-03', '+91-98220-10058', 'Campus Hostel, Tech Campus', 2025, 2),
(59, 62, 'CS2025059', 'Raj Bhagwan', 'Sankpal', '2004-12-04', '+91-98220-10059', 'Campus Hostel, Tech Campus', 2025, 2),
(60, 63, 'CS2025060', 'Sarthak Rajkumar', 'Sarnaik', '2004-01-05', '+91-98220-10060', 'Campus Hostel, Tech Campus', 2025, 2),
(61, 64, 'CS2025061', 'Anam Anis', 'Shaikh', '2004-02-06', '+91-98220-10061', 'Campus Hostel, Tech Campus', 2025, 2),
(62, 65, 'CS2025062', 'Suyash Parag', 'Shardul', '2004-03-07', '+91-98220-10062', 'Campus Hostel, Tech Campus', 2025, 2),
(63, 66, 'CS2025063', 'Yogendra Vishal', 'Sharma', '2004-04-08', '+91-98220-10063', 'Campus Hostel, Tech Campus', 2025, 2),
(64, 67, 'CS2025064', 'Sneha Amol', 'Shelar', '2004-05-09', '+91-98220-10064', 'Campus Hostel, Tech Campus', 2025, 2),
(65, 68, 'CS2025065', 'Aditi Bhaskar', 'Shinde', '2004-06-10', '+91-98220-10065', 'Campus Hostel, Tech Campus', 2025, 2),
(66, 69, 'CS2025066', 'Aditya Raosaheb', 'Shinde', '2004-07-11', '+91-98220-10066', 'Campus Hostel, Tech Campus', 2025, 3),
(67, 70, 'CS2025067', 'Vedant Vijay', 'Shinde', '2004-08-12', '+91-98220-10067', 'Campus Hostel, Tech Campus', 2025, 3),
(68, 71, 'CS2025068', 'Mansi Manish', 'Suryawanshi', '2004-09-13', '+91-98220-10068', 'Campus Hostel, Tech Campus', 2025, 3),
(69, 72, 'CS2025069', 'Ayush Pramod', 'Tandale', '2004-10-14', '+91-98220-10069', 'Campus Hostel, Tech Campus', 2025, 3),
(70, 73, 'CS2025070', 'Pranali Abhay', 'Tathe', '2004-11-15', '+91-98220-10070', 'Campus Hostel, Tech Campus', 2025, 3),
(71, 74, 'CS2025071', 'Sahil Nitin', 'Thorat', '2004-12-16', '+91-98220-10071', 'Campus Hostel, Tech Campus', 2025, 3),
(72, 75, 'CS2025072', 'Samruddhi Pravin', 'Thorat', '2004-01-17', '+91-98220-10072', 'Campus Hostel, Tech Campus', 2025, 3),
(73, 76, 'CS2025073', 'Parth Vijay', 'Tidke', '2004-02-18', '+91-98220-10073', 'Campus Hostel, Tech Campus', 2025, 3),
(74, 77, 'CS2025074', 'Piyush Dipak', 'Wani', '2004-03-19', '+91-98220-10074', 'Campus Hostel, Tech Campus', 2025, 3),
(75, 78, 'CS2025075', 'Sangram Prashant', 'Patil', '2004-04-20', '+91-98220-10075', 'Campus Hostel, Tech Campus', 2025, 3);

-- -----------------------------------------------------------------------------
-- 5. COURSES
-- -----------------------------------------------------------------------------
INSERT INTO `courses` (`course_id`, `course_code`, `course_name`, `credits`, `semester`, `department_id`, `faculty_id`) VALUES
(1, 'CS101', 'Database Management Systems', 4, 4, 1, 1),
(2, 'CS102', 'Data Structures & Algorithms', 4, 3, 1, 1),
(3, 'EC201', 'Digital Signal Processing', 3, 4, 2, 2),
(4, 'EC202', 'Microprocessors & Microcontrollers', 4, 5, 2, 2),
(5, 'ME301', 'Applied Thermodynamics', 3, 3, 3, NULL);

-- -----------------------------------------------------------------------------
-- 6. ENROLLMENTS
-- -----------------------------------------------------------------------------
INSERT INTO `enrollments` (`enrollment_id`, `student_id`, `course_id`, `semester`, `academic_year`, `status`) VALUES
(1, 1, 1, 4, '2025-2026', 'enrolled'),
(2, 1, 2, 3, '2025-2026', 'completed'),
(3, 2, 1, 4, '2025-2026', 'enrolled'),
(4, 2, 2, 3, '2025-2026', 'completed'),
(5, 3, 1, 4, '2025-2026', 'enrolled'),
(6, 4, 1, 4, '2025-2026', 'enrolled'),
(7, 5, 1, 4, '2025-2026', 'enrolled'),
(8, 6, 1, 4, '2025-2026', 'enrolled'),
(9, 7, 1, 4, '2025-2026', 'enrolled'),
(10, 8, 1, 4, '2025-2026', 'enrolled'),
(11, 9, 1, 4, '2025-2026', 'enrolled'),
(12, 10, 1, 4, '2025-2026', 'enrolled'),
(13, 11, 1, 4, '2025-2026', 'enrolled'),
(14, 12, 1, 4, '2025-2026', 'enrolled'),
(15, 13, 1, 4, '2025-2026', 'enrolled'),
(16, 14, 1, 4, '2025-2026', 'enrolled'),
(17, 15, 1, 4, '2025-2026', 'enrolled'),
(18, 16, 1, 4, '2025-2026', 'enrolled'),
(19, 17, 1, 4, '2025-2026', 'enrolled'),
(20, 18, 1, 4, '2025-2026', 'enrolled'),
(21, 19, 1, 4, '2025-2026', 'enrolled'),
(22, 20, 1, 4, '2025-2026', 'enrolled'),
(23, 21, 1, 4, '2025-2026', 'enrolled'),
(24, 22, 1, 4, '2025-2026', 'enrolled'),
(25, 23, 1, 4, '2025-2026', 'enrolled'),
(26, 24, 1, 4, '2025-2026', 'enrolled'),
(27, 25, 1, 4, '2025-2026', 'enrolled'),
(28, 26, 1, 4, '2025-2026', 'enrolled'),
(29, 27, 1, 4, '2025-2026', 'enrolled'),
(30, 28, 1, 4, '2025-2026', 'enrolled'),
(31, 29, 1, 4, '2025-2026', 'enrolled'),
(32, 30, 1, 4, '2025-2026', 'enrolled'),
(33, 31, 1, 4, '2025-2026', 'enrolled'),
(34, 32, 1, 4, '2025-2026', 'enrolled'),
(35, 33, 1, 4, '2025-2026', 'enrolled'),
(36, 34, 1, 4, '2025-2026', 'enrolled'),
(37, 35, 1, 4, '2025-2026', 'enrolled'),
(38, 36, 1, 4, '2025-2026', 'enrolled'),
(39, 37, 1, 4, '2025-2026', 'enrolled'),
(40, 38, 1, 4, '2025-2026', 'enrolled'),
(41, 39, 1, 4, '2025-2026', 'enrolled'),
(42, 40, 1, 4, '2025-2026', 'enrolled'),
(43, 41, 1, 4, '2025-2026', 'enrolled'),
(44, 42, 1, 4, '2025-2026', 'enrolled'),
(45, 43, 1, 4, '2025-2026', 'enrolled'),
(46, 44, 1, 4, '2025-2026', 'enrolled'),
(47, 45, 1, 4, '2025-2026', 'enrolled'),
(48, 46, 1, 4, '2025-2026', 'enrolled'),
(49, 47, 1, 4, '2025-2026', 'enrolled'),
(50, 48, 1, 4, '2025-2026', 'enrolled'),
(51, 49, 1, 4, '2025-2026', 'enrolled'),
(52, 50, 1, 4, '2025-2026', 'enrolled'),
(53, 51, 3, 4, '2025-2026', 'enrolled'),
(54, 52, 3, 4, '2025-2026', 'enrolled'),
(55, 53, 3, 4, '2025-2026', 'enrolled'),
(56, 54, 3, 4, '2025-2026', 'enrolled'),
(57, 55, 3, 4, '2025-2026', 'enrolled'),
(58, 56, 3, 4, '2025-2026', 'enrolled'),
(59, 57, 3, 4, '2025-2026', 'enrolled'),
(60, 58, 3, 4, '2025-2026', 'enrolled'),
(61, 59, 3, 4, '2025-2026', 'enrolled'),
(62, 60, 3, 4, '2025-2026', 'enrolled'),
(63, 61, 3, 4, '2025-2026', 'enrolled'),
(64, 62, 3, 4, '2025-2026', 'enrolled'),
(65, 63, 3, 4, '2025-2026', 'enrolled'),
(66, 64, 3, 4, '2025-2026', 'enrolled'),
(67, 65, 3, 4, '2025-2026', 'enrolled');

-- -----------------------------------------------------------------------------
-- 7. ATTENDANCE RECORDS
-- Course CS101 (Enrollments 1 and 3)
-- -----------------------------------------------------------------------------
INSERT INTO `attendance` (`enrollment_id`, `attendance_date`, `status`, `marked_by`, `remarks`) VALUES
(1, '2026-02-02', 'Present', 2, 'Attended relational algebra lecture'),
(1, '2026-02-04', 'Present', 2, 'Participated in SQL lab session'),
(1, '2026-02-06', 'Late',    2, 'Arrived 10 minutes late due to transit'),
(1, '2026-02-09', 'Present', 2, 'Normal session'),
(1, '2026-02-11', 'Absent',  2, 'Medical leave notified'),
(3, '2026-02-02', 'Present', 2, 'Attended relational algebra lecture'),
(3, '2026-02-04', 'Late',    2, 'Late entry'),
(3, '2026-02-06', 'Present', 2, 'Normal session'),
(3, '2026-02-09', 'Absent',  2, 'Unexcused absence'),
(3, '2026-02-11', 'Present', 2, 'Active in lab assignment');

-- Course EC201 (Enrollment 5)
INSERT INTO `attendance` (`enrollment_id`, `attendance_date`, `status`, `marked_by`, `remarks`) VALUES
(5, '2026-02-03', 'Present', 3, 'FFT algorithms lecture'),
(5, '2026-02-05', 'Present', 3, 'DSP hardware lab'),
(5, '2026-02-10', 'Present', 3, 'Filter design discussion');

-- -----------------------------------------------------------------------------
-- 8. EXAMS
-- -----------------------------------------------------------------------------
INSERT INTO `exams` (`exam_id`, `course_id`, `exam_name`, `exam_type`, `exam_date`, `max_marks`, `created_by`) VALUES
(1, 1, 'Midterm Examination', 'Midterm', '2026-03-10', 50.00, 2),
(2, 1, 'Final Comprehensive Exam', 'Final', '2026-05-20', 100.00, 2),
(3, 3, 'Midterm Examination', 'Midterm', '2026-03-12', 50.00, 3);

-- -----------------------------------------------------------------------------
-- 9. RESULTS
-- Grading scale: >=90 O (10), 80-89 A+ (9), 70-79 A (8), 60-69 B+ (7), 50-59 B (6), 40-49 C (5), <40 F (0)
-- -----------------------------------------------------------------------------
INSERT INTO `results` (`result_id`, `exam_id`, `enrollment_id`, `marks_obtained`, `grade`, `entered_by`) VALUES
(1, 1, 1, 46.50, 'O',  2),  -- Alice in CS101 Midterm: 46.5/50 = 93% -> O
(2, 1, 3, 38.00, 'A',  2),  -- Bob in CS101 Midterm: 38/50 = 76% -> A
(3, 3, 5, 42.00, 'A+', 3);  -- Charlie in EC201 Midterm: 42/50 = 84% -> A+

-- -----------------------------------------------------------------------------
-- 10. AUDIT LOGS
-- -----------------------------------------------------------------------------
INSERT INTO `audit_logs` (`actor_user_id`, `action`, `entity_type`, `entity_id`, `metadata`, `ip_address`) VALUES
(1, 'SYSTEM_INITIALIZED', 'SYSTEM', '1', '{"version": "1.0.0", "environment": "production-seed"}', '127.0.0.1'),
(1, 'USER_CREATED', 'users', '1', '{"email": "admin@campus.edu", "role": "administrator"}', '127.0.0.1'),
(1, 'FACULTY_CREATED', 'faculty', '1', '{"employee_code": "FAC-CSE-001"}', '127.0.0.1'),
(1, 'FACULTY_CREATED', 'faculty', '2', '{"employee_code": "FAC-ECE-002"}', '127.0.0.1'),
(1, 'STUDENT_CREATED', 'students', '1', '{"roll_number": "CS2025001"}', '127.0.0.1'),
(2, 'ATTENDANCE_BULK_MARKED', 'attendance', 'CS101', '{"course_id": 1, "date": "2026-02-02", "count": 2}', '127.0.0.1'),
(2, 'RESULT_ENTERED', 'results', '1', '{"exam_id": 1, "enrollment_id": 1, "marks": 46.5}', '127.0.0.1');

-- -----------------------------------------------------------------------------
-- 11. COURSE PREREQUISITES
-- -----------------------------------------------------------------------------
INSERT INTO `course_prerequisites` (`id`, `course_id`, `prerequisite_course_id`) VALUES
(1, 1, 2), -- CS101 (DBMS) requires CS102 (DSA)
(2, 4, 3); -- EC202 (Microprocessors) requires EC201 (DSP)

-- -----------------------------------------------------------------------------
-- 12. TIMETABLE SLOTS
-- -----------------------------------------------------------------------------
INSERT INTO `timetable_slots` (`slot_id`, `course_id`, `day_of_week`, `start_time`, `end_time`, `room_number`, `semester`, `academic_year`) VALUES
(1, 1, 'Monday', '09:00:00', '10:00:00', 'Room 101', 4, '2025-2026'),
(2, 1, 'Wednesday', '10:00:00', '11:00:00', 'Room 101', 4, '2025-2026'),
(3, 2, 'Tuesday', '11:00:00', '12:00:00', 'Lab 2', 3, '2025-2026'),
(4, 3, 'Monday', '10:00:00', '11:00:00', 'Room 202', 4, '2025-2026');

-- -----------------------------------------------------------------------------
-- 13. LEAVE REQUESTS
-- -----------------------------------------------------------------------------
INSERT INTO `leave_requests` (`leave_id`, `enrollment_id`, `leave_date`, `reason`, `status`, `reviewed_by`, `review_remarks`) VALUES
(1, 1, '2026-03-01', 'Medical appointment with specialist physician', 'Approved', 2, 'Approved. Excuse granted for medical reasons.'),
(2, 3, '2026-03-05', 'Attending sister marriage ceremony', 'Pending', NULL, NULL);

-- -----------------------------------------------------------------------------
-- 14. NOTIFICATIONS
-- -----------------------------------------------------------------------------
INSERT INTO `notifications` (`notification_id`, `user_id`, `title`, `message`, `type`, `is_read`) VALUES
(1, 4, 'Welcome to Semester 4', 'Your semester course enrollments and academic schedule are confirmed.', 'SYSTEM_ANNOUNCEMENT', 1),
(2, 5, 'Attendance Shortage Warning', 'Your attendance in CS101 is below 75%. Please meet your faculty advisor.', 'ATTENDANCE_ALERT', 0),
(3, 4, 'Leave Request Approved', 'Your leave request for 2026-03-01 in CS101 has been approved as Excused.', 'LEAVE_UPDATE', 0);

-- -----------------------------------------------------------------------------
-- 15. FEE STRUCTURES
-- -----------------------------------------------------------------------------
INSERT INTO `fee_structures` (`structure_id`, `department_id`, `semester`, `academic_year`, `tuition_fee`, `development_fee`, `laboratory_fee`, `library_fee`, `other_charges`, `due_date`) VALUES
(1, 1, 4, '2025-2026', 45000.00, 10000.00, 8000.00, 2000.00, 1500.00, '2026-04-15'),
(2, 2, 4, '2025-2026', 42000.00, 9500.00, 7500.00, 2000.00, 1500.00, '2026-04-15');

-- -----------------------------------------------------------------------------
-- 16. STUDENT INVOICES
-- -----------------------------------------------------------------------------
INSERT INTO `student_invoices` (`invoice_id`, `invoice_number`, `student_id`, `structure_id`, `total_due`, `scholarship_discount`, `net_payable`, `amount_paid`, `status`) VALUES
(1, 'INV-2026-CSE-001', 1, 1, 66500.00, 10000.00, 56500.00, 56500.00, 'Paid'),
(2, 'INV-2026-CSE-002', 2, 1, 66500.00, 0.00, 66500.00, 30000.00, 'Partially_Paid'),
(3, 'INV-2026-CSE-003', 3, 1, 66500.00, 0.00, 66500.00, 0.00, 'Pending');

-- -----------------------------------------------------------------------------
-- 17. FEE PAYMENTS
-- -----------------------------------------------------------------------------
INSERT INTO `fee_payments` (`payment_id`, `invoice_id`, `receipt_number`, `amount_paid`, `payment_mode`, `transaction_reference`, `recorded_by_user_id`, `remarks`) VALUES
(1, 1, 'REC-2026-0001', 56500.00, 'UPI', 'TXN_UPI_9837264101', 1, 'Full semester fee paid via UPI'),
(2, 2, 'REC-2026-0002', 30000.00, 'Net_Banking', 'TXN_NB_8829104822', 1, 'First installment paid online');


