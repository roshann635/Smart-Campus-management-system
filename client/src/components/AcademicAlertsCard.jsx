import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { AlertTriangle, UserCheck, ShieldAlert, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AcademicAlertsCard() {
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/system/academic-alerts');
      if (res.data?.success) {
        setAlerts(res.data.data);
      }
    } catch (err) {
      // Non-critical, ignore if permissions don't allow
    } finally {
      setLoading(false);
    }
  };

  if (loading || !alerts) return null;

  const { attendanceDeficits = [], unassignedCourses = [], academicPerformanceAlerts = [] } = alerts;
  const totalAlerts = attendanceDeficits.length + unassignedCourses.length + academicPerformanceAlerts.length;

  if (totalAlerts === 0) return null;

  return (
    <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white flex-shrink-0 shadow-sm shadow-amber-200">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
              Academic Early Warning & Retention Alerts
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">
                {totalAlerts} Attention Needed
              </span>
            </h3>
            <p className="text-xs text-amber-700 mt-0.5">
              Proactive retention monitor identifying students below the 75% attendance threshold or unassigned courses.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        {/* Attendance Deficit Items */}
        {attendanceDeficits.map((item, idx) => (
          <div
            key={idx}
            className="p-3 bg-white rounded-xl border border-amber-200 shadow-sm flex items-center justify-between gap-3 text-xs"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">{item.student_name}</span>
                <span className="font-mono text-[10px] text-slate-400">({item.roll_number})</span>
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {item.course_code}: {item.attended_sessions}/{item.total_sessions} classes attended
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="inline-block px-2 py-0.5 rounded-md font-extrabold text-rose-700 bg-rose-100 text-[11px]">
                {item.attendance_rate}% Attendance
              </span>
              <span className="block text-[9px] text-rose-600 font-semibold mt-0.5">
                Deficit (&lt;75%)
              </span>
            </div>
          </div>
        ))}

        {/* Unassigned Courses */}
        {unassignedCourses.map((c) => (
          <div
            key={c.course_id}
            className="p-3 bg-white rounded-xl border border-amber-200 shadow-sm flex items-center justify-between gap-3 text-xs"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">{c.course_code} - {c.course_name}</span>
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Semester {c.semester} • {c.credits} Credits
              </p>
            </div>
            <Link
              to="/courses"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 flex-shrink-0"
            >
              Assign Faculty <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

