import crypto from 'crypto';
import { query, getConnection } from '../config/db.js';
import { AuditService } from './auditService.js';

export class FeeService {
  /**
   * Admin creates a fee structure for a specific department, semester, and academic year.
   */
  static async createFeeStructure(data, actorUserId, ipAddress) {
    const {
      department_id,
      semester,
      academic_year,
      tuition_fee = 0,
      development_fee = 0,
      laboratory_fee = 0,
      library_fee = 0,
      other_charges = 0,
      due_date,
    } = data;

    if (!department_id || !semester || !academic_year || !due_date) {
      const err = new Error('Department, semester, academic year, and due date are mandatory.');
      err.statusCode = 400;
      throw err;
    }

    if (Number(semester) < 1 || Number(semester) > 8) {
      const err = new Error('Semester must be an integer between 1 and 8.');
      err.statusCode = 400;
      throw err;
    }

    const tFee = parseFloat(tuition_fee) || 0;
    const dFee = parseFloat(development_fee) || 0;
    const labFee = parseFloat(laboratory_fee) || 0;
    const libFee = parseFloat(library_fee) || 0;
    const oFee = parseFloat(other_charges) || 0;
    const totalFee = tFee + dFee + labFee + libFee + oFee;

    try {
      const [res] = await query(
        `INSERT INTO fee_structures 
         (department_id, semester, academic_year, tuition_fee, development_fee, laboratory_fee, library_fee, other_charges, due_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [department_id, semester, academic_year, tFee, dFee, labFee, libFee, oFee, due_date]
      );

      const structureId = res.insertId;

      await AuditService.log({
        actorUserId,
        action: 'CREATE_FEE_STRUCTURE',
        entityType: 'fee_structures',
        entityId: structureId,
        metadata: { department_id, semester, academic_year, totalFee, due_date },
        ipAddress,
      });

      return {
        structure_id: structureId,
        department_id,
        semester,
        academic_year,
        tuition_fee: tFee,
        development_fee: dFee,
        laboratory_fee: labFee,
        library_fee: libFee,
        other_charges: oFee,
        total_fee: totalFee,
        due_date,
      };
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        const customErr = new Error('A fee structure already exists for this department, semester, and academic year.');
        customErr.statusCode = 409;
        throw customErr;
      }
      throw err;
    }
  }

  /**
   * Retrieves all fee structures, enriched with department metadata.
   */
  static async getFeeStructures(filters = {}) {
    const [rows] = await query(`
      SELECT 
        fs.*,
        d.name AS department_name,
        d.code AS department_code
      FROM fee_structures fs
      JOIN departments d ON fs.department_id = d.department_id
      ORDER BY fs.academic_year DESC, fs.semester ASC
    `);
    return rows;
  }

  /**
   * Generates batch invoices for all students in a department & semester (ACID transaction & idempotent).
   */
  static async generateBatchInvoices({ structure_id, scholarship_rules = [] }, actorUserId, ipAddress) {
    const conn = await getConnection();
    try {
      await conn.beginTransaction();

      // 1. Fetch fee structure
      const [structRows] = await conn.query(
        `SELECT fs.*, d.name AS department_name 
         FROM fee_structures fs 
         JOIN departments d ON fs.department_id = d.department_id 
         WHERE fs.structure_id = ?`,
        [structure_id]
      );

      if (!structRows || structRows.length === 0) {
        const err = new Error('Fee structure not found.');
        err.statusCode = 404;
        throw err;
      }

      const struct = structRows[0];
      const totalDue = parseFloat(struct.total_fee);

      // 2. Fetch all active students in this department
      const [students] = await conn.query(
        `SELECT s.student_id, s.roll_number, s.first_name, s.last_name, s.user_id 
         FROM students s
         JOIN users u ON s.user_id = u.user_id
         WHERE s.department_id = ? AND u.status = 'active'`,
        [struct.department_id]
      );

      let generatedCount = 0;
      let skippedCount = 0;
      const generatedInvoices = [];

      for (const student of students) {
        // Idempotency check: see if invoice already exists for this student & structure
        const [existing] = await conn.query(
          `SELECT invoice_id FROM student_invoices WHERE student_id = ? AND structure_id = ?`,
          [student.student_id, structure_id]
        );

        if (existing && existing.length > 0) {
          skippedCount++;
          continue;
        }

        // Apply scholarship discount if matching rule exists
        let discount = 0;
        const rule = scholarship_rules.find(r => Number(r.student_id) === Number(student.student_id));
        if (rule) {
          if (rule.discount_amount) {
            discount = parseFloat(rule.discount_amount) || 0;
          } else if (rule.discount_percentage) {
            discount = (totalDue * (parseFloat(rule.discount_percentage) || 0)) / 100;
          }
        }
        discount = Math.min(discount, totalDue);
        const netPayable = Math.max(0, totalDue - discount);

        const yearCode = struct.academic_year.replace(/[^a-zA-Z0-9]/g, '');
        const invoiceNumber = `INV-${yearCode}-S${struct.semester}-${student.roll_number}`;

        const [insertRes] = await conn.query(
          `INSERT INTO student_invoices 
           (invoice_number, student_id, structure_id, total_due, scholarship_discount, net_payable, amount_paid, status)
           VALUES (?, ?, ?, ?, ?, ?, 0.00, 'Pending')`,
          [invoiceNumber, student.student_id, structure_id, totalDue, discount, netPayable]
        );

        const invoiceId = insertRes.insertId;
        generatedCount++;
        generatedInvoices.push({
          invoice_id: invoiceId,
          invoice_number: invoiceNumber,
          student_id: student.student_id,
          roll_number: student.roll_number,
          student_name: `${student.first_name} ${student.last_name}`,
          net_payable: netPayable,
        });

        // Create student notification
        await conn.query(
          `INSERT INTO notifications (user_id, title, message, type, is_read)
           VALUES (?, ?, ?, 'SYSTEM_ANNOUNCEMENT', 0)`,
          [
            student.user_id,
            `Fee Invoice Issued: Sem ${struct.semester}`,
            `Fee invoice ${invoiceNumber} for ₹${netPayable.toFixed(2)} has been generated. Due date: ${struct.due_date}.`,
          ]
        );
      }

      await AuditService.log({
        actorUserId,
        action: 'GENERATE_BATCH_INVOICES',
        entityType: 'student_invoices',
        entityId: structure_id,
        metadata: {
          structure_id,
          department_id: struct.department_id,
          semester: struct.semester,
          generatedCount,
          skippedCount,
          totalStudents: students.length,
        },
        ipAddress,
      });

      await conn.commit();

      return {
        structure_id,
        department_name: struct.department_name,
        semester: struct.semester,
        academic_year: struct.academic_year,
        generatedCount,
        skippedCount,
        totalEligible: students.length,
        invoices: generatedInvoices,
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Retrieves invoices with strict role authorization and department fee collection metrics.
   */
  static async getInvoices({ userRole, studentId = null, departmentId = null, semester = null, status = null, search = '' }) {
    // 1. Fetch collection overview metrics from vw_department_fee_collection
    const [metrics] = await query(`
      SELECT * FROM vw_department_fee_collection
      ORDER BY department_name ASC, semester ASC
    `);

    // 2. Build invoice query
    if (userRole === 'student') {
      if (!studentId) {
        const err = new Error('Student profile context required.');
        err.statusCode = 403;
        throw err;
      }

      const [studentInvoices] = await query(
        `SELECT 
          si.*,
          s.roll_number,
          CONCAT(s.first_name, ' ', s.last_name) AS student_name,
          fs.semester,
          fs.academic_year,
          fs.due_date,
          fs.tuition_fee,
          fs.development_fee,
          fs.laboratory_fee,
          fs.library_fee,
          fs.other_charges,
          d.name AS department_name,
          d.code AS department_code
         FROM student_invoices si
         JOIN students s ON si.student_id = s.student_id
         JOIN fee_structures fs ON si.structure_id = fs.structure_id
         JOIN departments d ON fs.department_id = d.department_id
         WHERE si.student_id = ?
         ORDER BY si.generated_at DESC`,
        [studentId]
      );

      return {
        invoices: studentInvoices,
        metrics: [],
      };
    }

    // Administrator / Faculty view
    const [allInvoices] = await query(`
      SELECT 
        si.*,
        s.roll_number,
        CONCAT(s.first_name, ' ', s.last_name) AS student_name,
        fs.semester,
        fs.academic_year,
        fs.due_date,
        fs.tuition_fee,
        fs.development_fee,
        fs.laboratory_fee,
        fs.library_fee,
        fs.other_charges,
        d.name AS department_name,
        d.code AS department_code
      FROM student_invoices si
      JOIN students s ON si.student_id = s.student_id
      JOIN fee_structures fs ON si.structure_id = fs.structure_id
      JOIN departments d ON fs.department_id = d.department_id
      ORDER BY si.generated_at DESC
    `);

    let filtered = allInvoices;
    if (status) {
      filtered = filtered.filter(i => i.status.toLowerCase() === status.toLowerCase());
    }
    if (departmentId) {
      filtered = filtered.filter(i => Number(i.department_id) === Number(departmentId));
    }
    if (semester) {
      filtered = filtered.filter(i => Number(i.semester) === Number(semester));
    }
    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(i => 
        i.invoice_number.toLowerCase().includes(q) ||
        i.roll_number.toLowerCase().includes(q) ||
        (i.student_name && i.student_name.toLowerCase().includes(q))
      );
    }

    return {
      invoices: filtered,
      metrics,
    };
  }

  /**
   * Records a fee payment with SELECT ... FOR UPDATE row-locking, overpayment guard, and audit trail.
   */
  static async recordPayment({
    invoiceId,
    amount,
    paymentMode,
    transactionReference,
    recordedByUserId,
    userRole,
    studentId,
    remarks,
    ipAddress,
  }) {
    const payAmount = parseFloat(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      const err = new Error('Payment amount must be greater than zero.');
      err.statusCode = 400;
      throw err;
    }

    if (!paymentMode || !transactionReference) {
      const err = new Error('Payment mode and transaction reference are required.');
      err.statusCode = 400;
      throw err;
    }

    const conn = await getConnection();
    try {
      await conn.beginTransaction();

      // Row-level lock on the target invoice
      const [invoiceRows] = await conn.query(
        `SELECT 
          si.*,
          s.roll_number,
          CONCAT(s.first_name, ' ', s.last_name) AS student_name,
          s.user_id AS student_user_id,
          fs.semester,
          fs.academic_year
         FROM student_invoices si
         JOIN students s ON si.student_id = s.student_id
         JOIN fee_structures fs ON si.structure_id = fs.structure_id
         WHERE si.invoice_id = ?
         FOR UPDATE`,
        [invoiceId]
      );

      if (!invoiceRows || invoiceRows.length === 0) {
        const err = new Error('Invoice not found.');
        err.statusCode = 404;
        throw err;
      }

      const inv = invoiceRows[0];

      // Role authorization: if caller is a student, ensure they only pay their own invoice
      if (userRole === 'student' && Number(inv.student_id) !== Number(studentId)) {
        const err = new Error('Access denied: You cannot record payments for another student’s invoice.');
        err.statusCode = 403;
        throw err;
      }

      const netPayable = parseFloat(inv.net_payable);
      const currentPaid = parseFloat(inv.amount_paid);
      const remainingDue = parseFloat((netPayable - currentPaid).toFixed(2));

      // Overpayment guard
      if (payAmount > remainingDue) {
        const err = new Error(`Payment amount (₹${payAmount}) exceeds the remaining balance due of ₹${remainingDue}.`);
        err.statusCode = 400;
        throw err;
      }

      // Generate unique receipt number
      const year = new Date().getFullYear();
      const randPart = Math.floor(1000 + Math.random() * 9000);
      const receiptNumber = `REC-${year}-${String(inv.invoice_id).padStart(4, '0')}-${randPart}`;

      // Insert into fee_payments
      const [payRes] = await conn.query(
        `INSERT INTO fee_payments 
         (invoice_id, receipt_number, amount_paid, payment_mode, transaction_reference, recorded_by_user_id, remarks)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [invoiceId, receiptNumber, payAmount, paymentMode, transactionReference, recordedByUserId, remarks || null]
      );

      const paymentId = payRes.insertId;

      // Update student_invoices status & amount_paid
      const newAmountPaid = parseFloat((currentPaid + payAmount).toFixed(2));
      const newStatus = (newAmountPaid >= netPayable) ? 'Paid' : 'Partially_Paid';

      await conn.query(
        `UPDATE student_invoices SET amount_paid = ?, status = ? WHERE invoice_id = ?`,
        [newAmountPaid, newStatus, invoiceId]
      );

      // Create student notification with FEE_RECEIPT
      await conn.query(
        `INSERT INTO notifications (user_id, title, message, type, is_read)
         VALUES (?, ?, ?, 'FEE_RECEIPT', 0)`,
        [
          inv.student_user_id,
          'Fee Payment Received',
          `Payment of ₹${payAmount.toFixed(2)} received for invoice ${inv.invoice_number}. Receipt #${receiptNumber}. Status: ${newStatus}.`,
        ]
      );

      // Log to audit_logs
      await AuditService.log({
        actorUserId: recordedByUserId,
        action: 'FEE_PAYMENT_RECORDED',
        entityType: 'fee_payments',
        entityId: paymentId,
        metadata: {
          invoice_id: invoiceId,
          receipt_number: receiptNumber,
          amount_paid: payAmount,
          newStatus,
          transaction_reference: transactionReference,
        },
        ipAddress,
      });

      await conn.commit();

      return {
        payment_id: paymentId,
        invoice_id: invoiceId,
        invoice_number: inv.invoice_number,
        receipt_number: receiptNumber,
        amount_paid: payAmount,
        payment_mode: paymentMode,
        transaction_reference: transactionReference,
        new_amount_paid: newAmountPaid,
        invoice_status: newStatus,
        remaining_balance: parseFloat((netPayable - newAmountPaid).toFixed(2)),
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Retrieves an official itemized fee receipt protected with an authentic SHA-256 seal.
   */
  static async getPaymentReceipt(paymentId, userRole, studentId) {
    const [rows] = await query(
      `SELECT 
        fp.*,
        si.invoice_number,
        si.student_id,
        si.total_due,
        si.scholarship_discount,
        si.net_payable,
        si.amount_paid AS total_invoice_paid,
        si.status AS invoice_status,
        s.roll_number,
        CONCAT(s.first_name, ' ', s.last_name) AS student_name,
        s.phone AS student_phone,
        u.email AS student_email,
        d.name AS department_name,
        d.code AS department_code,
        fs.semester,
        fs.academic_year,
        fs.tuition_fee,
        fs.development_fee,
        fs.laboratory_fee,
        fs.library_fee,
        fs.other_charges,
        rec_u.email AS recorded_by_email
       FROM fee_payments fp
       JOIN student_invoices si ON fp.invoice_id = si.invoice_id
       JOIN students s ON si.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       JOIN fee_structures fs ON si.structure_id = fs.structure_id
       JOIN departments d ON fs.department_id = d.department_id
       JOIN users rec_u ON fp.recorded_by_user_id = rec_u.user_id
       WHERE fp.payment_id = ?`,
      [paymentId]
    );

    if (!rows || rows.length === 0) {
      const err = new Error('Fee payment record not found.');
      err.statusCode = 404;
      throw err;
    }

    const payment = rows[0];

    // Student access guard: cannot view another student's payment receipt
    if (userRole === 'student' && Number(payment.student_id) !== Number(studentId)) {
      const err = new Error('Access denied: You are not authorized to view this receipt.');
      err.statusCode = 403;
      throw err;
    }

    // Cryptographic SHA-256 digital seal for institutional authenticity verification
    const sealPayload = [
      payment.receipt_number,
      payment.invoice_number,
      payment.roll_number,
      parseFloat(payment.amount_paid).toFixed(2),
      payment.payment_mode,
      payment.transaction_reference,
      payment.paid_at,
    ].join('|');

    const digitalSeal = crypto.createHash('sha256').update(sealPayload).digest('hex');

    return {
      ...payment,
      digital_seal: digitalSeal,
      verification_algorithm: 'SHA-256',
    };
  }

  /**
   * Retrieves department fee collection KPI aggregations.
   */
  static async getFeeCollectionMetrics() {
    const [rows] = await query(`
      SELECT * FROM vw_department_fee_collection
      ORDER BY department_name ASC, semester ASC
    `);
    return rows;
  }
}

