import { query } from '../config/db.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { StudentService } from '../services/studentService.js';

export class DashboardController {
  static async getSummary(req, res, next) {
    try {
      const user = req.user;

      if (user.role === 'administrator') {
        const [counts] = await query(`
          SELECT 
            (SELECT COUNT(*) FROM students s JOIN users u ON s.user_id = u.user_id WHERE u.status = 'active') AS total_students,
            (SELECT COUNT(*) FROM faculty f JOIN users u ON f.user_id = u.user_id WHERE u.status = 'active') AS total_faculty,
            (SELECT COUNT(*) FROM courses) AS total_courses,
            (SELECT COUNT(*) FROM departments) AS total_departments
        `);

        const [deptDist] = await query(`
          SELECT d.code, d.name, COUNT(s.student_id) AS student_count
          FROM departments d
          LEFT JOIN students s ON d.department_id = s.department_id
          GROUP BY d.department_id, d.code, d.name
        `);

        const [recentLogs] = await query(`
          SELECT al.log_id, al.action, al.entity_type, al.created_at, u.email AS actor_email
          FROM audit_logs al
          LEFT JOIN users u ON al.actor_user_id = u.user_id
          ORDER BY al.created_at DESC
          LIMIT 6
        `);

        const [attRate] = await query(`
          SELECT 
            ROUND(SUM(CASE WHEN status IN ('Present', 'Late') THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) AS overall_attendance_rate
          FROM attendance
        `);

        const c0 = (counts && counts[0]) ? counts[0] : {};
        const a0 = (attRate && attRate[0]) ? attRate[0] : {};

        return ApiResponse.success(res, {
          data: {
            role: 'administrator',
            stats: {
              totalStudents: c0.total_students ?? 0,
              totalFaculty: c0.total_faculty ?? 0,
              totalCourses: c0.total_courses ?? 0,
              totalDepartments: c0.total_departments ?? 0,
              overallAttendanceRate: a0.overall_attendance_rate ?? 0,
            },
            departmentDistribution: Array.isArray(deptDist) ? deptDist : [],
            recentLogs: Array.isArray(recentLogs) ? recentLogs : [],
          },
        });
      }

      if (user.role === 'faculty') {
        const facultyId = user.faculty_id;
        const [courses] = await query(`
          SELECT 
            c.course_id,
            c.course_code,
            c.course_name,
            c.credits,
            c.semester,
            COUNT(DISTINCT e.enrollment_id) AS enrolled_students
          FROM courses c
          LEFT JOIN enrollments e ON c.course_id = e.course_id AND e.status = 'enrolled'
          WHERE c.faculty_id = ?
          GROUP BY c.course_id, c.course_code, c.course_name, c.credits, c.semester
        `, [facultyId]);

        const [exams] = await query(`
          SELECT ex.exam_id, ex.exam_name, ex.exam_type, ex.exam_date, ex.max_marks, c.course_code
          FROM exams ex
          JOIN courses c ON ex.course_id = c.course_id
          WHERE c.faculty_id = ?
          ORDER BY ex.exam_date DESC
          LIMIT 5
        `, [facultyId]);

        const courseList = Array.isArray(courses) ? courses : [];
        const examList = Array.isArray(exams) ? exams : [];
        const totalEnrolled = courseList.reduce((acc, c) => acc + Number(c.enrolled_students || 0), 0);

        return ApiResponse.success(res, {
          data: {
            role: 'faculty',
            stats: {
              assignedCoursesCount: courseList.length,
              totalEnrolledStudents: totalEnrolled,
              examsScheduled: examList.length,
            },
            assignedCourses: courseList,
            recentExams: examList,
          },
        });
      }

      if (user.role === 'student') {
        const studentId = user.student_id;
        const dossier = await StudentService.getAcademicDossier(studentId);

        let totalClasses = 0;
        let attendedClasses = 0;
        if (Array.isArray(dossier.attendance)) {
          dossier.attendance.forEach((att) => {
            totalClasses += Number(att.total_classes || 0);
            attendedClasses += Number(att.classes_attended || 0);
          });
        }

        const overallAttendancePercent = totalClasses > 0
          ? Math.round((attendedClasses / totalClasses) * 10000) / 100
          : 0;

        return ApiResponse.success(res, {
          data: {
            role: 'student',
            stats: {
              enrolledCoursesCount: (dossier.enrollments || []).filter(e => e.status === 'enrolled').length,
              overallAttendancePercent,
              cumulativeGpa: dossier.metrics?.gpa || 0,
              totalCredits: dossier.metrics?.totalCreditsCompleted || 0,
            },
            attendanceSummary: dossier.attendance || [],
            recentResults: (dossier.results || []).slice(0, 5),
            enrollments: dossier.enrollments || [],
          },
        });
      }

      return ApiResponse.error(res, { statusCode: 400, message: 'Invalid role for summary' });
    } catch (err) {
      next(err);
    }
  }
}
