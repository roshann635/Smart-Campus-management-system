import { FeeService } from '../services/feeService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class FeeController {
  /**
   * POST /api/fees/structures
   * Admin defines a semester/department fee schedule.
   */
  static async createFeeStructure(req, res, next) {
    try {
      const structure = await FeeService.createFeeStructure(
        req.body,
        req.user.user_id,
        req.ip
      );
      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'Fee structure created successfully.',
        data: structure,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/fees/structures
   * Lists all fee structures.
   */
  static async getFeeStructures(req, res, next) {
    try {
      const structures = await FeeService.getFeeStructures(req.query);
      return ApiResponse.success(res, { data: structures });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/fees/invoices/generate-batch
   * Admin executes idempotent invoice generation with scholarship rules.
   */
  static async generateBatchInvoices(req, res, next) {
    try {
      const { structure_id, scholarship_rules = [] } = req.body;
      if (!structure_id) {
        return ApiResponse.error(res, {
          statusCode: 400,
          message: 'structure_id is required for batch invoice generation.',
        });
      }

      const result = await FeeService.generateBatchInvoices(
        { structure_id: Number(structure_id), scholarship_rules },
        req.user.user_id,
        req.ip
      );

      return ApiResponse.success(res, {
        statusCode: 201,
        message: `Batch generation complete. ${result.generatedCount} invoices created, ${result.skippedCount} skipped.`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/fees/invoices
   * Scoped to student or open to Admin/Faculty, includes collection KPIs.
   */
  static async getInvoices(req, res, next) {
    try {
      const { department_id, semester, status, search } = req.query;
      const result = await FeeService.getInvoices({
        userRole: req.user.role,
        studentId: req.user.student_id,
        departmentId: department_id,
        semester,
        status,
        search,
      });
      return ApiResponse.success(res, { data: result });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/fees/invoices/:invoiceId/pay
   * Records a full or installment payment with row lock & overpayment guard.
   */
  static async recordPayment(req, res, next) {
    try {
      const invoiceId = Number(req.params.invoiceId);
      const { amount, payment_mode, transaction_reference, remarks } = req.body;

      if (!invoiceId || isNaN(invoiceId)) {
        return ApiResponse.error(res, { statusCode: 400, message: 'Valid invoiceId is required.' });
      }

      const payment = await FeeService.recordPayment({
        invoiceId,
        amount,
        paymentMode: payment_mode,
        transactionReference: transaction_reference,
        recordedByUserId: req.user.user_id,
        userRole: req.user.role,
        studentId: req.user.student_id,
        remarks,
        ipAddress: req.ip,
      });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: `Payment of ₹${payment.amount_paid} recorded successfully. Status: ${payment.invoice_status}.`,
        data: payment,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/fees/payments/:paymentId/receipt
   * Official printable receipt with SHA-256 seal and cross-student protection.
   */
  static async getPaymentReceipt(req, res, next) {
    try {
      const paymentId = Number(req.params.paymentId);
      if (!paymentId || isNaN(paymentId)) {
        return ApiResponse.error(res, { statusCode: 400, message: 'Valid paymentId is required.' });
      }

      const receipt = await FeeService.getPaymentReceipt(
        paymentId,
        req.user.role,
        req.user.student_id
      );

      return ApiResponse.success(res, {
        statusCode: 200,
        data: receipt,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/fees/metrics
   * Department fee collection summary.
   */
  static async getMetrics(req, res, next) {
    try {
      const metrics = await FeeService.getFeeCollectionMetrics();
      return ApiResponse.success(res, { data: metrics });
    } catch (err) {
      next(err);
    }
  }
}

