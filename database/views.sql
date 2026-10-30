-- =============================================================================
-- SMART CAMPUS MANAGEMENT SYSTEM - DATABASE VIEWS
-- Relational Aggregations for Academic Analytics & Institutional Reporting
-- =============================================================================

DROP VIEW IF EXISTS `vw_department_fee_collection`;
DROP VIEW IF EXISTS `vw_student_cgpa_transcript`;
DROP VIEW IF EXISTS `vw_at_risk_students`;
DROP VIEW IF EXISTS `vw_student_attendance_summary`;
DROP VIEW IF EXISTS `vw_course_performance_summary`;
DROP VIEW IF EXISTS `vw_department_metrics`;

-- -----------------------------------------------------------------------------
-- 1. STUDENT ATTENDANCE SUMMARY VIEW
-- Provides per-course attendance performance for each enrolled student
-- Formula: ((Present + Late + Excused) / Total Classes) * 100
-- -----------------------------------------------------------------------------
CREATE VIEW `vw_student_attendance_summary` AS
SELECT 
    s.student_id,
    s.roll_number,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    c.course_id,
    c.course_code,
    c.course_name,
    e.enrollment_id,
    e.semester,
    e.academic_year,
    COUNT(a.attendance_id) AS total_classes,
    SUM(CASE WHEN a.status IN ('Present', 'Late', 'Excused') THEN 1 ELSE 0 END) AS classes_attended,
    CASE 
        WHEN COUNT(a.attendance_id) = 0 THEN 0.00
        ELSE ROUND((SUM(CASE WHEN a.status IN ('Present', 'Late', 'Excused') THEN 1 ELSE 0 END) / COUNT(a.attendance_id)) * 100, 2)
    END AS attendance_percentage
FROM enrollments e
JOIN students s ON e.student_id = s.student_id
JOIN courses c ON e.course_id = c.course_id
LEFT JOIN attendance a ON e.enrollment_id = a.enrollment_id
GROUP BY 
    s.student_id,
    s.roll_number,
    s.first_name,
    s.last_name,
    c.course_id,
    c.course_code,
    c.course_name,
    e.enrollment_id,
    e.semester,
    e.academic_year;

-- -----------------------------------------------------------------------------
-- 2. COURSE PERFORMANCE SUMMARY VIEW
-- Aggregates exam-level grading distribution, pass counts, and statistical metrics
-- Passing criteria: marks_obtained >= 40% of max_marks (Grade != 'F')
-- -----------------------------------------------------------------------------
CREATE VIEW `vw_course_performance_summary` AS
SELECT 
    c.course_id,
    c.course_code,
    c.course_name,
    ex.exam_id,
    ex.exam_name,
    ex.exam_type,
    ex.exam_date,
    ex.max_marks,
    COUNT(r.result_id) AS total_students_graded,
    COALESCE(ROUND(AVG(r.marks_obtained), 2), 0.00) AS average_marks,
    COALESCE(MAX(r.marks_obtained), 0.00) AS highest_marks,
    COALESCE(MIN(r.marks_obtained), 0.00) AS lowest_marks,
    SUM(CASE WHEN r.grade <> 'F' AND r.marks_obtained >= (ex.max_marks * 0.40) THEN 1 ELSE 0 END) AS pass_count,
    CASE 
        WHEN COUNT(r.result_id) = 0 THEN 0.00
        ELSE ROUND((SUM(CASE WHEN r.grade <> 'F' AND r.marks_obtained >= (ex.max_marks * 0.40) THEN 1 ELSE 0 END) / COUNT(r.result_id)) * 100, 2)
    END AS pass_percentage
FROM exams ex
JOIN courses c ON ex.course_id = c.course_id
LEFT JOIN results r ON ex.exam_id = r.exam_id
GROUP BY 
    c.course_id,
    c.course_code,
    c.course_name,
    ex.exam_id,
    ex.exam_name,
    ex.exam_type,
    ex.exam_date,
    ex.max_marks;

-- -----------------------------------------------------------------------------
-- 3. DEPARTMENT METRICS VIEW
-- High-level institutional KPI view with LEFT JOINs to account for zero records
-- -----------------------------------------------------------------------------
CREATE VIEW `vw_department_metrics` AS
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
GROUP BY 
    d.department_id,
    d.code,
    d.name;

