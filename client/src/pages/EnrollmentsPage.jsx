import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import ToastNotification from '../components/ToastNotification';
import { Plus, UserCheck, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function EnrollmentsPage() {
  const { isAdmin } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [toast, setToast] = useState(null);
  const [formError, setFormError] = useState(null);

  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    semester: 1,
    academic_year: '2025-2026',
    status: 'enrolled',
  });

  useEffect(() => {
    fetchMetadata();
    fetchEnrollments();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [stuRes, crsRes] = await Promise.all([
        api.get('/students?limit=200&status=active'),
        api.get('/courses'),
      ]);
      if (stuRes.data?.success) setStudents(stuRes.data.data);
      if (crsRes.data?.success) setCourses(crsRes.data.data);
    } catch {}
  };

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/enrollments');
      if (res.data?.success) setEnrollments(res.data.data);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to fetch enrollments.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      await api.post('/enrollments', {
        ...formData,
        student_id: Number(formData.student_id),
        course_id: Number(formData.course_id),
        semester: Number(formData.semester),
      });
      setToast({ type: 'success', message: 'Student successfully enrolled in course.' });
      setModalOpen(false);
      fetchEnrollments();
    } catch (err) {
      setFormError(err.message || 'Enrollment failed.');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/enrollments/${deleteConfirm.id}`);
      setToast({ type: 'success', message: 'Enrollment record removed.' });
      fetchEnrollments();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to remove enrollment.' });
    }
  };

  const columns = [
    {
      header: 'Student Roll No',
      accessor: 'roll_number',
      className: 'font-bold text-indigo-600',
    },
    {
      header: 'Student Name',
      accessor: 'student_name',
      className: 'font-medium text-slate-800',
    },
    {
      header: 'Course',
      accessor: 'course_code',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-800">{row.course_code}</span>
          <span className="text-xs text-slate-500 ml-2">{row.course_name}</span>
        </div>
      ),
    },
    {
      header: 'Term',
      accessor: 'academic_year',
      render: (row) => `Sem ${row.semester} (${row.academic_year})`,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    ...(isAdmin
      ? [
          {
            header: 'Actions',
            className: 'text-right',
            render: (row) => (
              <button
                onClick={() => setDeleteConfirm({ open: true, id: row.enrollment_id })}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="Drop/Remove Enrollment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-indigo-600" />
            Course Enrollments
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage student semester course enrollments and term credits</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setFormError(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Enrol Student</span>
          </button>
        )}
      </div>

      <DataTable columns={columns} data={enrollments} loading={loading} />

      {/* Enroll Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Enrol Student in Course" maxWidth="max-w-md">
        {formError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {formError}
          </div>
        )}
        <form onSubmit={handleEnrollStudent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select Student
            </label>
            <select
              required
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">Select Enrolled Student</option>
              {students.map((s) => (
                <option key={s.student_id} value={s.student_id}>
                  {s.roll_number} - {s.first_name} {s.last_name} ({s.department_code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select Course
            </label>
            <select
              required
              value={formData.course_id}
              onChange={(e) => {
                const c = courses.find((item) => String(item.course_id) === String(e.target.value));
                setFormData({
                  ...formData,
                  course_id: e.target.value,
                  semester: c ? c.semester : formData.semester,
                });
              }}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c.course_id} value={c.course_id}>
                  {c.course_code} - {c.course_name} (Sem {c.semester}, {c.credits} Cr)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Semester (1-8)
              </label>
              <input
                type="number"
                min={1}
                max={8}
                required
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Academic Year
              </label>
              <input
                type="text"
                required
                placeholder="2025-2026"
                value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Academic Progression & Credit Cap Guard Meter */}
          {formData.student_id && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Semester Credit Load Guard:</span>
                <span className={`font-mono font-bold ${
                  (enrollments.filter(e => String(e.student_id) === String(formData.student_id) && Number(e.semester) === Number(formData.semester)).reduce((s, e) => s + (Number(e.credits) || 0), 0) + (courses.find(c => String(c.course_id) === String(formData.course_id))?.credits || 0)) > 24
                    ? 'text-rose-600'
                    : 'text-indigo-600'
                }`}>
                  {enrollments.filter(e => String(e.student_id) === String(formData.student_id) && Number(e.semester) === Number(formData.semester)).reduce((s, e) => s + (Number(e.credits) || 0), 0) + (courses.find(c => String(c.course_id) === String(formData.course_id))?.credits || 0)} / 24 Credits Max
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    (enrollments.filter(e => String(e.student_id) === String(formData.student_id) && Number(e.semester) === Number(formData.semester)).reduce((s, e) => s + (Number(e.credits) || 0), 0) + (courses.find(c => String(c.course_id) === String(formData.course_id))?.credits || 0)) > 24
                      ? 'bg-rose-500'
                      : 'bg-indigo-600'
                  }`}
                  style={{
                    width: `${Math.min(100, ((enrollments.filter(e => String(e.student_id) === String(formData.student_id) && Number(e.semester) === Number(formData.semester)).reduce((s, e) => s + (Number(e.credits) || 0), 0) + (courses.find(c => String(c.course_id) === String(formData.course_id))?.credits || 0)) / 24) * 100)}%`
                  }}
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Enforces maximum 24 credits per semester & prerequisite course verification.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
            >
              Confirm Enrollment
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm drop enrollment dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Remove Course Enrollment"
        message="Are you sure you want to drop this student's course enrollment? If exam marks have been entered, the DBMS will safely block this operation."
        confirmText="Remove Enrollment"
        isDangerous={true}
      />

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

