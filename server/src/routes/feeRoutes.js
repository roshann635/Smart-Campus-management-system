import { Router } from 'express';
import { FeeController } from '../controllers/feeController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = Router();

// All fee routes require authenticated sessions
router.use(requireAuth);

// Fee structures
router.get('/structures', FeeController.getFeeStructures);
router.post('/structures', requireRoles('administrator'), FeeController.createFeeStructure);

// Invoices & Generation
router.post('/invoices/generate-batch', requireRoles('administrator'), FeeController.generateBatchInvoices);
router.get('/invoices', FeeController.getInvoices);

// Payments & Receipts
router.post('/invoices/:invoiceId/pay', requireRoles('administrator', 'student'), FeeController.recordPayment);
router.get('/payments/:paymentId/receipt', FeeController.getPaymentReceipt);

// Institutional Metrics
router.get('/metrics', requireRoles('administrator'), FeeController.getMetrics);

export default router;

