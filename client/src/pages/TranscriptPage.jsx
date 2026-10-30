import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  GraduationCap,
  Printer,
  ShieldCheck,
  Award,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  FileCheck2,
  Search,
} from 'lucide-react';

export default function TranscriptPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Admin student selector
  const [studentIdInput, setStudentIdInput] = useState(id || user.student_id || 1);

  const targetStudentId = id || (user.role === 'student' ? user.student_id : studentIdInput);

  useEffect(() => {
    if (targetStudentId) {
      fetchTranscript(targetStudentId);
    }
  }, [targetStudentId]);

  const fetchTranscript = async (sid) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/students/${sid}/transcript`);
      if (res.data?.success) {
        setTranscript(res.data.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve academic transcript.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <LoadingSpinner size="lg" text="Retrieving official academic transcript..." />;

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-rose-700 text-sm">
        <h3 className="font-bold mb-1">Transcript Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!transcript) return null;

  const { student, semesters = [], summary = {} } = transcript;

  return (
    <div className="space-y-6">
      {/* Action Bar (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-600" />
            Official Academic Transcript
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Credit-weighted SGPA/CGPA evaluation with cryptographic SHA-256 integrity seal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user.role !== 'student' && (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Student ID:</span>
              <input
                type="number"
                min="1"
                value={studentIdInput}
                onChange={(e) => setStudentIdInput(e.target.value)}
                className="w-14 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 font-bold font-mono text-center focus:outline-none"
              />
              <button
                onClick={() => fetchTranscript(studentIdInput)}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Go
              </button>
            </div>
          )}

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            Print Official Grade Card
          </button>
        </div>
      </div>

      {/* PRINTABLE TRANSCRIPT DOCUMENT */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-10 max-w-4xl mx-auto print:shadow-none print:border-none print:p-0">
        {/* Document Header & Seal */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-bold">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">
                    Smart Campus University
                  </h1>
                  <p className="text-[11px] font-semibold text-slate-500 tracking-wide uppercase">
                    Office of the Controller of Examinations • Autonomous Grade Record
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200 uppercase tracking-widest">
                Official Transcript
              </span>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                Issued: {new Date(summary.issuedAt || Date.now()).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Student Profile Meta Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Candidate Name</span>
              <span className="font-bold text-slate-900 text-sm">{student.first_name} {student.last_name}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Roll Number</span>
              <span className="font-bold font-mono text-slate-900 text-sm">{student.roll_number}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Department</span>
              <span className="font-bold text-slate-900 text-xs">{student.department_name}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Enrollment Year</span>
              <span className="font-bold font-mono text-slate-900 text-xs">{student.enrollment_year}</span>
            </div>
          </div>
        </div>

        {/* Semester Modules */}
        <div className="space-y-6">
          {semesters.map((sem, idx) => (
            <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800">
                  Semester {sem.semester} <span className="font-normal text-slate-500">({sem.academic_year})</span>
                </span>
                <span className="font-bold text-indigo-700">
                  SGPA: <span className="font-mono text-sm">{sem.sgpa.toFixed(2)}</span>
                </span>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-2 px-3 w-24">Code</th>
                    <th className="py-2 px-3">Course Title</th>
                    <th className="py-2 px-3 text-center w-16">Credits</th>
                    <th className="py-2 px-3 text-center w-16">Marks</th>
                    <th className="py-2 px-3 text-center w-16">Grade</th>
                    <th className="py-2 px-3 text-center w-16">Grade Pt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sem.courses.map((crs, cIdx) => (
                    <tr key={cIdx} className="hover:bg-slate-50/30">
                      <td className="py-2 px-3 font-mono font-bold text-slate-700">{crs.course_code}</td>
                      <td className="py-2 px-3 text-slate-800 font-medium">{crs.course_name}</td>
                      <td className="py-2 px-3 text-center font-mono">{crs.credits}</td>
                      <td className="py-2 px-3 text-center font-mono">{crs.marks != null ? crs.marks : '-'}</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                          crs.grade === 'O' || crs.grade === 'A+' ? 'text-emerald-700 bg-emerald-50' :
                          crs.grade === 'F' ? 'text-rose-700 bg-rose-50' : 'text-slate-700 bg-slate-100'
                        }`}>
                          {crs.grade}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-slate-700">
                        {crs.grade_point?.toFixed(1) || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-600">
                <span>Registered Credits: <strong className="font-mono">{sem.registeredCredits}</strong></span>
                <span>Earned Credits: <strong className="font-mono">{sem.earnedCredits}</strong></span>
                <span className="font-bold text-slate-800">Semester SGPA: <span className="font-mono">{sem.sgpa.toFixed(2)}</span></span>
              </div>
            </div>
          ))}
        </div>

        {/* Academic Cumulative Summary & Standing */}
        <div className="mt-8 pt-6 border-t-2 border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Cumulative Earned Credits</span>
              <span className="text-xl font-bold font-mono text-slate-900">{summary.totalEarnedCredits} / {summary.totalRegisteredCredits}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Cumulative GPA (CGPA)</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black font-mono text-indigo-700">{summary.cgpa?.toFixed(2)}</span>
                <span className="text-xs font-semibold text-slate-500">/ 10.00</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Academic Division Standing</span>
              <span className="inline-block mt-0.5 text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                {summary.academicStanding}
              </span>
            </div>
          </div>
        </div>

        {/* Tamper-Evident SHA-256 Integrity Verification Block */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Tamper-Evident Cryptographic Seal
                </h4>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-bold">
                  SHA-256
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono break-all mt-0.5">
                {summary.verificationHash}
              </p>
              <p className="text-[9px] text-slate-400 mt-0.5">
                Computed deterministically from student identifier, roll number, CGPA, and earned credits.
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="w-20 h-20 border-2 border-slate-300 rounded-xl flex items-center justify-center p-2 bg-slate-50 text-[9px] text-center text-slate-400 font-mono">
              [ OFFICIAL UNIVERSITY SEAL ]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

