import { Router } from 'express';
import authRoutes from './authRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import departmentRoutes from './departmentRoutes.js';
import studentRoutes from './studentRoutes.js';
import facultyRoutes from './facultyRoutes.js';
import courseRoutes from './courseRoutes.js';
import enrollmentRoutes from './enrollmentRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import examRoutes from './examRoutes.js';
import resultRoutes from './resultRoutes.js';
import reportRoutes from './reportRoutes.js';
import auditLogRoutes from './auditLogRoutes.js';
import systemRoutes from './systemRoutes.js';
import timetableRoutes from './timetableRoutes.js';
import leaveRoutes from './leaveRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import feeRoutes from './feeRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/departments', departmentRoutes);
router.use('/students', studentRoutes);
router.use('/faculty', facultyRoutes);
router.use('/courses', courseRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/exams', examRoutes);
router.use('/results', resultRoutes);
router.use('/reports', reportRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/system', systemRoutes);
router.use('/timetable', timetableRoutes);
router.use('/leaves', leaveRoutes);
router.use('/notifications', notificationRoutes);
router.use('/fees', feeRoutes);

export default router;

