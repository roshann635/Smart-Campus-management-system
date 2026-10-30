import { Router } from 'express';
import { ReportController } from '../controllers/reportController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();

router.use(requireAuth);

router.get('/attendance', requireRoles('administrator', 'faculty'), ReportController.getAttendance);
router.get('/performance', requireRoles('administrator', 'faculty'), ReportController.getPerformance);
router.get('/departments', requireRoles('administrator', 'faculty'), ReportController.getDepartments);
router.get('/at-risk', requireRoles('administrator', 'faculty'), ReportController.getAtRisk);
router.post('/at-risk/notify', requireRoles('administrator', 'faculty'), ReportController.notifyAtRisk);

// Administrative export restricted to administrator
router.get('/export/:reportType', requireRoles('administrator'), ReportController.exportCSV);

export default router;

