import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ToastNotification from '../components/ToastNotification';
import Modal from '../components/Modal';
import { ShieldCheck, Eye, Activity } from 'lucide-react';
import { formatDateTime } from '../utils/formatters';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [activeMeta, setActiveMeta] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchLogs(pagination.page);
  }, []);

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get('/audit-logs', { params: { page, limit: pagination.limit } });
      if (res.data?.success) {
        setLogs(res.data.data);
        if (res.data.meta) {
          setPagination((prev) => ({ ...prev, page: res.data.meta.page, total: res.data.meta.total }));
        }
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to retrieve audit log trail.' });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'created_at',
      render: (r) => <span className="text-xs text-slate-500 font-mono">{formatDateTime(r.created_at)}</span>,
    },
    {
      header: 'Actor',
      accessor: 'actor_email',
      render: (r) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs">{r.actor_email || 'System Daemon'}</div>
          {r.actor_role && (
            <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded uppercase font-bold">
              {r.actor_role}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (r) => (
        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
          {r.action}
        </span>
      ),
    },
    {
      header: 'Target Entity',
      accessor: 'entity_type',
      render: (r) => (
        <span className="text-xs text-slate-600">
          {r.entity_type} {r.entity_id ? `(#${r.entity_id})` : ''}
        </span>
      ),
    },
    {
      header: 'IP Address',
      accessor: 'ip_address',
      render: (r) => <span className="text-xs text-slate-400 font-mono">{r.ip_address || '—'}</span>,
    },
    {
      header: 'Metadata',
      className: 'text-right',
      render: (r) => (
        <button
          onClick={() => setActiveMeta(r.metadata)}
          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition inline-flex items-center gap-1 text-xs font-semibold"
          title="Inspect JSON Metadata"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Inspect</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            Security & Audit Trail Logs
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Immutable DBMS audit trail recording all administrative, faculty, and student actions</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        pagination={{
          ...pagination,
          onPageChange: (newPage) => {
            setPagination((p) => ({ ...p, page: newPage }));
            fetchLogs(newPage);
          },
        }}
      />

      {/* Inspect Metadata Modal */}
      <Modal isOpen={!!activeMeta} onClose={() => setActiveMeta(null)} title="Audit Event Metadata" maxWidth="max-w-md">
        <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-80">
          {JSON.stringify(activeMeta, null, 2)}
        </pre>
        <div className="flex justify-end pt-3">
          <button
            onClick={() => setActiveMeta(null)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </Modal>

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

