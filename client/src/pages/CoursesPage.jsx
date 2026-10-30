import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import SearchFilterBar from '../components/SearchFilterBar';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import ToastNotification from '../components/ToastNotification';
import { Plus, BookOpen, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CoursesPage() {
  const { isAdmin } = useAuth();
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, code: '' });
  const [toast, setToast] = useState(null);
  const [formError, setFormError] = useState(null);

  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    credits: 4,
    semester: 1,
    department_id: '',
    faculty_id: '',
  });

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [search, departmentFilter, semesterFilter]);

  const fetchMetadata = async () => {
    try {
      const [deptRes, facRes] = await Promise.all([
        api.get('/departments'),
        api.get('/faculty?limit=100'),
      ]);
      if (deptRes.data?.success) setDepartments(deptRes.data.data);
      if (facRes.data?.success) setFaculty(facRes.data.data);
    } catch {}
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {
        search: search || undefined,
        department_id: departmentFilter || undefined,
        semester: semesterFilter || undefined,
      };
      const res = await api.get('/courses', { params });
      if (res.data?.success) setCourses(res.data.data);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to fetch course catalog.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setFormData({
      course_code: '',
      course_name: '',
      credits: 4,
      semester: 1,
      department_id: '',
      faculty_id: '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCourse(c);
    setFormData({
      course_code: c.course_code,
      course_name: c.course_name,
      credits: c.credits,
      semester: c.semester,
      department_id: c.department_id,
      faculty_id: c.faculty_id || '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      const payload = {
        ...formData,
        credits: Number(formData.credits),
        semester: Number(formData.semester),
        department_id: Number(formData.department_id),
        faculty_id: formData.faculty_id ? Number(formData.faculty_id) : null,
      };

      if (editingCourse) {
        await api.put(`/courses/${editingCourse.course_id}`, payload);
        setToast({ type: 'success', message: 'Course updated successfully.' });
      } else {
        await api.post('/courses', payload);
        setToast({ type: 'success', message: 'Course added to catalog successfully.' });
      }
      setModalOpen(false);
      fetchCourses();
    } catch (err) {
      setFormError(err.message || 'Operation failed.');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/courses/${deleteConfirm.id}`);
      setToast({ type: 'success', message: 'Course deleted from catalog.' });
      fetchCourses();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete course.' });
    }
  };

  const columns = [
    {
      header: 'Code',
      accessor: 'course_code',
      className: 'font-bold text-indigo-600',
    },
    {
      header: 'Course Title',
      accessor: 'course_name',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800">{row.course_name}</div>
          <div className="text-xs text-slate-400">{row.department_name}</div>
        </div>
      ),
    },
    {
      header: 'Credits',
      accessor: 'credits',
      className: 'text-center font-medium',
    },
    {
      header: 'Semester',
      accessor: 'semester',
      className: 'text-center font-medium',
      render: (row) => `Sem ${row.semester}`,
    },
    {
      header: 'Instructor',
      accessor: 'faculty_name',
      render: (row) =>
        row.faculty_name ? (
          <span className="text-xs text-slate-700 font-medium">{row.faculty_name}</span>
        ) : (
          <span className="text-xs text-slate-400 italic">Unassigned</span>
        ),
    },
    {
      header: 'Enrolled',
      accessor: 'enrolled_students_count',
      className: 'text-center font-medium text-xs',
      render: (row) => `${row.enrolled_students_count || 0} students`,
    },
    ...(isAdmin
      ? [
          {
            header: 'Actions',
            className: 'text-right',
            render: (row) => (
              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => handleOpenEdit(row)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                  title="Edit Course"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm({ open: true, id: row.course_id, code: row.course_code })}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Delete Course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
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
            <BookOpen className="w-6 h-6 text-indigo-600" />
            University Course Catalog
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Academic curriculum, credits, and faculty course assignments</p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Course</span>
          </button>
        )}
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Search by code or course title..."
        filters={[
          {
            label: 'Department',
            value: departmentFilter,
            onChange: setDepartmentFilter,
            options: [
              { label: 'All Departments', value: '' },
              ...departments.map((d) => ({ label: d.code, value: d.department_id })),
            ],
          },
          {
            label: 'Semester',
            value: semesterFilter,
            onChange: setSemesterFilter,
            options: [
              { label: 'All Semesters', value: '' },
              ...[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({ label: `Semester ${s}`, value: s })),
            ],
          },
        ]}
      />

      <DataTable columns={columns} data={courses} loading={loading} />

      {/* Create / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCourse ? 'Edit Course' : 'Create Course'} maxWidth="max-w-lg">
        {formError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Course Code
              </label>
              <input
                type="text"
                required
                disabled={!!editingCourse}
                value={formData.course_code}
                onChange={(e) => setFormData({ ...formData, course_code: e.target.value.toUpperCase() })}
                placeholder="e.g. CS101"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Credits (1 - 6)
              </label>
              <input
                type="number"
                required
                min={1}
                max={6}
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Course Title
            </label>
            <input
              type="text"
              required
              value={formData.course_name}
              onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
              placeholder="e.g. Database Management Systems"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Department
              </label>
              <select
                required
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Semester (1 - 8)
              </label>
              <select
                required
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Assigned Instructor (Faculty)
            </label>
            <select
              value={formData.faculty_id}
              onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">None (Unassigned)</option>
              {faculty.map((f) => (
                <option key={f.faculty_id} value={f.faculty_id}>
                  {f.first_name} {f.last_name} ({f.employee_code}) - {f.department_code}
                </option>
              ))}
            </select>
          </div>

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
              {editingCourse ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Course Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null, code: '' })}
        onConfirm={handleDelete}
        title="Delete Course"
        message={`Are you sure you want to delete course '${deleteConfirm.code}'? If any students are enrolled or exams scheduled, the DBMS will safely block this operation.`}
        confirmText="Delete Course"
        isDangerous={true}
      />

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

