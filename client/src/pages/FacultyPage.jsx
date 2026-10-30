import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import SearchFilterBar from '../components/SearchFilterBar';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import ToastNotification from '../components/ToastNotification';
import { Plus, Users, UserX, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function FacultyPage() {
  const { isAdmin } = useAuth();
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [formError, setFormError] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    employee_code: '',
    first_name: '',
    last_name: '',
    designation: 'Assistant Professor',
    phone: '',
    department_id: '',
    password: 'Campus@123',
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchFaculty(pagination.page);
  }, [search, departmentFilter]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      if (res.data?.success) setDepartments(res.data.data);
    } catch {}
  };

  const fetchFaculty = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        search: search || undefined,
        department_id: departmentFilter || undefined,
      };
      const res = await api.get('/faculty', { params });
      if (res.data?.success) {
        setFaculty(res.data.data);
        if (res.data.meta) {
          setPagination((prev) => ({ ...prev, page: res.data.meta.page, total: res.data.meta.total }));
        }
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to fetch faculty list.' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (fac) => {
    const newStatus = fac.status === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/faculty/${fac.faculty_id}/status`, { status: newStatus });
      setToast({ type: 'success', message: `Faculty member marked as ${newStatus}.` });
      fetchFaculty(pagination.page);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to update faculty status.' });
    }
  };

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      await api.post('/faculty', {
        ...formData,
        department_id: Number(formData.department_id),
      });
      setToast({ type: 'success', message: 'Faculty member created successfully.' });
      setModalOpen(false);
      setFormData({
        email: '',
        employee_code: '',
        first_name: '',
        last_name: '',
        designation: 'Assistant Professor',
        phone: '',
        department_id: '',
        password: 'Campus@123',
      });
      fetchFaculty(1);
    } catch (err) {
      setFormError(err.message || 'Failed to register faculty member.');
    }
  };

  const columns = [
    {
      header: 'Employee Code',
      accessor: 'employee_code',
      className: 'font-bold text-indigo-600',
    },
    {
      header: 'Faculty Member',
      accessor: 'name',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800">{row.first_name} {row.last_name}</div>
          <div className="text-xs text-slate-400">{row.email}</div>
        </div>
      ),
    },
    {
      header: 'Designation',
      accessor: 'designation',
      className: 'font-medium text-slate-600 text-xs',
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
      header: 'Phone',
      accessor: 'phone',
      className: 'text-xs text-slate-500',
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
                onClick={() => handleToggleStatus(row)}
                className={`p-1.5 rounded-lg transition ${
                  row.status === 'active'
                    ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                    : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
                title={row.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
              >
                {row.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
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
            <Users className="w-6 h-6 text-indigo-600" />
            Faculty Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Academic instructors, department heads, and professors</p>
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
            <span>Add Faculty</span>
          </button>
        )}
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Search by code, name, or email..."
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
        ]}
      />

      <DataTable
        columns={columns}
        data={faculty}
        loading={loading}
        pagination={{
          ...pagination,
          onPageChange: (newPage) => {
            setPagination((p) => ({ ...p, page: newPage }));
            fetchFaculty(newPage);
          },
        }}
      />

      {/* Add Faculty Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register Faculty Member" maxWidth="max-w-xl">
        {formError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {formError}
          </div>
        )}
        <form onSubmit={handleCreateFaculty} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Employee Code
              </label>
              <input
                type="text"
                required
                value={formData.employee_code}
                onChange={(e) => setFormData({ ...formData, employee_code: e.target.value.toUpperCase() })}
                placeholder="e.g. FAC-CSE-001"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Faculty Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. professor@campus.edu"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                First Name
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="e.g. Alan"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Last Name
              </label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="e.g. Turing"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
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
                Designation
              </label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Professor & Head"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1-555-0101"
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
              Register Faculty
            </button>
          </div>
        </form>
      </Modal>

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

