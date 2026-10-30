import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import AcademicAlertsCard from '../components/AcademicAlertsCard';
import { formatDate } from '../utils/formatters';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  BookOpen,
  GraduationCap,
  Award,
  CalendarCheck,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Calculator,
  IdCard,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/summary');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading dashboard analytics..." />;
  if (error) return <div className="p-6 text-rose-600 bg-rose-50 rounded-xl">{error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 rounded-2xl p-6 text-white shadow-md shadow-indigo-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">
            Welcome back, {user.first_name} {user.last_name}!
          </h2>
          <p className="text-indigo-200 text-xs sm:text-sm mt-1">
            {user.role === 'administrator' && 'Full institutional oversight, DBMS management, and audit log monitoring.'}
            {user.role === 'faculty' && `Department of ${user.department_name || 'Instruction'}. Assigned course activities.`}
            {user.role === 'student' && `Roll No: ${user.roll_number} • Department of ${user.department_name || 'Engineering'}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {user.role === 'student' && (
            <Link
              to="/profile"
              className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-md transition flex items-center gap-1 border border-white/20"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Digital ID Card</span>
            </Link>
          )}
          <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wider uppercase border border-white/20">
            Role: {user.role}
          </div>
        </div>
      </div>

      {/* Proactive Academic Retention & Alerts Banner (Admin & Faculty) */}
      {(data.role === 'administrator' || data.role === 'faculty') && (
        <AcademicAlertsCard />
      )}

      {/* 1. ADMIN DASHBOARD */}
      {data.role === 'administrator' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Students" value={data.stats.totalStudents} icon={GraduationCap} color="indigo" />
            <StatCard title="Faculty Members" value={data.stats.totalFaculty} icon={Users} color="purple" />
            <StatCard title="Active Courses" value={data.stats.totalCourses} icon={BookOpen} color="amber" />
            <StatCard title="Overall Attendance" value={`${data.stats.overallAttendanceRate}%`} icon={CalendarCheck} color="emerald" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart: Student Distribution by Department */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Student Distribution by Department
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.departmentDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="code" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(val) => [val, 'Students']}
                    />
                    <Bar dataKey="student_count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Audit Feed */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-purple-600" />
                    Recent Audit Feed
                  </h3>
                  <Link to="/audit-logs" className="text-xs text-indigo-600 hover:underline font-semibold">
                    View All
                  </Link>
                </div>
                <div className="space-y-3">
                  {data.recentLogs.map((log) => (
                    <div key={log.log_id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">{log.action}</span>
                        <span className="text-[10px] text-slate-400">{formatDate(log.created_at)}</span>
                      </div>
                      <p className="text-slate-500 mt-0.5 truncate">{log.actor_email || 'System'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 2. FACULTY DASHBOARD */}
      {data.role === 'faculty' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Assigned Courses" value={data.stats.assignedCoursesCount} icon={BookOpen} color="indigo" />
            <StatCard title="Enrolled Students" value={data.stats.totalEnrolledStudents} icon={Users} color="emerald" />
            <StatCard title="Exams Scheduled" value={data.stats.examsScheduled} icon={Award} color="amber" />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
              My Assigned Courses & Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.assignedCourses.map((c) => (
                <div key={c.course_id} className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors bg-slate-50/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {c.course_code}
                      </span>
                      <h4 className="text-base font-bold text-slate-800 mt-1">{c.course_name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Semester {c.semester} • {c.credits} Credits • {c.enrolled_students} Students Enrolled
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-2">
                    <Link
                      to="/attendance"
                      className="text-xs font-semibold px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                    >
                      Record Attendance
                    </Link>
                    <Link
                      to="/exams-results"
                      className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition"
                    >
                      Enter Marks
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 3. STUDENT DASHBOARD */}
      {data.role === 'student' && (() => {
        const attPct = data.stats.overallAttendancePercent;
        const isSafe = attPct >= 75;
        // Calculation of classes required or safe leaves:
        // Total classes & attended classes from summary
        let total = 0;
        let attended = 0;
        (data.attendanceSummary || []).forEach((a) => {
          total += Number(a.total_classes || 0);
          attended += Number(a.classes_attended || 0);
        });

        // If attendance < 75%: (attended + x) / (total + x) >= 0.75  =>  x >= (0.75*total - attended) / 0.25 = 3*total - 4*attended
        const classesNeeded = Math.max(0, Math.ceil(3 * total - 4 * attended));
        // If attendance >= 75%: attended / (total + y) >= 0.75 => y <= (attended - 0.75*total) / 0.75 = (4*attended - 3*total) / 3
        const safeMiss = Math.max(0, Math.floor((4 * attended - 3 * total) / 3));

        return (
          <>
            {/* Attendance Clearance & Examination Eligibility Meter */}
            <div
              className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isSafe
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-rose-50/70 border-rose-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isSafe ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  {isSafe ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-bold ${isSafe ? 'text-emerald-900' : 'text-rose-900'}`}>
                      {isSafe ? 'Eligible for Final Examination Clearance' : 'Mandatory Attendance Deficit Warning'}
                    </h3>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isSafe ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
                      }`}
                    >
                      {attPct}% vs 75% Rule
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${isSafe ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {isSafe
                      ? `Your attendance is in the safe zone. You can miss up to ${safeMiss} upcoming lectures and still maintain eligibility.`
                      : `Your attendance is below the university 75% cutoff. You must attend ${classesNeeded} consecutive upcoming classes to regain exam clearance.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/attendance"
                  className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  View Attendance History
                </Link>
                <Link
                  to="/profile"
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition"
                >
                  Digital Student Card
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <StatCard title="Overall Attendance" value={`${data.stats.overallAttendancePercent}%`} icon={CalendarCheck} color="emerald" />
              <StatCard title="Cumulative GPA" value={data.stats.cumulativeGpa} icon={Award} color="indigo" />
              <StatCard title="Enrolled Courses" value={data.stats.enrolledCoursesCount} icon={BookOpen} color="amber" />
              <StatCard title="Credits Earned" value={data.stats.totalCredits} icon={TrendingUp} color="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Course Attendance Breakdown */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
                  Course Attendance Breakdown
                </h3>
                <div className="space-y-4">
                  {data.attendanceSummary.length === 0 ? (
                    <p className="text-xs text-slate-400">No attendance records found.</p>
                  ) : (
                    data.attendanceSummary.map((att) => (
                      <div key={att.course_id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex justify-between items-center text-xs mb-1.5">
                          <span className="font-semibold text-slate-700">{att.course_code} - {att.course_name}</span>
                          <span className="font-bold text-slate-800">{att.attendance_percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${
                              att.attendance_percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(att.attendance_percentage, 100)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Attended {att.classes_attended} of {att.total_classes} classes
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Exam Results */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
                  Recent Exam Results
                </h3>
                <div className="space-y-3">
                  {data.recentResults.length === 0 ? (
                    <p className="text-xs text-slate-400">No graded exam results recorded yet.</p>
                  ) : (
                    data.recentResults.map((r) => (
                      <div key={r.result_id} className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-slate-800">{r.course_code}: {r.exam_name}</p>
                          <p className="text-slate-500 text-[11px]">Marks: {r.marks_obtained} / {r.max_marks}</p>
                        </div>
                        <StatusBadge status={r.grade} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}

