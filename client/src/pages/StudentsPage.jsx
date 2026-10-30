import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import SearchFilterBar from '../components/SearchFilterBar';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import ToastNotification from '../components/ToastNotification';
import { Plus, Eye, UserX, UserCheck, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function StudentsPage() {
  const { isAdmin } = useAuth();
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [formError, setFormError] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    roll_number: '',
    first_name: '',
    last_name: '',
    dob: '',
    phone: '',
    address: '',
    enrollment_year: new Date().getFullYear(),
    department_id: '',
    password: 'Campus@123',
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchStudents(pagination.page);
  }, [search, departmentFilter, statusFilter]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      if (res.data?.success) setDepartments(res.data.data);
    } catch {}
  };

  const fetchStudents = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        search: search || undefined,
        department_id: departmentFilter || undefined,
        status: statusFilter || undefined,
      };
      const res = await api.get('/students', { params });
      if (res.data?.success) {
        setStudents(res.data.data);
        if (res.data.meta) {
          setPagination((prev) => ({ ...prev, page: res.data.meta.page, total: res.data.meta.total }));
        }
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to fetch student roster.' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (student) => {
    const newStatus = student.status === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/students/${student.student_id}/status`, { status: newStatus });
      setToast({ type: 'success', message: `Student marked as ${newStatus}.` });
      fetchStudents(pagination.page);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to update student status.' });
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      await api.post('/students', {
        ...formData,
        enrollment_year: Number(formData.enrollment_year),
        department_id: Number(formData.department_id),
      });
      setToast({ type: 'success', message: 'Student registered successfully.' });
      setModalOpen(false);
      setFormData({
        email: '',
        roll_number: '',
        first_name: '',
        last_name: '',
        dob: '',
        phone: '',
        address: '',
        enrollment_year: new Date().getFullYear(),
        department_id: '',
        password: 'Campus@123',
      });
      fetchStudents(1);
    } catch (err) {
      setFormError(err.message || 'Failed to register student.');
    }
  };

  const columns = [
    {
      header: 'Roll No',
      accessor: 'roll_number',
      className: 'font-bold text-indigo-600',
    },
    {
      header: 'Student Name',
      accessor: 'student_name',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800">{row.first_name} {row.last_name}</div>
          <div className="text-xs text-slate-400">{row.email}</div>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: 'department_code',
      render: (row) => (
        <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">
          {row.department_code}
        </span>
      ),
    },
    {
      header: 'Year',
      accessor: 'enrollment_year',
      className: 'text-center font-medium',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end space-x-2">
          <Link
            to={`/students/${row.student_id}`}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
            title="View Dossier"
          >
            <Eye className="w-4 h-4" />
          </Link>

          {isAdmin && (
            <button
              onClick={() => handleToggleStatus(row)}
              className={`p-1.5 rounded-lg transition ${
                row.status === 'active'
                  ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                  : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
              title={row.status === 'active' ? 'Deactivate Student' : 'Activate Student'}
            >
              {row.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" />
            Student Academic Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Enrolled undergraduate and graduate student records</p>
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
            <span>Register Student</span>
          </button>
        )}
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Search by roll number, name, or email..."
        filters={[
          {
            label: 'Department',
            value: departmentFilter,
            onChange: setDepartmentFilter,
            options: [
              { label: 'All Departments', value: '' },
              ...departments.map((d) => ({ label: `${d.code} - ${d.name}`, value: d.department_id })),
            ],
          },
          {
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: '' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        pagination={{
          ...pagination,
          onPageChange: (newPage) => {
            setPagination((p) => ({ ...p, page: newPage }));
            fetchStudents(newPage);
          },
        }}
      />

      {/* Register Student Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register New Student" maxWidth="max-w-xl">
        {formError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {formError}
          </div>
        )}
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Roll Number
              </label>
              <input
                type="text"
                required
                value={formData.roll_number}
                onChange={(e) => setFormData({ ...formData, roll_number: e.target.value.toUpperCase() })}
                placeholder="e.g. CS2025001"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Campus Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. himesh.adhikari@campus.edu"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                First Name (Given + Middle)
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="e.g. Himesh Sunil"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Last Name (Surname)
              </label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="e.g. Adhikari"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                required
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Enrollment Year
              </label>
              <input
                type="number"
                required
                min={2000}
                max={2100}
                value={formData.enrollment_year}
                onChange={(e) => setFormData({ ...formData, enrollment_year: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1-555-0100"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Initial Password
              </label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Address (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Residential address..."
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
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
              Register Student
            </button>
          </div>
        </form>
      </Modal>

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

