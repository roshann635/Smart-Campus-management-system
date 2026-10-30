import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import DigitalStudentCard from '../components/DigitalStudentCard';
import { formatDate } from '../utils/formatters';
import { ArrowLeft, GraduationCap, Mail, Phone, MapPin, Calendar, Award, BookOpen, IdCard } from 'lucide-react';

export default function StudentDetailPage() {
  const { id } = useParams();
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showIdCard, setShowIdCard] = useState(false);

  useEffect(() => {
    fetchDossier();
  }, [id]);

  const fetchDossier = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/students/${id}/dossier`);
      if (res.data?.success) {
        setDossier(res.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch student academic dossier.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading student academic dossier..." />;
  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl space-y-3">
        <p className="font-semibold">{error}</p>
        <Link to="/students" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Return to Roster
        </Link>
      </div>
    );
  }
  if (!dossier) return null;

  const { student, enrollments, attendance, results, metrics } = dossier;

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/students"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {student.first_name} {student.last_name}
            </h2>
            <p className="text-xs text-slate-400">Roll No: {student.roll_number} • Comprehensive Academic Dossier</p>
          </div>
        </div>

        <button
          onClick={() => setShowIdCard(!showIdCard)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition border border-indigo-200"
        >
          <GraduationCap className="w-4 h-4" />
          <span>{showIdCard ? 'Hide ID Card' : 'Digital ID Card'}</span>
        </button>
      </div>

      {showIdCard && (
        <DigitalStudentCard student={student} />
      )}

      {/* Profile Overview Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-slate-400">Personal Information</p>
          <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            {student.department_name} ({student.department_code})
          </p>
          <p className="text-xs text-slate-600 flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400" />
            {student.email}
          </p>
          {student.phone && (
            <p className="text-xs text-slate-600 flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              {student.phone}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-slate-400">Enrollment & Status</p>
          <p className="text-xs text-slate-600 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            Enrolled: {student.enrollment_year} • DOB: {formatDate(student.dob)}
          </p>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-slate-500">Account Status:</span>
            <StatusBadge status={student.status} />
          </div>
          {student.address && (
            <p className="text-xs text-slate-500 flex items-start gap-2 pt-1">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{student.address}</span>
            </p>
          )}
        </div>

        <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex flex-col justify-center text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cumulative GPA</p>
          <p className="text-3xl font-extrabold text-indigo-600 mt-1">{metrics.gpa}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{metrics.totalCreditsCompleted} Credits Completed</p>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-600" />
          Attendance Performance by Course
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {attendance.length === 0 ? (
            <p className="text-xs text-slate-400 col-span-3">No attendance data recorded.</p>
          ) : (
            attendance.map((att) => (
              <div key={att.course_id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-xs text-slate-800">{att.course_code}</span>
                  <span className={`text-xs font-bold ${att.attendance_percentage >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {att.attendance_percentage}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mb-2">{att.course_name}</p>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${att.attendance_percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: `${Math.min(att.attendance_percentage, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  {att.classes_attended} / {att.total_classes} classes attended
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Exam Results Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          Examinations & Standardized Grades
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Course</th>
                <th className="px-4 py-2.5">Exam Name</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5 text-center">Score / Max</th>
                <th className="px-4 py-2.5 text-center">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400">No exam results recorded.</td>
                </tr>
              ) : (
                results.map((r) => (
                  <tr key={r.result_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{r.course_code} - {r.course_name}</td>
                    <td className="px-4 py-3">{r.exam_name}</td>
                    <td className="px-4 py-3">{r.exam_type}</td>
                    <td className="px-4 py-3 text-center font-mono font-medium">{r.marks_obtained} / {r.max_marks}</td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={r.grade} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

