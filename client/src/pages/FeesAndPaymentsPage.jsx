import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  CreditCard,
  Receipt,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Printer,
  Search,
  Filter,
  DollarSign,
  Layers,
  ShieldCheck,
  Building2,
  Calendar,
  X,
  RefreshCw,
  Award,
} from 'lucide-react';

export default function FeesAndPaymentsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'administrator';
  const isStudent = user?.role === 'student';

  const [invoices, setInvoices] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [structures, setStructures] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Active view tab for Admin
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'structures' | 'analytics'

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Modals state
  const [isCreateStructureOpen, setIsCreateStructureOpen] = useState(false);
  const [isBatchGenerateOpen, setIsBatchGenerateOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Selected item states
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Form states
  const [structureForm, setStructureForm] = useState({
    department_id: '',
    semester: '1',
    academic_year: '2025-2026',
    tuition_fee: '',
    development_fee: '',
    laboratory_fee: '',
    library_fee: '',
    other_charges: '',
    due_date: '',
  });

  const [batchForm, setBatchForm] = useState({
    structure_id: '',
    scholarship_discount_percentage: '0',
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_mode: 'UPI',
    transaction_reference: '',
    remarks: '',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [invRes, structRes, deptRes] = await Promise.all([
        api.get('/fees/invoices'),
        api.get('/fees/structures'),
        api.get('/departments'),
      ]);

      setInvoices(invRes.data.data?.invoices || []);
      setMetrics(invRes.data.data?.metrics || []);
      setStructures(structRes.data.data || []);
      setDepartments(deptRes.data.data || []);
    } catch (err) {
      console.error('Failed to load financial records:', err);
      setError(err.message || 'Failed to fetch fee data from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStructure = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/fees/structures', structureForm);
      setSuccessMsg('Fee structure defined successfully.');
      setIsCreateStructureOpen(false);
      setStructureForm({
        department_id: '',
        semester: '1',
        academic_year: '2025-2026',
        tuition_fee: '',
        development_fee: '',
        laboratory_fee: '',
        library_fee: '',
        other_charges: '',
        due_date: '',
      });
      fetchInitialData();
    } catch (err) {
      setError(err.message || 'Failed to create fee structure.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBatchGenerate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        structure_id: Number(batchForm.structure_id),
      };
      const res = await api.post('/fees/invoices/generate-batch', payload);
      setSuccessMsg(res.data.message || 'Batch invoices generated successfully.');
      setIsBatchGenerateOpen(false);
      fetchInitialData();
    } catch (err) {
      setError(err.message || 'Failed to generate batch invoices.');
    } finally {
      setSubmitting(false);
    }
  };

  const openPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    const remaining = Number(invoice.net_payable) - Number(invoice.amount_paid);
    setPaymentForm({
      amount: remaining > 0 ? remaining.toString() : '0',
      payment_mode: 'UPI',
      transaction_reference: `TXN_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
      remarks: 'Online installment payment',
    });
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post(`/fees/invoices/${selectedInvoice.invoice_id}/pay`, {
        amount: parseFloat(paymentForm.amount),
        payment_mode: paymentForm.payment_mode,
        transaction_reference: paymentForm.transaction_reference,
        remarks: paymentForm.remarks,
      });

      setSuccessMsg(res.data.message || 'Payment successfully recorded.');
      setIsPaymentModalOpen(false);

      // Open receipt automatically for instant download/view
      if (res.data.data?.payment_id) {
        viewReceipt(res.data.data.payment_id);
      }
      fetchInitialData();
    } catch (err) {
      setError(err.message || 'Failed to process payment.');
    } finally {
      setSubmitting(false);
    }
  };

  const viewReceipt = async (paymentId) => {
    try {
      const res = await api.get(`/fees/payments/${paymentId}/receipt`);
      setActiveReceipt(res.data.data);
      setIsReceiptModalOpen(true);
    } catch (err) {
      setError(err.message || 'Unable to retrieve digital receipt.');
    }
  };

  // Helper calculations for summary cards
  const totalBilled = invoices.reduce((sum, inv) => sum + Number(inv.total_due || 0), 0);
  const totalScholarship = invoices.reduce((sum, inv) => sum + Number(inv.scholarship_discount || 0), 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + Number(inv.amount_paid || 0), 0);
  const totalNet = invoices.reduce((sum, inv) => sum + Number(inv.net_payable || 0), 0);
  const totalOutstanding = Math.max(0, totalNet - totalCollected);
  const collectionPercentage = totalNet > 0 ? ((totalCollected / totalNet) * 100).toFixed(1) : '100.0';

  // Invoices filtered
  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter && inv.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (deptFilter && String(inv.department_id) !== String(deptFilter)) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchInv = inv.invoice_number?.toLowerCase().includes(q);
      const matchRoll = inv.roll_number?.toLowerCase().includes(q);
      const matchName = inv.student_name?.toLowerCase().includes(q);
      return matchInv || matchRoll || matchName;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Fees & Financial Ledger
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {isAdmin
                  ? 'University fee structures, batch billing, real-time collection metrics & payment audits'
                  : 'Itemized semester fees, installment transactions, verified receipts & billing ledger'}
              </p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsBatchGenerateOpen(true)}
              className="px-4 py-2 bg-slate-800 text-white hover:bg-slate-900 text-sm font-semibold rounded-lg shadow-sm flex items-center gap-2 transition"
            >
              <Layers className="w-4 h-4" />
              Generate Batch Invoices
            </button>
            <button
              onClick={() => setIsCreateStructureOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-semibold rounded-lg shadow-sm flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              Define Fee Structure
            </button>
          </div>
        )}
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-800 text-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-800 text-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Executive Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Billed</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">₹{totalBilled.toLocaleString('en-IN')}</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Scholarships: ₹{totalScholarship.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Collected</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">₹{totalCollected.toLocaleString('en-IN')}</p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Realized into institutional treasury</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outstanding Dues</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">₹{totalOutstanding.toLocaleString('en-IN')}</p>
          <div className="flex items-center gap-1.5 text-xs text-amber-600 mt-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending settlement</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Collection Ratio</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{collectionPercentage}%</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, parseFloat(collectionPercentage)))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs navigation for Admin */}
      {isAdmin && (
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`pb-3 text-sm font-semibold border-b-2 transition ${
              activeTab === 'invoices'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Invoices Ledger ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('structures')}
            className={`pb-3 text-sm font-semibold border-b-2 transition ${
              activeTab === 'structures'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Fee Structures ({structures.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 text-sm font-semibold border-b-2 transition ${
              activeTab === 'analytics'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Department Collection Analytics
          </button>
        </div>
      )}

      {/* TAB 1: INVOICES LEDGER (Admin & Student) */}
      {(activeTab === 'invoices' || isStudent) && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Filters Bar */}
          <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search invoice #, roll number, or student name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Partially_Paid">Partially Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>

              {isAdmin && (
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.department_id} value={d.department_id}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Invoices Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Dept / Sem</th>
                  <th className="py-3 px-4 text-right">Net Payable</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Balance</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-10 text-slate-400">
                      No invoices found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const balance = Number(inv.net_payable) - Number(inv.amount_paid);
                    return (
                      <tr key={inv.invoice_id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                          {inv.invoice_number}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-900">{inv.student_name}</p>
                          <p className="text-xs text-slate-500 font-mono">{inv.roll_number}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-800">{inv.department_code || 'CSE'}</span>
                          <span className="text-xs text-slate-500 block">Sem {inv.semester} • {inv.academic_year}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-slate-900">
                          ₹{Number(inv.net_payable).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-emerald-600">
                          ₹{Number(inv.amount_paid).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-amber-600">
                          ₹{Math.max(0, balance).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              inv.status === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : inv.status === 'Partially_Paid'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : inv.status === 'Overdue'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {inv.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-xs">
                          {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {balance > 0 ? (
                              <button
                                onClick={() => openPaymentModal(inv)}
                                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                {isStudent ? 'Pay Now' : 'Record Pay'}
                              </button>
                            ) : (
                              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 px-2 py-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Cleared
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FEE STRUCTURES (Admin only) */}
      {isAdmin && activeTab === 'structures' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {structures.map((fs) => (
            <div
              key={fs.structure_id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                      {fs.department_code || 'DEPT'} • Semester {fs.semester}
                    </span>
                    <h3 className="font-bold text-slate-900 text-lg mt-0.5">{fs.department_name}</h3>
                    <p className="text-xs text-slate-500 font-mono">Academic Year: {fs.academic_year}</p>
                  </div>
                  <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Building2 className="w-4 h-4" />
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Tuition Fee:</span>
                    <span className="font-medium text-slate-900">₹{Number(fs.tuition_fee).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Development Fee:</span>
                    <span className="font-medium text-slate-900">₹{Number(fs.development_fee).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Laboratory Fee:</span>
                    <span className="font-medium text-slate-900">₹{Number(fs.laboratory_fee).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Library & Resources:</span>
                    <span className="font-medium text-slate-900">₹{Number(fs.library_fee).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Charges:</span>
                    <span className="font-medium text-slate-900">₹{Number(fs.other_charges).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-700">Total Semester Fee</span>
                  <span className="text-lg font-bold text-indigo-600">
                    ₹{Number(fs.total_fee).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Due: {new Date(fs.due_date).toLocaleDateString()}</span>
                <button
                  onClick={() => {
                    setBatchForm({ structure_id: String(fs.structure_id), scholarship_discount_percentage: '0' });
                    setIsBatchGenerateOpen(true);
                  }}
                  className="px-3 py-1.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Issue Batch
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: DEPARTMENT ANALYTICS VIEW (vw_department_fee_collection) */}
      {isAdmin && activeTab === 'analytics' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden p-6">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">
              Department Fee Collection Progress (`vw_department_fee_collection`)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time SQL aggregation view displaying billing volume, realized revenue, and outstanding student liabilities.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Semester & Year</th>
                  <th className="py-3 px-4 text-center">Invoices Issued</th>
                  <th className="py-3 px-4 text-right">Total Billed</th>
                  <th className="py-3 px-4 text-right">Collected</th>
                  <th className="py-3 px-4 text-right">Outstanding</th>
                  <th className="py-3 px-4 text-right">Recovery Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {metrics.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-slate-400">
                      No department billing aggregations available.
                    </td>
                  </tr>
                ) : (
                  metrics.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{m.department_name}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        Semester {m.semester} • {m.academic_year}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                        {m.total_invoices_issued}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-900">
                        ₹{Number(m.total_billed).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-emerald-600">
                        ₹{Number(m.total_collected).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-amber-600">
                        ₹{Number(m.total_outstanding).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-bold text-xs text-indigo-700">{m.collection_percentage}%</span>
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-1.5 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(0, parseFloat(m.collection_percentage)))}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: DEFINE FEE STRUCTURE */}
      {isCreateStructureOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                Define Fee Structure
              </h2>
              <button
                onClick={() => setIsCreateStructureOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStructure} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    required
                    value={structureForm.department_id}
                    onChange={(e) => setStructureForm({ ...structureForm, department_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.department_id} value={d.department_id}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester (1-8)</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    required
                    value={structureForm.semester}
                    onChange={(e) => setStructureForm({ ...structureForm, semester: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
                  <input
                    type="text"
                    required
                    placeholder="2025-2026"
                    value={structureForm.academic_year}
                    onChange={(e) => setStructureForm({ ...structureForm, academic_year: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={structureForm.due_date}
                    onChange={(e) => setStructureForm({ ...structureForm, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tuition Fee (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="45000"
                    value={structureForm.tuition_fee}
                    onChange={(e) => setStructureForm({ ...structureForm, tuition_fee: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Development Fee (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="10000"
                    value={structureForm.development_fee}
                    onChange={(e) => setStructureForm({ ...structureForm, development_fee: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Laboratory (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="8000"
                    value={structureForm.laboratory_fee}
                    onChange={(e) => setStructureForm({ ...structureForm, laboratory_fee: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Library (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="2000"
                    value={structureForm.library_fee}
                    onChange={(e) => setStructureForm({ ...structureForm, library_fee: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Other (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1500"
                    value={structureForm.other_charges}
                    onChange={(e) => setStructureForm({ ...structureForm, other_charges: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateStructureOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BATCH INVOICE GENERATION */}
      {isBatchGenerateOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                Issue Batch Invoices
              </h2>
              <button
                onClick={() => setIsBatchGenerateOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBatchGenerate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Fee Structure</label>
                <select
                  required
                  value={batchForm.structure_id}
                  onChange={(e) => setBatchForm({ ...batchForm, structure_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800"
                >
                  <option value="">Select Fee Structure</option>
                  {structures.map((s) => (
                    <option key={s.structure_id} value={s.structure_id}>
                      {s.department_code} - Sem {s.semester} ({s.academic_year}) - ₹{Number(s.total_fee).toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200/80 text-amber-800 text-xs">
                <p className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Idempotent Execution
                </p>
                <p className="mt-1 text-amber-700">
                  This transaction creates invoice records for all active students in the selected department. Existing invoices are automatically preserved without duplicate billing.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBatchGenerateOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Generating...' : 'Execute Batch Generation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PAYMENT RECORDING & INSTALLMENTS */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  {isStudent ? 'Pay Semester Fees' : 'Record Fee Payment'}
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Invoice #{selectedInvoice.invoice_number}
                </p>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Student:</span>
                  <span className="font-semibold text-slate-900">{selectedInvoice.student_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Net Payable:</span>
                  <span className="font-semibold text-slate-900">₹{Number(selectedInvoice.net_payable).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Previously Paid:</span>
                  <span className="font-semibold text-emerald-600">₹{Number(selectedInvoice.amount_paid).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-sm">
                  <span className="text-slate-800">Remaining Balance:</span>
                  <span className="text-amber-600">
                    ₹{(Number(selectedInvoice.net_payable) - Number(selectedInvoice.amount_paid)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Payment Amount (₹)</label>
                  <button
                    type="button"
                    onClick={() => {
                      const bal = Number(selectedInvoice.net_payable) - Number(selectedInvoice.amount_paid);
                      setPaymentForm({ ...paymentForm, amount: bal.toString() });
                    }}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Pay Full Balance
                  </button>
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  max={Number(selectedInvoice.net_payable) - Number(selectedInvoice.amount_paid)}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={paymentForm.payment_mode}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_mode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800"
                  >
                    <option value="UPI">UPI / QR</option>
                    <option value="Net_Banking">Net Banking</option>
                    <option value="Debit_Card">Debit Card</option>
                    <option value="Credit_Card">Credit Card</option>
                    <option value="Demand_Draft">Demand Draft</option>
                    <option value="Cash">Cash Counter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Ref #</label>
                  <input
                    type="text"
                    required
                    value={paymentForm.transaction_reference}
                    onChange={(e) => setPaymentForm({ ...paymentForm, transaction_reference: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks (Optional)</label>
                <input
                  type="text"
                  placeholder="Installment payment / reference note"
                  value={paymentForm.remarks}
                  onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: OFFICIAL PRINTABLE RECEIPT WITH SHA-256 SEAL */}
      {isReceiptModalOpen && activeReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-8 shadow-2xl border border-slate-200 print:shadow-none print:border-none">
            {/* Header / Crest */}
            <div className="text-center pb-5 border-b border-slate-200">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl mx-auto flex items-center justify-center mb-2 shadow-md">
                <Receipt className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase">
                Smart Campus University
              </h2>
              <p className="text-xs text-slate-500 font-medium">OFFICIAL INSTITUTIONAL FEE RECEIPT</p>
            </div>

            {/* Receipt Meta */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-100 text-xs">
              <div>
                <p className="text-slate-500">Receipt Number:</p>
                <p className="font-mono font-bold text-slate-900">{activeReceipt.receipt_number}</p>
                <p className="text-slate-500 mt-2">Invoice Number:</p>
                <p className="font-mono font-semibold text-slate-800">{activeReceipt.invoice_number}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500">Payment Date:</p>
                <p className="font-semibold text-slate-900">{new Date(activeReceipt.paid_at).toLocaleString()}</p>
                <p className="text-slate-500 mt-2">Payment Mode:</p>
                <p className="font-semibold text-indigo-700">{activeReceipt.payment_mode}</p>
              </div>
            </div>

            {/* Student Dossier Info */}
            <div className="py-3 border-b border-slate-100 text-xs grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500">Student Name: </span>
                <span className="font-semibold text-slate-900">{activeReceipt.student_name}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Roll Number: </span>
                <span className="font-mono font-semibold text-slate-900">{activeReceipt.roll_number}</span>
              </div>
              <div>
                <span className="text-slate-500">Department: </span>
                <span className="font-semibold text-slate-800">{activeReceipt.department_name}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Term: </span>
                <span className="font-semibold text-slate-800">
                  Semester {activeReceipt.semester} ({activeReceipt.academic_year})
                </span>
              </div>
            </div>

            {/* Financial Ledger Breakdown */}
            <div className="py-4 border-b border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between font-bold text-slate-800 border-b border-slate-100 pb-1.5">
                <span>Fee Component</span>
                <span>Amount (₹)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tuition Fee</span>
                <span>₹{Number(activeReceipt.tuition_fee || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Development & Infrastructure</span>
                <span>₹{Number(activeReceipt.development_fee || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Laboratory & Practical</span>
                <span>₹{Number(activeReceipt.laboratory_fee || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Library & Digital Resources</span>
                <span>₹{Number(activeReceipt.library_fee || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Other Institutional Charges</span>
                <span>₹{Number(activeReceipt.other_charges || 0).toLocaleString('en-IN')}</span>
              </div>
              {Number(activeReceipt.scholarship_discount) > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Scholarship / Concession</span>
                  <span>-₹{Number(activeReceipt.scholarship_discount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-200 font-extrabold text-base text-slate-900">
                <span>Amount Paid This Transaction:</span>
                <span className="text-emerald-600">₹{Number(activeReceipt.amount_paid).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Cryptographic SHA-256 Seal Box */}
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center gap-1.5 text-indigo-700 font-semibold mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Institutional Authenticity Seal (SHA-256)</span>
              </div>
              <p className="font-mono text-[10px] text-slate-600 break-all select-all">
                {activeReceipt.digital_seal}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                <span>Txn Ref: {activeReceipt.transaction_reference}</span>
                <span>Audited by: {activeReceipt.recorded_by_email || 'treasury@campus.edu'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between print:hidden">
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 flex items-center gap-2 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                Print Official Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

