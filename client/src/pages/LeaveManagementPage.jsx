import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { formatDate } from '../utils/formatters';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Send,
  Filter,
  FileText,
  User,
  BookOpen,
} from 'lucide-react';

export default function LeaveManagementPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  // Submit form state (Student)
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [form, setForm] = useState({
    enrollment_id: '',
    leave_date: new Date().toISOString().slice(0, 10),
    reason: '',
  });

  // Review modal state (Faculty/Admin)
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('Approved');
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  useEffect(() => {
    fetchLeaves();
    if (user.role === 'student') {
      fetchEnrollments();
    }
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leaves');
      if (res.data?.success) {
        setLeaves(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const res = await api.get('/enrollments');
      if (res.data?.success) {
        const enrs = res.data.data || [];
        setEnrollments(enrs);
        if (enrs.length > 0 && !form.enrollment_id) {
          setForm((prev) => ({ ...prev, enrollment_id: enrs[0].enrollment_id }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch enrollments:', err);
    }
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);
    setSubmitting(true);

    try {
      await api.post('/leaves', {
        enrollment_id: Number(form.enrollment_id),
        leave_date: form.leave_date,
        reason: form.reason,
      });
      setSubmitSuccess('Leave request submitted successfully. Awaiting faculty review.');
      setForm((prev) => ({ ...prev, reason: '' }));
      fetchLeaves();
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit leave application.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewLeave = async (e) => {
    e.preventDefault();
    setReviewError(null);
    setReviewing(true);

    try {
      await api.patch(`/leaves/${selectedLeave.leave_id}/review`, {
        status: reviewStatus,
        review_remarks: reviewRemarks,
      });
      setSelectedLeave(null);
      setReviewRemarks('');
      fetchLeaves();
    } catch (err) {
      setReviewError(err.message || 'Failed to complete review.');
    } finally {
      setReviewing(false);
    }
  };

  const filteredLeaves = leaves.filter((l) => {
    if (statusFilter === 'All') return true;
    return l.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-indigo-600" />
          Digital Leave & Attendance Excuse Portal
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Student medical & personal leave applications with transactional attendance excuse clearance.
        </p>
      </div>

      {/* STUDENT APPLICATION FORM */}
      {user.role === 'student' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Send className="w-4 h-4 text-indigo-600" />
            Submit Academic Leave Request
          </h3>

          {submitSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{submitSuccess}</span>
            </div>
          )}

          {submitError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitLeave} className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Enrolled Course</label>
              <select
                required
                value={form.enrollment_id}
                onChange={(e) => setForm({ ...form, enrollment_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              >
                {enrollments.map((enr) => (
                  <option key={enr.enrollment_id} value={enr.enrollment_id}>
                    {enr.course_code} - {enr.course_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date of Absence</label>
              <input
                type="date"
                required
                value={form.leave_date}
                onChange={(e) => setForm({ ...form, leave_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none"
              >
              </input>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reason / Medical Justification</label>
              <input
                type="text"
                required
                placeholder="e.g. Medical illness, doctor consultation"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={submitting || enrollments.length === 0}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Submitting Application...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTER & HISTORY / QUEUE TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            {user.role === 'student' ? 'My Leave Applications' : 'Student Leave Requests Queue'}
          </h3>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 font-semibold text-slate-700 focus:outline-none"
            >
              <option value="All">All Requests</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8">
            <LoadingSpinner size="md" text="Loading leave records..." />
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No leave applications match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  {user.role !== 'student' && <th className="py-3 px-4">Student</th>}
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Review Remarks</th>
                  {user.role !== 'student' && <th className="py-3 px-4 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeaves.map((leave) => (
                  <tr key={leave.leave_id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 font-mono font-medium text-slate-700 whitespace-nowrap">
                      {formatDate(leave.leave_date)}
                    </td>
                    {user.role !== 'student' && (
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800">{leave.student_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{leave.roll_number}</div>
                      </td>
                    )}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-indigo-600">{leave.course_code}</span>
                      <span className="text-slate-500 ml-1.5 hidden sm:inline">{leave.course_name}</span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-700" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={leave.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">
                      {leave.review_remarks || '-'}
                    </td>
                    {user.role !== 'student' && (
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {leave.status === 'Pending' ? (
                          <button
                            onClick={() => {
                              setSelectedLeave(leave);
                              setReviewStatus('Approved');
                              setReviewRemarks('');
                              setReviewError(null);
                            }}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold transition"
                          >
                            Review
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Completed</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REVIEW MODAL (Faculty / Admin) */}
      {selectedLeave && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in duration-200 text-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              Review Leave Application
            </h3>
            <p className="text-slate-500 mb-4">
              Student: <span className="font-bold text-slate-800">{selectedLeave.student_name}</span> ({selectedLeave.roll_number}) • Course: {selectedLeave.course_code}
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 mb-4 space-y-1">
              <div>
                <span className="font-semibold text-slate-600">Absence Date: </span>
                <span className="font-mono text-slate-800">{formatDate(selectedLeave.leave_date)}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-600">Reason: </span>
                <span className="text-slate-800">{selectedLeave.reason}</span>
              </div>
            </div>

            {reviewError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{reviewError}</span>
              </div>
            )}

            <form onSubmit={handleReviewLeave} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewStatus('Approved')}
                    className={`py-2 px-3 rounded-xl font-bold border transition flex items-center justify-center gap-1.5 ${
                      reviewStatus === 'Approved'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Approve (Excused)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatus('Rejected')}
                    className={`py-2 px-3 rounded-xl font-bold border transition flex items-center justify-center gap-1.5 ${
                      reviewStatus === 'Rejected'
                        ? 'bg-rose-50 border-rose-300 text-rose-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Reject
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Review Remarks</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Verified with medical certificate."
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedLeave(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewing}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  {reviewing ? 'Recording Decision...' : 'Save Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

