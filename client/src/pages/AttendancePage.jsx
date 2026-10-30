import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ToastNotification from '../components/ToastNotification';
import { CalendarCheck2, CheckCircle, Clock, XCircle, Save, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AttendancePage() {
  const { user, isStudent, isFaculty, isAdmin } = useAuth();

  // Faculty / Admin state
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [roster, setRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [saving, setSaving] = useState(false);

  // Student state
  const [studentRecords, setStudentRecords] = useState([]);
  const [loadingStudent, setLoadingStudent] = useState(false);

  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (isStudent) {
      fetchStudentAttendance();
    } else {
      fetchCourses();
    }
  }, [isStudent]);

  useEffect(() => {
    if (selectedCourseId && !isStudent) {
      fetchCourseAttendance();
    }
  }, [selectedCourseId, attendanceDate]);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      if (res.data?.success) {
        let availableCourses = res.data.data;
        if (isFaculty) {
          availableCourses = availableCourses.filter(
            (c) => Number(c.faculty_id) === Number(user.faculty_id)
          );
        }
        setCourses(availableCourses);
        if (availableCourses.length > 0) {
          setSelectedCourseId(availableCourses[0].course_id);
        }
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to fetch courses.' });
    }
  };

  const fetchCourseAttendance = async () => {
    try {
      setLoadingRoster(true);
      const res = await api.get(`/attendance/course/${selectedCourseId}?date=${attendanceDate}`);
      if (res.data?.success) {
        // Initialize status to 'Present' if not previously marked
        const initialized = res.data.data.map((item) => ({
          ...item,
          status: item.status === 'Not Marked' ? 'Present' : item.status,
          remarks: item.remarks || '',
        }));
        setRoster(initialized);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to load attendance roster.' });
    } finally {
      setLoadingRoster(false);
    }
  };

  const fetchStudentAttendance = async () => {
    try {
      setLoadingStudent(true);
      const res = await api.get(`/attendance/student/${user.student_id}`);
      if (res.data?.success) {
        setStudentRecords(res.data.data);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to fetch attendance.' });
    } finally {
      setLoadingStudent(false);
    }
  };

  const handleMarkAll = (status) => {
    setRoster((prev) => prev.map((r) => ({ ...r, status })));
  };

  const handleStatusChange = (enrollmentId, status) => {
    setRoster((prev) =>
      prev.map((r) => (r.enrollment_id === enrollmentId ? { ...r, status } : r))
    );
  };

  const handleRemarksChange = (enrollmentId, remarks) => {
    setRoster((prev) =>
      prev.map((r) => (r.enrollment_id === enrollmentId ? { ...r, remarks } : r))
    );
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const payload = {
        course_id: Number(selectedCourseId),
        attendance_date: attendanceDate,
        records: roster.map((r) => ({
          enrollment_id: r.enrollment_id,
          status: r.status,
          remarks: r.remarks || null,
        })),
      };

      await api.post('/attendance/bulk', payload);
      setToast({ type: 'success', message: 'Daily attendance successfully recorded.' });
      fetchCourseAttendance();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to record attendance.' });
    } finally {
      setSaving(false);
    }
  };

  // Student Columns
  const studentColumns = [
    {
      header: 'Date',
      accessor: 'attendance_date',
      className: 'font-semibold text-slate-800',
    },
    {
      header: 'Course',
      accessor: 'course_code',
      render: (row) => `${row.course_code} - ${row.course_name}`,
    },
    {
      header: 'Attendance Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Remarks',
      accessor: 'remarks',
      render: (row) => row.remarks || '—',
      className: 'text-xs text-slate-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarCheck2 className="w-6 h-6 text-indigo-600" />
            Attendance Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isStudent
              ? 'Personal academic attendance history and session verification'
              : 'Record daily lecture attendance and manage course rosters'}
          </p>
        </div>
      </div>

      {/* STUDENT VIEW */}
      {isStudent ? (
        <DataTable
          columns={studentColumns}
          data={studentRecords}
          loading={loadingStudent}
          emptyMessage="No attendance sessions recorded yet for your enrollments."
        />
      ) : (
        /* FACULTY / ADMIN BULK MARKING VIEW */
        <div className="space-y-6">
          {/* Filter / Selector Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex flex-1 flex-wrap items-center gap-4">
              <div className="min-w-[260px] flex-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Assigned Course
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                >
                  {courses.length === 0 ? (
                    <option value="">No Courses Assigned</option>
                  ) : (
                    courses.map((c) => (
                      <option key={c.course_id} value={c.course_id}>
                        {c.course_code} - {c.course_name} (Sem {c.semester})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Session Date
                </label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center">
              <button
                type="button"
                onClick={() => handleMarkAll('Present')}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>All Present</span>
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('Absent')}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>All Absent</span>
              </button>
            </div>
          </div>

          {/* Student Roster Marking Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {loadingRoster ? (
              <LoadingSpinner size="md" text="Loading course enrollment roster..." />
            ) : roster.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No students currently enrolled in this course.</p>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                      <tr>
                        <th className="px-6 py-3.5">Roll Number</th>
                        <th className="px-6 py-3.5">Student Name</th>
                        <th className="px-6 py-3.5 text-center">Attendance Status</th>
                        <th className="px-6 py-3.5">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {roster.map((row) => (
                        <tr key={row.enrollment_id} className="hover:bg-slate-50/70 transition">
                          <td className="px-6 py-4 font-bold text-indigo-600 text-xs">{row.roll_number}</td>
                          <td className="px-6 py-4 font-semibold text-slate-800 text-xs">{row.student_name}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-3">
                              {['Present', 'Absent', 'Late'].map((statusOption) => (
                                <label
                                  key={statusOption}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition ${
                                    row.status === statusOption
                                      ? statusOption === 'Present'
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold'
                                        : statusOption === 'Absent'
                                        ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                                        : 'bg-amber-50 border-amber-300 text-amber-700 font-bold'
                                      : 'bg-slate-50/50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`status_${row.enrollment_id}`}
                                    value={statusOption}
                                    checked={row.status === statusOption}
                                    onChange={() => handleStatusChange(row.enrollment_id, statusOption)}
                                    className="hidden"
                                  />
                                  <span>{statusOption}</span>
                                </label>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={row.remarks}
                              onChange={(e) => handleRemarksChange(row.enrollment_id, e.target.value)}
                              placeholder="Optional note..."
                              className="w-full px-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Submit Toolbar */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Total Students in Roster: <span className="font-bold text-slate-800">{roster.length}</span>
                  </span>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSaveAttendance}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition shadow-sm disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Recording Attendance...' : 'Save Daily Attendance'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