-- -----------------------------------------------------------------------------
-- 4. AT-RISK STUDENTS ANALYTICAL VIEW
-- Flags students with attendance < 75.00% or average exam score < 40.00%
-- -----------------------------------------------------------------------------
CREATE VIEW `vw_at_risk_students` AS
SELECT 
    s.student_id,
    s.roll_number,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    u.email,
    d.name AS department_name,
    c.course_id,
    c.course_code,
    c.course_name,
    c.faculty_id,
    e.enrollment_id,
    COALESCE(ROUND((SUM(CASE WHEN a.status IN ('Present', 'Late', 'Excused') THEN 1 ELSE 0 END) / NULLIF(COUNT(a.attendance_id), 0)) * 100, 2), 0.00) AS attendance_percentage,
    COALESCE(ROUND(AVG((r.marks_obtained / ex.max_marks) * 100), 2), 0.00) AS average_exam_percentage,
    CASE 
        WHEN COALESCE(ROUND((SUM(CASE WHEN a.status IN ('Present', 'Late', 'Excused') THEN 1 ELSE 0 END) / NULLIF(COUNT(a.attendance_id), 0)) * 100, 2), 0.00) < 75.00 
             AND COALESCE(ROUND(AVG((r.marks_obtained / ex.max_marks) * 100), 2), 0.00) < 40.00 THEN 'CRITICAL_BOTH'
        WHEN COALESCE(ROUND((SUM(CASE WHEN a.status IN ('Present', 'Late', 'Excused') THEN 1 ELSE 0 END) / NULLIF(COUNT(a.attendance_id), 0)) * 100, 2), 0.00) < 75.00 THEN 'LOW_ATTENDANCE'
        WHEN COALESCE(ROUND(AVG((r.marks_obtained / ex.max_marks) * 100), 2), 0.00) < 40.00 THEN 'ACADEMIC_PROBATION'
        ELSE 'NORMAL'
    END AS risk_category
FROM enrollments e
JOIN students s ON e.student_id = s.student_id
JOIN users u ON s.user_id = u.user_id
JOIN departments d ON s.department_id = d.department_id
JOIN courses c ON e.course_id = c.course_id
LEFT JOIN attendance a ON e.enrollment_id = a.enrollment_id
LEFT JOIN results r ON e.enrollment_id = r.enrollment_id
LEFT JOIN exams ex ON r.exam_id = ex.exam_id
WHERE e.status = 'enrolled'
GROUP BY 
    s.student_id, 
    s.roll_number, 
    s.first_name, 
    s.last_name, 
    u.email, 
    d.name, 
    c.course_id, 
    c.course_code, 
    c.course_name, 
    c.faculty_id, 
    e.enrollment_id
HAVING risk_category <> 'NORMAL';

-- -----------------------------------------------------------------------------
-- 5. STUDENT CGPA & TRANSCRIPT VIEW
-- Calculates credit-weighted grade points (SGPA and CGPA) per student
-- -----------------------------------------------------------------------------
CREATE VIEW `vw_student_cgpa_transcript` AS
SELECT 
    s.student_id,
    s.roll_number,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    e.semester,
    e.academic_year,
    SUM(c.credits) AS total_registered_credits,
    SUM(CASE WHEN r.grade <> 'F' THEN c.credits ELSE 0 END) AS total_earned_credits,
    ROUND(SUM(c.credits * (
        CASE r.grade 
            WHEN 'O' THEN 10.0
            WHEN 'A+' THEN 9.0
            WHEN 'A' THEN 8.0
            WHEN 'B+' THEN 7.0
            WHEN 'B' THEN 6.0
            WHEN 'C' THEN 5.0
            WHEN 'P' THEN 4.0
            WHEN 'D' THEN 4.0
            ELSE 0.0
        END
    )) / NULLIF(SUM(c.credits), 0), 2) AS sgpa
FROM enrollments e
JOIN students s ON e.student_id = s.student_id
JOIN courses c ON e.course_id = c.course_id
LEFT JOIN results r ON e.enrollment_id = r.enrollment_id
GROUP BY 
    s.student_id,
    s.roll_number,
    s.first_name,
    s.last_name,
    e.semester,
    e.academic_year;

-- -----------------------------------------------------------------------------
-- 6. DEPARTMENT FEE COLLECTION VIEW
-- Aggregates financial billing, collections, and dues across departments and terms
-- -----------------------------------------------------------------------------
CREATE VIEW `vw_department_fee_collection` AS
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
GROUP BY 
    d.department_id,
    d.name,
    fs.academic_year,
    fs.semester;


