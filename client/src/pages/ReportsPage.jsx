import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ToastNotification from '../components/ToastNotification';
import { FileBarChart, Download, CalendarCheck2, Award, Building2, AlertTriangle, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export default function ReportsPage() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'performance' | 'departments' | 'at-risk'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [notifying, setNotifying] = useState(false);

  useEffect(() => {
    fetchReport(activeTab);
  }, [activeTab]);

  const fetchReport = async (tab) => {
    try {
      setLoading(true);
      const res = await api.get(`/reports/${tab}`);
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to generate report.' });
    } finally {
      setLoading(false);
    }
  };

  const handleNotifyAtRisk = async () => {
    try {
      setNotifying(true);
      const res = await api.post('/reports/at-risk/notify');
      setToast({
        type: 'success',
        message: res.data?.message || 'Academic retention alert notifications dispatched.',
      });
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to send warning notifications.' });
    } finally {
      setNotifying(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get(`/reports/export/${activeTab}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeTab}_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setToast({ type: 'success', message: 'CSV export downloaded successfully.' });
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to download CSV export.' });
    }
  };

  // 1. Attendance Columns
  const attendanceColumns = [
    { header: 'Roll No', accessor: 'roll_number', className: 'font-bold text-indigo-600' },
    { header: 'Student Name', accessor: 'student_name', className: 'font-semibold text-slate-800' },
    { header: 'Course', accessor: 'course_code', render: (r) => `${r.course_code} - ${r.course_name}` },
    { header: 'Semester', accessor: 'semester', render: (r) => `Sem ${r.semester}` },
    { header: 'Total Sessions', accessor: 'total_classes', className: 'text-center font-medium' },
    { header: 'Attended', accessor: 'classes_attended', className: 'text-center font-medium' },
    {
      header: 'Attendance %',
      accessor: 'attendance_percentage',
      className: 'text-center font-bold',
      render: (r) => (
        <span className={r.attendance_percentage >= 75 ? 'text-emerald-600' : 'text-rose-600'}>
          {r.attendance_percentage}%
        </span>
      ),
    },
  ];

  // 2. Performance Columns
  const performanceColumns = [
    { header: 'Course', accessor: 'course_code', className: 'font-bold text-indigo-600' },
    { header: 'Exam Title', accessor: 'exam_name', render: (r) => `${r.exam_name} (${r.exam_type})` },
    { header: 'Max Marks', accessor: 'max_marks', className: 'text-center font-mono' },
    { header: 'Graded', accessor: 'total_students_graded', className: 'text-center font-medium' },
    { header: 'Avg Score', accessor: 'average_marks', className: 'text-center font-mono font-bold' },
    { header: 'Highest', accessor: 'highest_marks', className: 'text-center font-mono text-emerald-600 font-semibold' },
    { header: 'Lowest', accessor: 'lowest_marks', className: 'text-center font-mono text-rose-600 font-semibold' },
    { header: 'Pass Rate', accessor: 'pass_percentage', className: 'text-center font-bold text-indigo-600', render: (r) => `${r.pass_percentage}%` },
  ];

  // 3. Department Metrics Columns
  const departmentColumns = [
    { header: 'Dept Code', accessor: 'department_code', className: 'font-bold text-indigo-600' },
    { header: 'Department Name', accessor: 'department_name', className: 'font-semibold text-slate-800' },
    { header: 'Active Students', accessor: 'total_active_students', className: 'text-center font-medium' },
    { header: 'Active Faculty', accessor: 'total_active_faculty', className: 'text-center font-medium' },
    { header: 'Total Courses Offered', accessor: 'total_courses', className: 'text-center font-medium' },
  ];

  // 4. At-Risk Columns
  const atRiskColumns = [
    { header: 'Roll No', accessor: 'roll_number', className: 'font-bold text-indigo-600' },
    { header: 'Student Name', accessor: 'student_name', className: 'font-semibold text-slate-800' },
    { header: 'Department', accessor: 'department_name', className: 'text-slate-600' },
    { header: 'Course', accessor: 'course_code', render: (r) => `${r.course_code} - ${r.course_name}` },
    {
      header: 'Attendance %',
      accessor: 'attendance_percentage',
      className: 'text-center font-mono font-bold',
      render: (r) => (
        <span className={r.attendance_percentage < 75 ? 'text-rose-600 font-extrabold' : 'text-slate-700'}>
          {r.attendance_percentage}%
        </span>
      ),
    },
    {
      header: 'Exam Avg %',
      accessor: 'average_exam_percentage',
      className: 'text-center font-mono font-bold',
      render: (r) => (
        <span className={r.average_exam_percentage < 40 ? 'text-rose-600 font-extrabold' : 'text-slate-700'}>
          {r.average_exam_percentage}%
        </span>
      ),
    },
    {
      header: 'Risk Classification',
      accessor: 'risk_category',
      className: 'text-center',
      render: (r) => {
        const cat = r.risk_category;
        const color =
          cat === 'CRITICAL_BOTH'
            ? 'bg-rose-100 text-rose-800 border-rose-200'
            : cat === 'LOW_ATTENDANCE'
            ? 'bg-amber-100 text-amber-800 border-amber-200'
            : 'bg-orange-100 text-orange-800 border-orange-200';
        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${color}`}>
            {cat.replace('_', ' ')}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-indigo-600" />
            Institutional SQL Aggregation Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Database view analytics, performance distributions, and CSV exports</p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'at-risk' && isAdmin && (
            <button
              onClick={handleNotifyAtRisk}
              disabled={notifying || data.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition shadow-sm disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{notifying ? 'Dispatching...' : 'Dispatch Warning Alerts'}</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export to CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'attendance'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarCheck2 className="w-4 h-4" />
          <span>Student Attendance Summary</span>
        </button>

        <button
          onClick={() => setActiveTab('performance')}
          className={`pb-3 font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'performance'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Course Exam Performance</span>
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`pb-3 font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'departments'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Department Metrics</span>
        </button>

        <button
          onClick={() => setActiveTab('at-risk')}
          className={`pb-3 font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            activeTab === 'at-risk'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span>At-Risk Students (Early Warning)</span>
        </button>
      </div>

      {/* Chart for Performance Tab */}
      {activeTab === 'performance' && data.length > 0 && !loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            Exam Performance Distribution (Average vs Highest Score)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="course_code" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="average_marks" name="Average Marks" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="highest_marks" name="Highest Marks" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Report DataTable */}
      <DataTable
        columns={
          activeTab === 'attendance'
            ? attendanceColumns
            : activeTab === 'performance'
            ? performanceColumns
            : activeTab === 'departments'
            ? departmentColumns
            : atRiskColumns
        }
        data={data}
        loading={loading}
      />

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

