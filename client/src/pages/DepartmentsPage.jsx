import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import ToastNotification from '../components/ToastNotification';
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DepartmentsPage() {
  const { isAdmin } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ code: '', name: '', description: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });
  const [toast, setToast] = useState(null);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/departments');
      if (res.data?.success) setDepartments(res.data.data);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to fetch departments.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingDept(null);
    setFormData({ code: '', name: '', description: '' });
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({ code: dept.code, name: dept.name, description: dept.description || '' });
    setFormError(null);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      if (editingDept) {
        await api.put(`/departments/${editingDept.department_id}`, formData);
        setToast({ type: 'success', message: 'Department updated successfully.' });
      } else {
        await api.post('/departments', formData);
        setToast({ type: 'success', message: 'Department created successfully.' });
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      setFormError(err.message || 'Operation failed.');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/departments/${deleteConfirm.id}`);
      setToast({ type: 'success', message: 'Department deleted successfully.' });
      fetchDepartments();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete department.' });
    }
  };

  const columns = [
    {
      header: 'Code',
      accessor: 'code',
      className: 'font-bold text-indigo-600',
    },
    {
      header: 'Department Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800">{row.name}</div>
          {row.description && <div className="text-xs text-slate-400 mt-0.5 max-w-sm truncate">{row.description}</div>}
        </div>
      ),
    },
    {
      header: 'Students',
      accessor: 'student_count',
      className: 'text-center font-medium',
    },
    {
      header: 'Faculty',
      accessor: 'faculty_count',
      className: 'text-center font-medium',
    },
    {
      header: 'Courses',
      accessor: 'course_count',
      className: 'text-center font-medium',
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
                  title="Edit Department"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm({ open: true, id: row.department_id, name: row.name })}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Delete Department"
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
            <Building2 className="w-6 h-6 text-indigo-600" />
            Academic Departments
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage institutional faculties, divisions, and resource allocations</p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
        )}
      </div>

      <DataTable columns={columns} data={departments} loading={loading} />

      {/* Create / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingDept ? 'Edit Department' : 'Create New Department'}>
        {formError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {formError}
          </div>
        )}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Department Code
            </label>
            <input
              type="text"
              required
              disabled={!!editingDept}
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. CSE"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-slate-100 uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Department Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Computer Science and Engineering"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summary of department academic goals..."
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
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
              {editingDept ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })}
        onConfirm={handleDelete}
        title="Delete Department"
        message={`Are you sure you want to delete the department '${deleteConfirm.name}'? This action will be blocked if any active students, faculty, or courses belong to this department.`}
        confirmText="Delete Department"
        isDangerous={true}
      />

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

